/**
 * Validates a password based on common security requirements.
 * @param pwd The password string to validate.
 * @returns An error message string if invalid, or null if valid.
 */
export function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(pwd)) return "Password must contain a special character (!@#$%^&*)";
    return null; // means valid
}
