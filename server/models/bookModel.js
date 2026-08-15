const knex = require("../config/db");

// Get all books
const getAllBooks = (callback) => {
    console.log("[MODEL_GET_ALL_BOOKS] Fetching all books");
    
    knex("books")
        .select("*")
        .then((result) => {
            console.log("[MODEL_GET_ALL_BOOKS_SUCCESS] Found", Array.isArray(result) ? result.length : 0, "books");
            callback(null, result);
        })
        .catch((err) => {
            console.error("[MODEL_GET_ALL_BOOKS_ERROR]", JSON.stringify({
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};

// Get one book
const getBookById = (id, callback) => {
    knex("books")
        .where("id", id)
        .select("*")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};

// Add new book
const addBook = (book, callback) => {
    console.log("[MODEL_ADD_BOOK] Adding book:", JSON.stringify(book, null, 2));
    
    knex("books")
        .insert({
            title: book.title,
            author: book.author,
            category: book.category,
            isbn: book.isbn,
            total_copies: book.total_copies,
            available_copies: book.available_copies
        })
        .then((result) => {
            console.log("[MODEL_ADD_BOOK_SUCCESS] Insert result:", JSON.stringify(result, null, 2));
            callback(null, {
                insertId: result && result[0] ? result[0] : undefined,
                affectedRows: 1
            });
        })
        .catch((err) => {
            console.error("[MODEL_ADD_BOOK_ERROR]", JSON.stringify({
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};
// Update Book
const updateBook = (id, book, callback) => {
    knex("books")
        .where("id", id)
        .update({
            title: book.title,
            author: book.author,
            category: book.category,
            isbn: book.isbn,
            total_copies: book.total_copies,
            available_copies: book.available_copies
        })
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

// Delete Book
const deleteBook = (id, callback) => {
    knex("books")
        .where("id", id)
        .delete()
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

// Decrease Available Copies
const decreaseAvailableCopies = (bookId, callback) => {
    knex("books")
        .where("id", bookId)
        .andWhere("available_copies", ">", 0)
        .decrement("available_copies", 1)
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

// Increase Available Copies
const increaseAvailableCopies = (bookId, callback) => {
    knex("books")
        .where("id", bookId)
        .increment("available_copies", 1)
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

module.exports = {
    getAllBooks,
    addBook,
    updateBook,
    deleteBook,
    decreaseAvailableCopies,
    increaseAvailableCopies
    
};
