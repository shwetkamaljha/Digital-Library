const knex = require("../config/db");

// =====================================
// CREATE RESERVATION
// =====================================

const createReservation = (data, callback) => {
    console.log("[MODEL_CREATE_RESERVATION] Creating reservation with:", JSON.stringify(data, null, 2));
    
    knex("reservations")
        .insert({
            member_id: data.member_id,
            book_id: data.book_id,
            status: "Pending",
            reservation_date: knex.raw("NOW()")
        })
        .then((result) => {
            console.log("[MODEL_CREATE_RESERVATION_SUCCESS] Insert result:", JSON.stringify(result, null, 2));
            callback(null, {
                insertId: result && result[0] ? result[0] : undefined,
                affectedRows: 1
            });
        })
        .catch((err) => {
            console.error("[MODEL_CREATE_RESERVATION_ERROR]", JSON.stringify({
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};


// =====================================
// GET ALL RESERVATIONS
// ADMIN
// =====================================

const getReservations = (callback) => {
    knex("reservations as r")
        .select(
            "r.id",
            "r.member_id",
            "r.book_id",
            "r.status",
            "r.reservation_date",
            knex.raw("m.name AS member_name"),
            knex.raw("b.title AS book_title"),
            "b.author",
            "b.available_copies",
            "b.total_copies"
        )
        .join(knex.raw("members m ON r.member_id = m.id"))
        .join(knex.raw("books b ON r.book_id = b.id"))
        .orderBy("r.reservation_date", "desc")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// =====================================
// GET MEMBER RESERVATIONS
// =====================================

const getMyReservations = (memberId, callback) => {
    knex("reservations as r")
        .select(
            "r.id",
            "r.member_id",
            "r.book_id",
            "r.status",
            "r.reservation_date",
            knex.raw("b.title AS book_title"),
            "b.author",
            "b.available_copies",
            "b.total_copies"
        )
        .join(knex.raw("books b ON r.book_id = b.id"))
        .where("r.member_id", memberId)
        .orderBy("r.reservation_date", "desc")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// =====================================
// GET PENDING RESERVATION
// =====================================

const getPendingReservation = (memberId, bookId, callback) => {
    knex("reservations")
        .where("member_id", memberId)
        .andWhere("book_id", bookId)
        .andWhere("status", "Pending")
        .select("*")
        .limit(1)
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// =====================================
// GET BOOK AVAILABILITY
// =====================================

const getBookAvailability = (bookId, callback) => {
    knex("books")
        .where("id", bookId)
        .select("id", "title", "available_copies", "total_copies")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// =====================================
// GET RESERVATION BY ID
// =====================================

const getReservationById = (reservationId, callback) => {
    knex("reservations as r")
        .select(
            "r.id",
            "r.member_id",
            "r.book_id",
            "r.status",
            "r.reservation_date",
            knex.raw("b.title AS book_title"),
            "b.available_copies",
            "b.total_copies"
        )
        .join(knex.raw("books b ON r.book_id = b.id"))
        .where("r.id", reservationId)
        .limit(1)
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};


// =====================================
// ACCEPT RESERVATION
// =====================================

const acceptReservation = (reservationId, callback) => {
    knex("reservations")
        .where("id", reservationId)
        .andWhere("status", "Pending")
        .update({ status: "Accepted" })
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
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