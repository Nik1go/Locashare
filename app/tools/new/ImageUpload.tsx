"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Vérifications côté client
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format non supporté. Utilisez PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }

    // Prévisualisation locale
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload vers le serveur
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors du téléversement.");
        setPreview(null);
        setUploadedUrl("");
        return;
      }

      setUploadedUrl(data.url);
    } catch {
      setError("Erreur réseau lors du téléversement.");
      setPreview(null);
      setUploadedUrl("");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setUploadedUrl("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        Photo de l&apos;outil (Optionnel)
      </label>

      {/* Champ caché pour envoyer l'URL au server action */}
      <input type="hidden" name="imageUrl" value={uploadedUrl} />

      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <Image
            src={preview}
            alt="Prévisualisation"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <span className="ml-2 text-sm font-medium text-blue-600">
                Téléversement...
              </span>
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor="imageFile"
          className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 cursor-pointer transition-colors"
        >
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              {isUploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Upload size={24} />
              )}
            </div>
            <p className="text-sm font-medium">
              Cliquez pour téléverser une image
            </p>
            <p className="text-xs text-slate-400">
              PNG, JPG ou WebP • Max 5 Mo
            </p>
          </div>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        id="imageFile"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <ImageIcon size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
