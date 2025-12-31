
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

/**
 * Constructs the full URL for an image.
 * @param path - The image path from the database (relative or absolute).
 * @returns The fully qualified URL usable by the frontend.
 */
export const getImageUrl = (path: string | undefined): string => {
    if (!path) return "";

    // If it's a placeholder or external URL, return as is (but upgrade HTTP to HTTPS)
    if (path.startsWith("http") || path.startsWith("data:")) {
        let securePath = path;

        // Auto-upgrade insecure HTTP links to HTTPS
        if (securePath.startsWith("http://") && !securePath.includes("localhost")) {
            securePath = securePath.replace("http://", "https://");
        }

        // OPTIONAL: Fix legacy localhost URLs on the fly for mobile users
        // If the stored URL is 'http://localhost:4000/...' but we are on a mobile
        // device where localhost is unreachable, we replace it with the current BASE_URL.
        if (securePath.includes("localhost:4000") && !BASE_URL.includes("localhost:4000")) {
            return securePath.replace("http://localhost:4000", BASE_URL);
        }
        return securePath;
    }

    // DYNAMIC HOST DETECTION
    // If we simply use BASE_URL as is (which defaults to localhost in dev), it breaks on mobile.
    // We try to guess the real backend URL by using the current window hostname.
    let resolvedBaseUrl = BASE_URL;

    if (typeof window !== 'undefined' && BASE_URL.includes("localhost") && !window.location.hostname.includes("localhost")) {
        // If config says localhost, but we are on an IP (e.g. 192.168.x.x), swap localhost for that IP
        resolvedBaseUrl = BASE_URL.replace("localhost", window.location.hostname);
    }

    // Remove any leading slash to avoid double slashes if BASE_URL has one (though usually it doesn't)
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // Combine base URL and path
    // Remove trailing slash from BASE_URL if present
    const cleanBaseUrl = resolvedBaseUrl.replace(/\/$/, "");

    return `${cleanBaseUrl}${cleanPath}`;
};
