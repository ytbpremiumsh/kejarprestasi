export type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0..1
  mimeType?: "image/jpeg" | "image/webp" | "image/png";
};

const COMPRESSIBLE = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function isCompressibleImage(file: File): boolean {
  return COMPRESSIBLE.includes(file.type.toLowerCase());
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.75, mimeType = "image/jpeg" } = opts;

  if (!isCompressibleImage(file)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  let { width, height } = bitmap;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  // White background for JPEG to avoid black transparency
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );
  if (!blob) return file;

  // If compressed is larger than original, keep original
  if (blob.size >= file.size) return file;

  const ext = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type: mimeType, lastModified: Date.now() });
}
