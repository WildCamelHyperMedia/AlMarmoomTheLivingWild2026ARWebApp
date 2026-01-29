const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("activitySessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("activitySessionId", sessionId);
  }
  return sessionId;
};

const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export type ActivityType = 
  | "qr_scan" 
  | "video_watch" 
  | "ar_view" 
  | "registration" 
  | "login"
  | "page_view";

interface LogActivityParams {
  activityType: ActivityType;
  animalId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity({ activityType, animalId, metadata }: LogActivityParams): Promise<void> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    const authToken = getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    await fetch("/api/activity", {
      method: "POST",
      headers,
      body: JSON.stringify({
        activityType,
        animalId,
        metadata,
        sessionId: getSessionId(),
      }),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function trackVideoWatch(animalId: string, animalName?: string): void {
  logActivity({
    activityType: "video_watch",
    animalId,
    metadata: animalName ? { animalName } : undefined,
  });
}

export function trackARView(animalId: string, animalName?: string): void {
  logActivity({
    activityType: "ar_view",
    animalId,
    metadata: animalName ? { animalName } : undefined,
  });
}

export function trackQRScan(animalId: string, qrCode?: string): void {
  logActivity({
    activityType: "qr_scan",
    animalId,
    metadata: qrCode ? { qrCode } : undefined,
  });
}

export function trackRegistration(email?: string): void {
  logActivity({
    activityType: "registration",
    metadata: email ? { email } : undefined,
  });
}

export function trackLogin(email?: string): void {
  logActivity({
    activityType: "login",
    metadata: email ? { email } : undefined,
  });
}
