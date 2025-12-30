import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { Link } from "react-router-dom";
import "../styles/staticPages.css";

const Categories = () => {
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);

    useEffect(() => {
        api.get("/categories?page=1&limit=100")
            .then((res: any) => setCategories(res.data.data || res.data))
            .catch((err: any) => console.error("Error fetching categories", err));
    }, []);

    return (
        <div className="static-page">
            <h1>Book Categories</h1>
            <div className="content">
                <p>Explore our books by category.</p>
                <div className="categories-grid">
                    {categories.map(cat => (
                        <Link key={cat._id} to={`/books?category=${cat._id}`} className="category-card">
                            <h4>{cat.name}</h4>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
