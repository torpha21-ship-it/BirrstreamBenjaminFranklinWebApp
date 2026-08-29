import { useAuth } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";
import { withApiBaseUrl } from "@/lib/api-base-url";

/**
 * Resizes and compresses an image file to a clean square / max dimension base64 string
 * Accepts files up to 5MB and compresses them for fast network transport and storage.
 */
function processImageFile(file: File, maxDimension = 600, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("File size exceeds 5MB limit"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error("Invalid image format"));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image exceeds 5MB limit");
      }

      setUploading(true);
      try {
        const base64 = await processImageFile(file, 600, 0.88);
        const res = await fetch(withApiBaseUrl("/api/user/profile-photo"), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ photoBase64: base64 }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Upload failed");
        }
        const data = await res.json();
        setPhoto(data.profilePhoto ?? base64);
      } finally {
        setUploading(false);
      }
    },
    [token]
  );

  return { photo, upload, uploading };
}
