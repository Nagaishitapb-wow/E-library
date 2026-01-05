import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import ConfirmModal from "./ConfirmModal";
import Loader from "./Loader";

interface Category {
    _id: string;
    name: string;
    description?: string;
}

export default function AdminCategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "" });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get("/categories?page=1&limit=100");
            setCategories(res.data.data || res.data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, formData);
                toast.success("Category updated successfully");
            } else {
                await api.post("/categories", formData);
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

    const openDeleteModal = (id: string) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await api.delete(`/categories/${categoryToDelete}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        } finally {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
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
                    {loading ? (
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                                <Loader message="Fetching categories..." />
                            </td>
                        </tr>
                    ) : categories.length === 0 ? (
                        <tr>
                            <td colSpan={3} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                No categories found.
                            </td>
                        </tr>
                    ) : (
                        categories.map(cat => (
                            <tr key={cat._id}>
                                <td>{cat.name}</td>
                                <td>{cat.description || "-"}</td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => openEditModal(cat)}>Edit</button>
                                    <button className="action-btn delete-btn" onClick={() => openDeleteModal(cat._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showModal && createPortal(
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
                            <div className="form-actions" style={{ marginTop: "20px" }}>
                                <button type="submit" className="add-btn" style={{ marginBottom: 0 }}>Save</button>
                                <button
                                    type="button"
                                    className="btn secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Category"
                message="Are you sure you want to delete this category? All books previously in this category will remain, but the category itself will be removed."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}
