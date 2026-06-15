"use client";

import * as React from "react";
import { ImageIcon, UploadCloud, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

interface UploadDropzoneProps {
  onFileSelected: (file: File, dataUrl: string) => void;
  onClear?: () => void;
  previewUrl?: string | null;
  fileName?: string | null;
}

export function UploadDropzone({
  onFileSelected,
  onClear,
  previewUrl,
  fileName,
}: UploadDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = React.useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        setError("Unsupported format. Use JPG, JPEG, PNG or WEBP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("File too large. Maximum size is 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onFileSelected(file, reader.result as string);
      reader.readAsDataURL(file);
    },
    [onFileSelected],
  );

  if (previewUrl) {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="flex items-center gap-2 text-body text-muted-foreground">
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            {fileName ?? "Uploaded design"}
          </span>
          {onClear ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Remove uploaded image"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          ) : null}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Uploaded email design preview"
          className="mx-auto max-h-[480px] w-auto rounded-lg border border-border"
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card px-6 py-14 text-center transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging && "border-foreground/50 bg-muted/50",
        )}
        aria-label="Upload an email design image"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <span className="text-semi-header">Drag and drop your design</span>
        <span className="text-body text-muted-foreground">
          or click to browse — JPG, JPEG, PNG, WEBP (max 8MB)
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error ? (
        <p role="alert" className="mt-2 text-body text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}
