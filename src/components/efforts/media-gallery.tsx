"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MediaGallery({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch media gallery
  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/efforts/${slug}/media`);
      const data = await res.json();
      setMedia(data?.data || []);
    } catch {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  };
  // Fetch on mount
  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = inputRef.current?.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData();
    formData.append("caption", caption);
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
    try {
      const res = await fetch(`/api/efforts/${slug}/media`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
      } else {
        setSuccess(true);
        fetchMedia();
        if (inputRef.current) inputRef.current.value = "";
        setCaption("");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {session && (
        <form onSubmit={handleUpload} className="mb-8 w-full">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Input type="file" accept="image/*" ref={inputRef} multiple className="sm:w-auto" />
            <Input
              placeholder="Add a description (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={uploading || !inputRef.current?.files?.length}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <div className="mt-2">
            {success && <span className="text-green-600 text-sm mr-3">Uploaded!</span>}
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>
      )}
      <div className="mb-2 text-gray-600 text-sm">Photos provided by effort participants. Most recent first.</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {media.length === 0 && <div className="col-span-2 md:col-span-3 text-gray-500">No photos submitted yet.</div>}
          {media.map((m) => (
            <div key={m.id} className="bg-white rounded shadow p-2 flex flex-col">
              <img src={m.url} alt={m.caption || "Effort media"} className="rounded mb-2 max-h-56 object-cover" />
              {m.caption && <div className="text-sm text-gray-800 mb-1">{m.caption}</div>}
              <div className="text-[12px] text-gray-500 mt-auto">By {m.user?.name || "Unknown"}</div>
              <div className="text-[12px] text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
