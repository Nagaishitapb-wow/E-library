import axios from "axios";
import { Book } from "../models/Book";

import type { Request, Response } from "express";

export async function importBooks(req: Request, res: Response) {
  try {
    const response = await axios.get("https://openlibrary.org/subjects/fantasy.json?limit=50");
    const books = response.data.works;

    for (const item of books) {
      await Book.findOneAndUpdate(
        { isbn: item.key },
        {
          title: item.title,
          author: item.authors?.[0]?.name || "Unknown",
          coverImage: item.cover_id
            ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
            : null,
          isbn: item.key,
          stock: 5,
          description: "This is a sample description imported from OpenLibrary for testing purposes.",
          price: 19.99,
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        { upsert: true }
      );
    }

    return res.json({ message: "Import completed" });
  } catch (err) {
    console.log("IMPORT ERROR:", err);
    return res.status(500).json({ message: "Import failed" });
  }
}
