import axios from "axios";

const API = "http://localhost:4000/api/user";

export function getUserProfile() {
    const token = localStorage.getItem("token");
    return axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export function updateUserProfile(data: { name: string; email: string }) {
    const token = localStorage.getItem("token");
    return axios.put(`${API}/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
    const token = localStorage.getItem("token");
    return axios.put(`${API}/password`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
