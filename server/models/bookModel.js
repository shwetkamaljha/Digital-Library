const knex = require("../config/db");

// Get all books
const getAllBooks = (callback) => {
    knex("books")
        .select("*")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
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
            callback(null, {
                insertId: result[0],
                affectedRows: 1
            });
        })
        .catch((err) => callback(err, null));
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
