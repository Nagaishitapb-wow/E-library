import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, changePassword } from "../api/user";
import { validatePassword } from "../utils/validation";
import { toast } from "react-toastify";
import "../styles/profile.css";

interface UserProfile {
    user: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
    };
    statistics: {
        totalBorrowed: number;
        currentlyBorrowed: number;
        totalFines: number;
        wishlistCount: number;
    };
}

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // Edit form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await getUserProfile();
            setProfile(res.data);
            setName(res.data.user.name);
            setEmail(res.data.user.email);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        try {
            await updateUserProfile({ name, email });
            toast.success("Profile updated successfully!");
            setProfile(prev => prev ? { ...prev, user: { ...prev.user, name, email } } : null);
            setEditMode(false);

            // Update localStorage
            const userJson = localStorage.getItem("user");
            if (userJson) {
                const user = JSON.parse(userJson);
                user.name = name;
                user.email = email;
                localStorage.setItem("user", JSON.stringify(user));
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        const pwdError = validatePassword(newPassword);
        if (pwdError) {
            toast.error(pwdError);
            return;
        }

        try {
            await changePassword({ oldPassword, newPassword });
            toast.success("Password changed successfully!");
            setShowPasswordForm(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to change password");
        }
    }

    if (loading) return <h2 className="loading">Loading profile...</h2>;
    if (!profile) return <h2 className="loading">Profile not found</h2>;

    return (
        <div className="profile-container">
            <h1>My Profile</h1>

            {/* Profile Information */}
            <div className="profile-card">
                <h2>Account Information</h2>

                {!editMode ? (
                    <div className="profile-view">
                        <div className="profile-field">
                            <label>Name:</label>
                            <span>{profile.user.name}</span>
                        </div>
                        <div className="profile-field">
                            <label>Email:</label>
                            <span>{profile.user.email}</span>
                        </div>
                        <div className="profile-field">
                            <label>Member Since:</label>
                            <span>
                                {profile.user.createdAt
                                    ? new Date(profile.user.createdAt).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>
                        <button className="btn primary" onClick={() => setEditMode(true)}>
                            Edit Profile
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateProfile} className="profile-edit">
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn primary">Save Changes</button>
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => {
                                    setEditMode(false);
                                    setName(profile.user.name);
                                    setEmail(profile.user.email);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Statistics */}
            <div className="profile-card">
                <h2>Account Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-value">{profile.statistics.totalBorrowed}</div>
                        <div className="stat-label">Total Books Borrowed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{profile.statistics.currentlyBorrowed}</div>
                        <div className="stat-label">Currently Borrowed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">₹{profile.statistics.totalFines}</div>
                        <div className="stat-label">Active Fines</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">{profile.statistics.wishlistCount}</div>
                        <div className="stat-label">Wishlist Items</div>
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="profile-card">
                <h2>Change Password</h2>

                {!showPasswordForm ? (
                    <button className="btn secondary" onClick={() => setShowPasswordForm(true)}>
                        Change Password
                    </button>
                ) : (
                    <form onSubmit={handleChangePassword} className="password-form">
                        <div className="form-group">
                            <label>Current Password:</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn primary">Update Password</button>
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setOldPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div >
    );
}
