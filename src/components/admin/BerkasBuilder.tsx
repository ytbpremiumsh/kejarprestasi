import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DocSlot } from "@/lib/form-schema";
import { genId } from "@/lib/form-schema";

export function BerkasBuilder({ fields, onChange }: { fields: DocSlot[]; onChange: (f: DocSlot[]) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = fields.findIndex((f) => f.id === active.id);
    const newI = fields.findIndex((f) => f.id === over.id);
    if (oldI < 0 || newI < 0) return;
    onChange(arrayMove(fields, oldI, newI));
  };
  const update = (id: string, patch: Partial<DocSlot>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));
  const add = () => {
    const id = genId("d");
    onChange([...fields, { id, key: id, label: "Berkas baru", required: false, accept: "image/*,application/pdf", maxSize: 20 }]);
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {fields.map((f) => (
              <Row key={f.id} field={f} onChange={(p) => update(f.id, p)} onRemove={() => remove(f.id)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4 mr-1" /> Tambah Berkas
      </Button>
    </div>
  );
}

function Row({ field, onChange, onRemove }: { field: DocSlot; onChange: (p: Partial<DocSlot>) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <li ref={setNodeRef} style={style} className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none">
          <GripVertical className="h-5 w-5" />
        </button>
        <Input value={field.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Nama berkas" className="flex-1" />
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 grid sm:grid-cols-3 gap-2">
        <Input value={field.accept ?? ""} onChange={(e) => onChange({ accept: e.target.value })} placeholder="Format (mis. image/*,application/pdf)" />
        <Input
          type="number"
          value={field.maxSize ?? 20}
          onChange={(e) => onChange({ maxSize: Number(e.target.value) || 20 })}
          placeholder="Maks MB"
        />
        <label className="flex items-center gap-2 text-xs text-foreground/80 px-2">
          <input type="checkbox" checked={!!field.required} onChange={(e) => onChange({ required: e.target.checked })} />
          Wajib diisi
        </label>
      </div>
    </li>
  );
}
