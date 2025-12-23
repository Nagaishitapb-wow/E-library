import axios from "axios";

const API = "https://e-library-jtx2.onrender.com/api/user";

export function getUserProfile() {
    return axios.get(`${API}/profile`, {
        withCredentials: true
    });
}

export function updateUserProfile(data: { name: string; email: string }) {
    return axios.put(`${API}/profile`, data, {
        withCredentials: true
    });
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
    return axios.put(`${API}/password`, data, {
        withCredentials: true
    });
}
