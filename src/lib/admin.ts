// Admin configuration
// Add email addresses of admin users here
export const ADMIN_EMAILS = [
    "jszopin@gmail.com",
];

export function isAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
