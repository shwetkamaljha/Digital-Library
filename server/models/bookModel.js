const db = require("../config/db");

// Get all books
const getAllBooks = (callback) => {

    const sql = "SELECT * FROM books";

    db.query(sql, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};

// Get one book
const getBookById = (id, callback) => {
    const sql = "SELECT * FROM books WHERE id = ?";
    db.query(sql, [id], callback);
};

// Add new book
const addBook = (book, callback) => {

    const sql = `
        INSERT INTO books
        (title, author, category, isbn, total_copies, available_copies)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            book.title,
            book.author,
            book.category,
            book.isbn,
            book.total_copies,
            book.available_copies
        ],
        (err, result) => {

            if (err) {
                return callback(err, null);
            }

            callback(null, result);

        }
    );

};
// Update Book
const updateBook = (id, book, callback) => {

    const sql = `
        UPDATE books
        SET
            title = ?,
            author = ?,
            category = ?,
            isbn = ?,
            total_copies = ?,
            available_copies = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            book.title,
            book.author,
            book.category,
            book.isbn,
            book.total_copies,
            book.available_copies,
            id
        ],
        (err, result) => {

            if (err) {
                return callback(err, null);
            }

            callback(null, result);

        }
    );

};

// Delete Book
const deleteBook = (id, callback) => {

    const sql = "DELETE FROM books WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};

// Decrease Available Copies
const decreaseAvailableCopies = (bookId, callback) => {

    const sql = `
        UPDATE books
        SET available_copies = available_copies - 1
        WHERE id = ? AND available_copies > 0
    `;

    db.query(sql, [bookId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};   // ✅ Yahin function khatam

// Increase Available Copies
const increaseAvailableCopies = (bookId, callback) => {

    const sql = `
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = ?
    `;

    db.query(sql, [bookId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);

    });

};

module.exports = {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
    decreaseAvailableCopies,
    increaseAvailableCopies
    
};
