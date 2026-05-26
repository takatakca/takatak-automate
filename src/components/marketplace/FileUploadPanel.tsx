import { useRef, useState } from "react";
import { Upload, File as FileIcon } from "lucide-react";

export function FileUploadPanel({
  onUpload,
  accept,
  hint = "PDF, images, ZIP — max 20MB per file.",
}: {
  onUpload?: (files: File[]) => void | Promise<void>;
  accept?: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<File[]>([]);
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-6">
      <div className="flex flex-col items-center text-center">
        <Upload size={22} className="text-muted-foreground" />
        <div className="mt-2 text-sm font-medium">Upload project files</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        <input
          ref={ref}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const fs = Array.from(e.target.files ?? []);
            setPicked(fs);
            void onUpload?.(fs);
          }}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="mt-4 px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary/50"
        >
          Choose files
        </button>
      </div>
      {picked.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {picked.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-muted-foreground">
              <FileIcon size={14} /> {f.name} <span className="text-xs">({Math.round(f.size / 1024)} KB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}