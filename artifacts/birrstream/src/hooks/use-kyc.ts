import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";

export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";
export type KycIdType = "national" | "university";

export interface KycData {
  status: KycStatus;
  idType: KycIdType;
  frontImage: string;
  backImage: string;
  frontFileName?: string;
  backFileName?: string;
  submittedAt: string;
  userId?: string | number;
  username?: string;
  rejectionReason?: string;
}

const KYC_EVENT = "birr:kyc-updated";

function getStorageKey(userIdentifier?: string | number | null): string {
  if (userIdentifier) {
    return `birrstream_kyc_${userIdentifier}`;
  }
  return "birrstream_kyc_default";
}

/**
 * Compresses an image data URL to ensure it fits comfortably within browser localStorage quota
 */
export function compressImageDataUrl(dataUrl: string, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
          return;
        }
      } catch {
        // fallback to original
      }
      resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function useKyc() {
  const { user } = useAuth();
  const userIdKey = user?.id ? String(user.id) : user?.username || "current";

  const loadKyc = useCallback((): KycData | null => {
    try {
      const key = getStorageKey(userIdKey);
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      // Also check fallback global registration pending record if user just signed up
      const fallbackRaw = localStorage.getItem("birrstream_kyc_latest_pending");
      if (fallbackRaw) {
        const parsed: KycData = JSON.parse(fallbackRaw);
        if (parsed.username === user?.username || !parsed.userId) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON errors
    }
    return null;
  }, [userIdKey, user?.username]);

  const [kycData, setKycData] = useState<KycData | null>(loadKyc);

  useEffect(() => {
    setKycData(loadKyc());
  }, [loadKyc]);

  useEffect(() => {
    const handleUpdate = () => {
      setKycData(loadKyc());
    };
    window.addEventListener(KYC_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(KYC_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadKyc]);

  const submitKyc = useCallback(
    async ({
      idType,
      frontImage,
      backImage,
      frontFileName,
      backFileName,
    }: {
      idType: KycIdType;
      frontImage: string;
      backImage: string;
      frontFileName?: string;
      backFileName?: string;
    }) => {
      // Compress both images before persisting to localStorage
      const [compressedFront, compressedBack] = await Promise.all([
        compressImageDataUrl(frontImage, 800, 0.72),
        compressImageDataUrl(backImage, 800, 0.72),
      ]);

      const newRecord: KycData = {
        status: "pending",
        idType,
        frontImage: compressedFront,
        backImage: compressedBack,
        frontFileName,
        backFileName,
        submittedAt: new Date().toISOString(),
        userId: user?.id,
        username: user?.username,
      };

      const key = getStorageKey(userIdKey);
      try {
        localStorage.setItem(key, JSON.stringify(newRecord));
        localStorage.setItem("birrstream_kyc_latest_pending", JSON.stringify(newRecord));
      } catch (storageErr) {
        console.warn("Storage quota exceeded, storing lightweight record", storageErr);
        // Fallback storing lightweight record without full base64 if quota tight
        const lightRecord: KycData = {
          ...newRecord,
          frontImage: compressedFront.slice(0, 1000) + "...",
          backImage: compressedBack.slice(0, 1000) + "...",
        };
        try {
          localStorage.setItem(key, JSON.stringify(lightRecord));
        } catch {
          // ignore
        }
      }

      setKycData(newRecord);
      window.dispatchEvent(new CustomEvent(KYC_EVENT, { detail: newRecord }));
      return newRecord;
    },
    [userIdKey, user?.id, user?.username]
  );

  const kycStatus: KycStatus = kycData?.status || "not_submitted";
  const isPending = kycStatus === "pending";
  const isApproved = kycStatus === "approved";
  const isRejected = kycStatus === "rejected";
  const canSubmit = kycStatus === "not_submitted" || kycStatus === "rejected";

  return {
    kycData,
    kycStatus,
    isPending,
    isApproved,
    isRejected,
    canSubmit,
    submitKyc,
  };
}
