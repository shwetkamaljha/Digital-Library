const {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook
} = require("../models/bookModel");

// GET Books
const getBooks = (req, res) => {
    console.log("[BOOKS_GET] Request received", JSON.stringify({
        user: req.user || null,
        query: req.query,
        params: req.params
    }, null, 2));

    getAllBooks((err, books) => {

        if (err) {
            console.error("[BOOKS_GET_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                user: req.user || null
            }, null, 2));
            return res.status(500).json({
                message: "Database Error"
            });
        }

        console.log("[BOOKS_GET_SUCCESS] Returned books count:", Array.isArray(books) ? books.length : "unknown");
        res.json(books);

    });

};

// POST Book
const createBook = (req, res) => {
    console.log("[BOOK_CREATE] Request body:", JSON.stringify(req.body, null, 2));

    const book = req.body;

    addBook(book, (err, result) => {

        if (err) {
            console.error("[BOOK_CREATE_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                payload: book
            }, null, 2));
            return res.status(500).json({
                message: "Book Not Added"
            });
        }

        console.log("[BOOK_CREATE_SUCCESS] Inserted book id:", result && result.insertId);
        res.status(201).json({
            message: "Book Added Successfully",
            id: result.insertId
        });

    });

};

// Update Book
const editBook = (req, res) => {
    console.log("[BOOK_UPDATE] Request received", JSON.stringify({
        id: req.params.id,
        body: req.body,
        user: req.user || null
    }, null, 2));

    const id = req.params.id;
    const book = req.body;

    updateBook(id, book, (err, result) => {

        if (err) {
            console.error("[BOOK_UPDATE_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                id,
                payload: book
            }, null, 2));
            return res.status(500).json({
                message: "Book Update Failed"
            });
        }

        console.log("[BOOK_UPDATE_SUCCESS] Updated book id:", id);
        res.json({
            message: "Book Updated Successfully"
        });

    });

};

// Delete Book
const removeBook = (req, res) => {
    console.log("[BOOK_DELETE] Deleting id:", req.params.id, "by user:", req.user || null);

    const id = req.params.id;

    deleteBook(id, (err, result) => {

        if (err) {
            console.error("[BOOK_DELETE_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                id
            }, null, 2));
            return res.status(500).json({
                message: "Book Delete Failed"
            });
        }

        console.log("[BOOK_DELETE_SUCCESS] Deleted book id:", id);
        res.json({
            message: "Book Deleted Successfully"
        });

    });

};

module.exports = {
    getBooks,
    createBook,
    editBook , 
    removeBook
};