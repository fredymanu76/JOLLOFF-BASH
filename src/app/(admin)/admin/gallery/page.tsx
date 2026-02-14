"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageIcon, Plus, Trash2, Loader2, Upload } from "lucide-react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getClientStorage } from "@/lib/firebase/client";
import type { GalleryItem } from "@/types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCurrent, setUploadCurrent] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`"${oversized.name}" is too large. Maximum size is 50MB.`);
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress(0);
    setUploadCurrent(0);
    setUploadTotal(files.length);

    const newItems: GalleryItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadCurrent(i + 1);

      try {
        const storage = getClientStorage();
        const storagePath = `gallery/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        const url = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const fileProgress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              const overall = Math.round(((i + fileProgress / 100) / files.length) * 100);
              setUploadProgress(overall);
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });

        const mediaType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";

        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            storagePath,
            mediaType,
            caption: caption.trim() || undefined,
            eventDate: eventDate || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        newItems.push(data.item);
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...newItems, ...prev]);
    }

    if (errors.length > 0) {
      setError(`Failed to upload: ${errors.join(", ")}`);
    }

    setFiles([]);
    setCaption("");
    setEventDate("");
    if (errors.length === 0) setShowUpload(false);
    setUploading(false);
    setUploadProgress(0);
    setUploadCurrent(0);
    setUploadTotal(0);
  }

  async function handleDelete(id: string, storagePath: string) {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, storagePath }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ImageIcon size={28} className="text-jollof-amber" />
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-xs text-jollof-text-muted">
              Upload photos and videos from past events
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Upload
        </button>
      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="bg-jollof-surface rounded-xl p-6 border border-jollof-border mb-6">
          <h2 className="font-semibold text-lg mb-4">Upload Media</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Photos &amp; Videos
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) =>
                  setFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-jollof-amber/20 file:text-jollof-amber file:text-sm file:font-medium"
              />
              <p className="text-xs text-jollof-text-muted mt-1">
                Max 50MB per file. Select multiple files at once.
                {files.length > 0 && (
                  <span className="text-jollof-amber ml-1 font-medium">
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text placeholder:text-jollof-text-muted focus:border-jollof-amber focus:outline-none"
                  placeholder="e.g. January 2026 Supper"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Date (optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-jollof-bg border border-jollof-border rounded-lg px-4 py-2.5 text-jollof-text focus:border-jollof-amber focus:outline-none"
                />
              </div>
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between text-xs text-jollof-text-muted mb-1">
                  <span>Uploading file {uploadCurrent} of {uploadTotal}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-jollof-bg rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-jollof-amber rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading
                  ? `Uploading ${uploadCurrent}/${uploadTotal}`
                  : files.length > 1
                    ? `Upload ${files.length} Files`
                    : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="border border-jollof-border hover:border-jollof-amber text-jollof-text px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            No gallery items yet. Upload photos and videos from past events to
            showcase on the landing page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-jollof-surface rounded-xl border border-jollof-border overflow-hidden group relative"
            >
              {item.mediaType === "VIDEO" ? (
                <video
                  src={item.url}
                  muted
                  loop
                  playsInline
                  className="w-full h-48 object-cover"
                  onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.caption || "Gallery image"}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  {item.caption && (
                    <p className="text-sm font-medium truncate">
                      {item.caption}
                    </p>
                  )}
                  <p className="text-xs text-jollof-text-muted">
                    {item.mediaType === "VIDEO" ? "Video" : "Photo"}
                    {item.eventDate && ` · ${item.eventDate}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id, item.storagePath)}
                  disabled={deleting === item.id}
                  className="text-jollof-text-muted hover:text-jollof-red transition-colors p-2 rounded-lg hover:bg-jollof-red/10 disabled:opacity-50"
                  aria-label={`Delete ${item.caption || "gallery item"}`}
                >
                  {deleting === item.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
