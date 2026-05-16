import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Upload,
  Trash2,
  Copy,
  Image as ImageIcon,
  FileIcon,
  Search,
  HardDrive,
  Download,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { compressImage, isCompressibleImage } from "@/lib/image-compress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

const BUCKET = "admin-media";

type MediaFile = {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: { size?: number; mimetype?: string } | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isImage(mime?: string, name?: string) {
  if (mime?.startsWith("image/")) return true;
  if (!name) return false;
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
}

function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [compressEnabled, setCompressEnabled] = useState(true);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/webp");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFiles((data || []).filter((f) => f.name !== ".emptyFolderPlaceholder") as MediaFile[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (list: FileList) => {
    setUploading(true);
    const qMap = { high: 0.9, medium: 0.75, low: 0.55 } as const;
    let savedBytes = 0;
    try {
      for (const original of Array.from(list)) {
        let file = original;
        if (compressEnabled && isCompressibleImage(original)) {
          file = await compressImage(original, {
            quality: qMap[quality],
            mimeType: format,
            maxWidth: 1920,
            maxHeight: 1920,
          });
          savedBytes += Math.max(0, original.size - file.size);
        }
        const ext = file.name.split(".").pop() || "bin";
        const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
        const path = `${Date.now()}-${base}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (error) throw error;
      }
      const savedMsg = savedBytes > 0 ? ` (hemat ${formatBytes(savedBytes)})` : "";
      toast.success(`${list.length} file berhasil diunggah${savedMsg}`);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (name: string) => {
    if (!confirm(`Hapus file "${name}"?`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) return toast.error(error.message);
    toast.success("File dihapus");
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const getUrl = (name: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

  const copyUrl = async (name: string) => {
    await navigator.clipboard.writeText(getUrl(name));
    toast.success("URL disalin ke clipboard");
  };

  const filtered = files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
  const totalSize = files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-primary" /> Media & File
          </h1>
          <p className="text-sm text-muted-foreground">
            Penyimpanan gambar dan file untuk kebutuhan situs. URL bersifat publik.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Unggah File
          </Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <Label htmlFor="compress-toggle" className="text-sm font-semibold cursor-pointer">
            Kompres gambar saat upload
          </Label>
          <Switch
            id="compress-toggle"
            checked={compressEnabled}
            onCheckedChange={setCompressEnabled}
            className="ml-auto"
          />
        </div>
        {compressEnabled && (
          <div className="flex flex-wrap items-center gap-3 text-sm pl-6">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Kualitas:</span>
              <Select value={quality} onValueChange={(v) => setQuality(v as typeof quality)}>
                <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Tinggi (90%)</SelectItem>
                  <SelectItem value="medium">Sedang (75%)</SelectItem>
                  <SelectItem value="low">Rendah (55%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Format:</span>
              <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/webp">WebP (ringan)</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground">
              Resize maksimum 1920px. File non-gambar diunggah apa adanya.
            </span>
          </div>
        )}
      </Card>

      <Card className="p-4 flex flex-wrap items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Total file: </span>
          <span className="font-semibold">{files.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Total ukuran: </span>
          <span className="font-semibold">{formatBytes(totalSize)}</span>
        </div>
        <div className="ml-auto relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama file..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {files.length === 0
              ? "Belum ada file. Unggah file pertama Anda."
              : "Tidak ada file yang cocok."}
          </p>
        </Card>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
        >
          {filtered.map((f) => {
            const url = getUrl(f.name);
            const img = isImage(f.metadata?.mimetype, f.name);
            return (
              <Card key={f.name} className="overflow-hidden group">
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img
                      src={url}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium truncate" title={f.name}>
                    {f.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatBytes(f.metadata?.size || 0)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => copyUrl(f.name)}
                    >
                      <Copy className="h-3 w-3 mr-1" /> URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noreferrer" download>
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => remove(f.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
