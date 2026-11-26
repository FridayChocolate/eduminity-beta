export const ROUTES = {
    LANDING: "/",
    AUTH: "/auth",
    APP: "/app",
    MATERIALS: "/app/materials",
    materialDetail: (id: string) => `/app/material/${id}`,
    UPLOAD_NOTES: "/app/upload-notes",
    PROFILE: "/app/profile",
    creatorShowcase: (idOrSlug: string) => `/creator/${idOrSlug}`,
    UPDATES: "/app/updates",
    NOTIFICATIONS: "/app/notifications",
    ADMIN: "/admin",
  } as const;