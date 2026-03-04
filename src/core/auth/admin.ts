const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim();

export const isConfiguredAdmin = (email?: string | null) => {
  if (!adminEmail || !email) return false;

  return email.toLowerCase().trim() === adminEmail;
};

export const hasAdminConfigured = Boolean(adminEmail);
