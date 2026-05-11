import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FormField, FieldType } from "@/lib/form-schema";
import { genId } from "@/lib/form-schema";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Teks" },
  { value: "textarea", label: "Teks panjang" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Nomor telepon" },
  { value: "number", label: "Angka" },
  { value: "date", label: "Tanggal" },
  { value: "select", label: "Pilihan (dropdown)" },
  { value: "file", label: "File / Unggah" },
];

export function FormBuilder({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  const [editing, setEditing] = useState<FormField | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(fields, oldIndex, newIndex));
  };

  const addField = () => {
    const id = genId();
    const f: FormField = {
      id,
      name: id,
      label: "Field baru",
      type: "text",
      required: false,
      standard: false,
    };
    onChange([...fields, f]);
    setEditing(f);
  };

  const updateField = (next: FormField) => {
    onChange(fields.map((f) => (f.id === next.id ? next : f)));
    setEditing(next);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {fields.map((f) => (
              <SortableRow key={f.id} field={f} onEdit={() => setEditing(f)} onRemove={() => removeField(f.id)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={addField} className="w-full">
        <Plus className="h-4 w-4 mr-1" /> Tambah Field
      </Button>

      {editing && (
        <FieldEditor
          field={editing}
          onClose={() => setEditing(null)}
          onChange={updateField}
        />
      )}
    </div>
  );
}

function SortableRow({ field, onEdit, onRemove }: { field: FormField; onEdit: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground text-sm">{field.label}</span>
          <span className="text-[10px] uppercase rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{field.type}</span>
          {field.required && <span className="text-[10px] uppercase rounded-full bg-destructive/10 text-destructive px-2 py-0.5">Wajib</span>}
          {field.standard && <span className="text-[10px] uppercase rounded-full bg-primary/10 text-primary px-2 py-0.5">Standar</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{field.name}</div>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onEdit}><Settings2 className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

function FieldEditor({ field, onChange, onClose }: { field: FormField; onChange: (f: FormField) => void; onClose: () => void }) {
  const set = (patch: Partial<FormField>) => onChange({ ...field, ...patch });
  const isStandard = !!field.standard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-foreground">Edit Field</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>

        <div className="mt-4 space-y-3">
          <Row label="Label">
            <Input value={field.label} onChange={(e) => set({ label: e.target.value })} />
          </Row>
          <Row label="Nama field (key)">
            <Input
              value={field.name}
              disabled={isStandard}
              onChange={(e) => set({ name: e.target.value.replace(/[^a-z0-9_]/gi, "_").toLowerCase() })}
            />
            {isStandard && <p className="mt-1 text-[11px] text-muted-foreground">Field standar — nama tidak bisa diubah karena terhubung ke kolom database.</p>}
          </Row>
          <Row label="Tipe">
            <select
              value={field.type}
              disabled={isStandard}
              onChange={(e) => set({ type: e.target.value as FieldType })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Row>
          <Row label="Placeholder">
            <Input value={field.placeholder ?? ""} onChange={(e) => set({ placeholder: e.target.value })} />
          </Row>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} />
            Wajib diisi
          </label>

          {field.type === "select" && (
            <Row label="Pilihan (satu per baris)">
              <textarea
                rows={4}
                value={(field.options ?? []).join("\n")}
                onChange={(e) => set({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </Row>
          )}

          {field.type === "file" && (
            <>
              <Row label="Format diterima (mis. image/*,application/pdf)">
                <Input value={field.accept ?? ""} onChange={(e) => set({ accept: e.target.value })} />
              </Row>
              <Row label="Ukuran maksimum (MB)">
                <Input type="number" value={field.maxSize ?? 20} onChange={(e) => set({ maxSize: Number(e.target.value) || 20 })} />
              </Row>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Selesai</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  );
}
