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
    ({
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
      const newRecord: KycData = {
        status: "pending",
        idType,
        frontImage,
        backImage,
        frontFileName,
        backFileName,
        submittedAt: new Date().toISOString(),
        userId: user?.id,
        username: user?.username,
      };

      const key = getStorageKey(userIdKey);
      localStorage.setItem(key, JSON.stringify(newRecord));
      localStorage.setItem("birrstream_kyc_latest_pending", JSON.stringify(newRecord));

      setKycData(newRecord);
      window.dispatchEvent(new CustomEvent(KYC_EVENT, { detail: newRecord }));
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
