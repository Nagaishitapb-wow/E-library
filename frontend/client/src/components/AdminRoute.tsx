import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

export default function AdminRoute() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    return user && user.role === "admin" ? <Outlet /> : <Navigate to="/" />;
}
