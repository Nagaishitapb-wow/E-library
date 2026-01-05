import type { Request, Response } from "express";
import { Category } from "../models/Category";
import { Book } from "../models/Book";
import Borrow from "../models/Borrow";
import { escapeRegExp } from "../utils/regexHelper";

export async function getAllCategories(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            Category.find().skip(skip).limit(limit),
            Category.countDocuments()
        ]);

        res.json({
            data: categories,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("Error fetching categories", err);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
}

export async function getCategoryById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
    } catch (err) {
        console.error("Error fetching category", err);
        res.status(500).json({ message: "Failed to fetch category" });
    }
}

export async function createCategory(req: Request, res: Response) {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const safeName = escapeRegExp(name);
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${safeName}$`, "i") }
        });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = new Category({ name, description });
        await category.save();

        res.status(201).json(category);
    } catch (err) {
        console.error("Error creating category", err);
        res.status(500).json({ message: "Failed to create category" });
    }
}

export async function updateCategory(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(category);
    } catch (err) {
        console.error("Error updating category", err);
        res.status(500).json({ message: "Failed to update category" });
    }
}

export async function deleteCategory(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // 1. Find all books in this category
        const booksInCategory = await Book.find({ category: id }).select("_id");
        const bookIds = booksInCategory.map(b => b._id);

        // 2. Check if any of these books are currently borrowed
        const activeBorrow = await Borrow.findOne({
            bookId: { $in: bookIds },
            returned: false
        });

        if (activeBorrow) {
            return res.status(400).json({
                message: "This category contains books that are currently borrowed and cannot be deleted."
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting category", err);
        res.status(500).json({ message: "Failed to delete category" });
    }
}
