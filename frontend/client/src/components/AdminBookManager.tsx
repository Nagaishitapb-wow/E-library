import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Book {
    _id: string;
    title: string;
    author: string;
    stock: number;
    category?: { _id: string; name: string };
    price: number;
    status: string;
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

    const fetchBooks = async () => {
        try {
            const res = await axios.get("https://e-library-jtx2.onrender.com/api/books");
            setBooks(res.data);
        } catch {
            toast.error("Failed to load books");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("https://e-library-jtx2.onrender.com/api/categories");
            setCategories(res.data);
        } catch {
            console.error("Failed to load categories");
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (editingBook) {
                await axios.put(`https://e-library-jtx2.onrender.com/api/books/${editingBook._id}`, formData, { headers });
                toast.success("Book updated");
            } else {
                await axios.post("https://e-library-jtx2.onrender.com/api/books", formData, { headers });
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
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`https://e-library-jtx2.onrender.com/api/books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
            description: "", // Ideally populate this too if available in list or fetch detailed
            stock: book.stock,
            price: book.price || 0,
            category: book.category?._id || "",
            status: book.status,
            coverImage: "", // Populate if needed
            pdfUrl: ""
        });
        setShowModal(true);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Books Library</h2>
                <button className="add-btn" onClick={openAddModal}>+ Add Book</button>
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
                    {books.map(book => (
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
                </tbody>
            </table>

            {showModal && (
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
                                <label>Cover Image URL</label>
                                <input value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <button type="submit" className="add-btn" style={{ marginBottom: 0 }}>Save</button>
                                <button type="button" className="action-btn" style={{ background: "#9ca3af", color: "white" }} onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
