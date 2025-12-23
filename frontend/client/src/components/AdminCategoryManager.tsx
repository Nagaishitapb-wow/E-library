import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Category {
    _id: string;
    name: string;
    description?: string;
}

export default function AdminCategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    const fetchCategories = async () => {
        try {
            const res = await axios.get("https://e-library-jtx2.onrender.com/api/categories");
            setCategories(res.data);
        } catch (error) {
            toast.error("Failed to load categories");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (editingCategory) {
                await axios.put(
                    `https://e-library-jtx2.onrender.com/api/categories/${editingCategory._id}`,
                    formData,
                    { headers }
                );
                toast.success("Category updated successfully");
            } else {
                await axios.post("https://e-library-jtx2.onrender.com/api/categories", formData, { headers });
                toast.success("Category created successfully");
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`https://e-library-jtx2.onrender.com/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Category deleted");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || "" });
        setShowModal(true);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Categories</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: "", description: "" });
                        setShowModal(true);
                    }}
                >
                    + Add Category
                </button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(cat => (
                        <tr key={cat._id}>
                            <td>{cat.name}</td>
                            <td>{cat.description || "-"}</td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => openEditModal(cat)}>Edit</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(cat._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" className="add-btn" style={{ marginBottom: 0 }}>Save</button>
                                <button
                                    type="button"
                                    className="action-btn"
                                    style={{ background: "#9ca3af", color: "white" }}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
