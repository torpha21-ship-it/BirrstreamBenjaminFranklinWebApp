import { useAuth } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useProfilePhoto(serverPhoto?: string | null) {
  const { token } = useAuth();
  const [photo, setPhoto] = useState<string | null>(serverPhoto ?? null);
  const [uploading, setUploading] = useState(false);

  // Sync when the server-side profile data arrives (it loads asynchronously)
  useEffect(() => {
    if (serverPhoto) setPhoto(serverPhoto);
  }, [serverPhoto]);

  const upload = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      return new Promise<void>((resolve, reject) => {
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          setUploading(true);
          try {
            const res = await fetch(`${BASE}/api/user/profile-photo`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ photoBase64: base64 }),
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            setPhoto(data.profilePhoto ?? base64);
            resolve();
          } catch (err) {
            reject(err);
          } finally {
            setUploading(false);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    [token]
  );

  return { photo, upload, uploading };
}
