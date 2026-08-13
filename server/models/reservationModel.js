const db = require("../config/db");

// =====================================
// CREATE RESERVATION
// =====================================

const createReservation = (data, callback) => {

    const sql = `
        INSERT INTO reservations
        (member_id, book_id, status, reservation_date)
        VALUES (?, ?, 'Pending', NOW())
    `;

    db.query(
        sql,
        [
            data.member_id,
            data.book_id
        ],
        callback
    );

};


// =====================================
// GET ALL RESERVATIONS
// ADMIN
// =====================================

const getReservations = (callback) => {

    const sql = `
        SELECT
            r.id,
            r.member_id,
            r.book_id,
            r.status,
            r.reservation_date,

            m.name AS member_name,

            b.title AS book_title,
            b.author,
            b.available_copies,
            b.total_copies

        FROM reservations r

        JOIN members m
            ON r.member_id = m.id

        JOIN books b
            ON r.book_id = b.id

        ORDER BY r.reservation_date DESC
    `;

    db.query(sql, callback);

};


// =====================================
// GET MEMBER RESERVATIONS
// =====================================

const getMyReservations = (memberId, callback) => {

    const sql = `
        SELECT
            r.id,
            r.member_id,
            r.book_id,
            r.status,
            r.reservation_date,

            b.title AS book_title,
            b.author,
            b.available_copies,
            b.total_copies

        FROM reservations r

        JOIN books b
            ON r.book_id = b.id

        WHERE r.member_id = ?

        ORDER BY r.reservation_date DESC
    `;

    db.query(
        sql,
        [memberId],
        callback
    );

};


// =====================================
// GET PENDING RESERVATION
// =====================================

const getPendingReservation = (
    memberId,
    bookId,
    callback
) => {

    const sql = `
        SELECT *
        FROM reservations
        WHERE member_id = ?
        AND book_id = ?
        AND status = 'Pending'
        LIMIT 1
    `;

    db.query(
        sql,
        [
            memberId,
            bookId
        ],
        callback
    );

};


// =====================================
// GET BOOK AVAILABILITY
// =====================================

const getBookAvailability = (
    bookId,
    callback
) => {

    const sql = `
        SELECT
            id,
            title,
            available_copies,
            total_copies

        FROM books

        WHERE id = ?
    `;

    db.query(
        sql,
        [bookId],
        callback
    );

};


// =====================================
// GET RESERVATION BY ID
// =====================================

const getReservationById = (
    reservationId,
    callback
) => {

    const sql = `
        SELECT
            r.id,
            r.member_id,
            r.book_id,
            r.status,
            r.reservation_date,

            b.title AS book_title,
            b.available_copies,
            b.total_copies

        FROM reservations r

        JOIN books b
            ON r.book_id = b.id

        WHERE r.id = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [reservationId],
        callback
    );

};


// =====================================
// ACCEPT RESERVATION
// =====================================

const acceptReservation = (
    reservationId,
    callback
) => {

    const sql = `
        UPDATE reservations

        SET status = 'Accepted'

        WHERE id = ?
        AND status = 'Pending'
    `;

    db.query(
        sql,
        [reservationId],
        callback
    );

};


// =====================================
// EXPORT
// =====================================

module.exports = {

    createReservation,

    getReservations,

    getMyReservations,

    getPendingReservation,

    getBookAvailability,

    getReservationById,

    acceptReservation

};