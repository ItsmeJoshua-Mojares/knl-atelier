// src/components/ui/CloudinaryUpload.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Unsigned Cloudinary uploads
//
// Most file uploads go: browser → your server → storage.
// Cloudinary's unsigned upload preset lets you skip your server
// entirely: browser → Cloudinary directly. Benefits:
//   1. Your Laravel server never handles the binary file data
//   2. No memory/disk concerns for large images
//   3. Cloudinary auto-optimises (WebP conversion, resizing,
//      compression) on the fly via URL parameters
//
// HOW IT WORKS:
//   1. Admin picks a file in the browser
//   2. Component POSTs it directly to Cloudinary's upload API
//   3. Cloudinary returns a secure_url (e.g. https://res.cloudinary.com/...)
//   4. We call onUpload(url) to pass that URL back to the parent
//   5. Parent saves the URL string to the product record in Laravel
//
// SETUP (Cloudinary dashboard):
//   Settings → Upload → Upload presets → Add preset
//   Set "Signing mode" = "Unsigned"
//   Note the preset name and your Cloud name
//   Set them in .env.local:
//     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
//     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface CloudinaryUploadProps {
  /** Called with the Cloudinary secure_url once upload succeeds */
  onUpload:       (url: string) => void;
  /** Current image URL (to show a preview for existing products) */
  currentImageUrl?: string;
  /** Max file size in MB (default: 5) */
  maxSizeMb?:     number;
  /** Accepted MIME types */
  accept?:        string;
}

interface CloudinaryResponse {
  secure_url:  string;
  public_id:   string;
  width:       number;
  height:      number;
  format:      string;
  bytes:       number;
}

export default function CloudinaryUpload({
  onUpload,
  currentImageUrl,
  maxSizeMb  = 5,
  accept     = "image/jpeg,image/png,image/webp",
}: CloudinaryUploadProps) {
  const [uploading, setUploading]   = useState(false);
  const [preview,   setPreview]     = useState<string | null>(currentImageUrl ?? null);
  const [error,     setError]       = useState<string | null>(null);
  const [progress,  setProgress]    = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
      return;
    }
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_* env vars.");
      return;
    }

    // Show local preview immediately (optimistic UI)
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file",           file);
      formData.append("upload_preset",  uploadPreset);
      // Optional: organise uploads into a folder
      formData.append("folder",         "knl-atelier/products");

      // XMLHttpRequest lets us track upload progress,
      // which fetch() doesn't support natively
      const response = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed — Cloudinary returned an error."));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
      });

      // Replace local blob preview with the permanent Cloudinary URL
      setPreview(response.secure_url);
      onUpload(response.secure_url);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      // Revert preview to whatever it was before
      setPreview(currentImageUrl ?? null);
    } finally {
      setUploading(false);
      setProgress(0);
      URL.revokeObjectURL(localPreview);
    }
  }, [cloudName, uploadPreset, maxSizeMb, currentImageUrl, onUpload]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  // Drag-and-drop support
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); // Required to allow drop
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative border-2 border-dashed rounded-2xl
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200 overflow-hidden
          ${uploading
            ? "border-green-mid/60 bg-green-dark/10 cursor-not-allowed"
            : "border-white/10 hover:border-green-mid/50 hover:bg-white/[0.02]"
          }
          ${preview ? "h-48" : "h-36"}
        `}
      >
        {/* Image preview */}
        {preview && (
          <Image
            src={preview}
            alt="Product image preview"
            fill
            className="object-contain p-4"
            sizes="300px"
            unoptimized={preview.startsWith("blob:")}
          />
        )}

        {/* Overlay while uploading */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-green-mid border-t-transparent rounded-full animate-spin" />
            <div className="w-32 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-green-mid rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-white">{progress}%</p>
          </div>
        )}

        {/* Empty state */}
        {!preview && !uploading && (
          <div className="text-center px-4 py-6">
            <svg className="w-10 h-10 text-gray-dark mx-auto mb-3" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="text-[13px] text-gray-mid">
              Drop image here or <span className="text-green-light">click to browse</span>
            </p>
            <p className="text-[11px] text-gray-dark mt-1">
              JPEG, PNG, WebP · max {maxSizeMb}MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[12px] text-red-400 flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Replace / clear buttons when image exists */}
      {preview && !uploading && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-3 py-1.5 transition-all"
          >
            Replace image
          </button>
          <button
            type="button"
            onClick={() => { setPreview(null); onUpload(""); }}
            className="text-[11px] font-utility font-semibold text-gray-mid hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-all"
          >
            Remove
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label="Upload product image"
      />
    </div>
  );
}
