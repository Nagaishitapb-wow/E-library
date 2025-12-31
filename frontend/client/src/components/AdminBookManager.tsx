import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import { getImageUrl } from "../utils/imageUrl";

interface Book {
    _id: string;
    title: string;
    author: string;
    stock: number;
    category?: { _id: string; name: string };
    price: number;
    status: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Category {
    _id: string;
    name: string;
}

export default function AdminBookManager() {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);

    const BOOKS_PER_PAGE = 20;

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        description: "",
        stock: 1,
        price: 0,
        category: "",
        status: "available",
        coverImage: "",
        pdfUrl: ""
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append("cover", file);

        try {
            setIsUploading(true);
            const res = await api.post("/upload/cover", uploadFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData(prev => ({ ...prev, coverImage: res.data.url }));
            toast.success("Image uploaded!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await api.get(`/books?page=${currentPage}&limit=${BOOKS_PER_PAGE}`);
            setBooks(res.data.data || res.data);
            setPagination(res.data.pagination);
        } catch {
            toast.error("Failed to load books");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories?page=1&limit=100");
            setCategories(res.data.data || res.data);
        } catch {
            console.error("Failed to load categories");
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [currentPage]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingBook) {
                await api.put(`/books/${editingBook._id}`, formData);
                toast.success("Book updated");
            } else {
                await api.post("/books", formData);
                toast.success("Book created");
            }
            setShowModal(false);
            fetchBooks();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this book?")) return;
        try {
            await api.delete(`/books/${id}`);
            toast.success("Book deleted");
            fetchBooks();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const openAddModal = () => {
        setEditingBook(null);
        setFormData({
            title: "",
            author: "",
            description: "",
            stock: 5,
            price: 0,
            category: categories[0]?._id || "",
            status: "available",
            coverImage: "",
            pdfUrl: ""
        });
        setShowModal(true);
    };

    const openEditModal = (book: Book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            description: (book as any).description || "",
            stock: book.stock,
            price: book.price || 0,
            category: book.category?._id || "",
            status: book.status,
            coverImage: (book as any).coverImage || "",
            pdfUrl: (book as any).pdfUrl || ""
        });
        setShowModal(true);
    };

    // Client-side search filter for current page
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <div className="admin-header-row">
                <h2>Books Library</h2>
                <div className="admin-actions-row">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        className="admin-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="add-btn" onClick={openAddModal}>+ Add Book</button>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.map(book => (
                        <tr key={book._id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.category?.name || "N/A"}</td>
                            <td>{book.stock}</td>
                            <td>
                                <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: book.stock > 0 ? "#d1fae5" : "#fee2e2",
                                    color: book.stock > 0 ? "#065f46" : "#991b1b",
                                    fontSize: "0.85rem"
                                }}>
                                    {book.stock > 0 ? "Available" : "Out of Stock"}
                                </span>
                            </td>
                            <td>
                                <button className="action-btn edit-btn" onClick={() => openEditModal(book)}>Edit</button>
                                <button className="action-btn delete-btn" onClick={() => handleDelete(book._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                No books found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: "30px",
                    padding: "20px",
                    background: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)"
                }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: "10px 20px",
                            background: currentPage === 1 ? "var(--bg-soft)" : "var(--primary)",
                            color: currentPage === 1 ? "var(--text-muted)" : "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        ← Previous
                    </button>

                    <div style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "var(--text-main)",
                        textAlign: "center"
                    }}>
                        Page {currentPage} of {pagination.totalPages}
                        <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            fontWeight: "500",
                            marginTop: "4px"
                        }}>
                            ({pagination.total} total books)
                        </div>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        style={{
                            padding: "10px 20px",
                            background: currentPage === pagination.totalPages ? "var(--bg-soft)" : "var(--primary)",
                            color: currentPage === pagination.totalPages ? "var(--text-muted)" : "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: currentPage === pagination.totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === pagination.totalPages ? 0.5 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingBook ? "Edit Book" : "Add New Book"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Author</label>
                                <input required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cover Image</label>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading && <span>Uploading...</span>}
                                </div>
                                {formData.coverImage && (
                                    <div style={{ marginTop: "10px" }}>
                                        <img
                                            src={getImageUrl(formData.coverImage)}
                                            alt="Preview"
                                            style={{ width: "80px", height: "120px", borderRadius: "8px", objectFit: "cover" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                                            style={{ display: "block", color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="add-btn" style={{ marginBottom: 0 }}>Save</button>
                                <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
