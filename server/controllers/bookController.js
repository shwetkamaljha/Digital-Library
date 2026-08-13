const {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook
} = require("../models/bookModel");

// GET Books
const getBooks = (req, res) => {

    getAllBooks((err, books) => {

        if (err) {
            return res.status(500).json({
                message: "Database Error"
            });
        }

        res.json(books);

    });

};

// POST Book
const createBook = (req, res) => {

    const book = req.body;

    addBook(book, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Book Not Added"
            });
        }

        res.status(201).json({
            message: "Book Added Successfully",
            id: result.insertId
        });

    });

};

// Update Book
const editBook = (req, res) => {

    const id = req.params.id;
    const book = req.body;

    updateBook(id, book, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Book Update Failed"
            });
        }

        res.json({
            message: "Book Updated Successfully"
        });

    });

};

// Delete Book
const removeBook = (req, res) => {

    const id = req.params.id;

    deleteBook(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Book Delete Failed"
            });
        }

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