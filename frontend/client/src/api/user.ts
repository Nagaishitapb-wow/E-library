import { api } from "./auth";

export function getUserProfile() {
    return api.get("/user/profile");
}

export function updateUserProfile(data: { name: string; email: string }) {
    return api.put("/user/profile", data);
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
    return api.put("/user/change-password", data);
}
