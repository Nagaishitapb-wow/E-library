import { api } from "./auth";

const API = "https://e-library-jtx2.onrender.com/api/user";

export function getUserProfile() {
    return api.get(`${API}/profile`, {
        withCredentials: true
    });
}

export function updateUserProfile(data: { name: string; email: string }) {
    return api.put(`${API}/profile`, data, {
        withCredentials: true
    });
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
    return api.put(`${API}/password`, data, {
        withCredentials: true
    });
}
