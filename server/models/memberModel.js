const db = require("../config/db");

// Register Member
const registerMember = (member, callback) => {

    const sql = `
        INSERT INTO members
        (name, email, phone, password, role)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            member.name,
            member.email,
            member.phone,
            member.password,
            member.role || "member"
        ],
        callback
    );
};

// Find Member By Email
const findMemberByEmail = (email, callback) => {

    const sql = "SELECT * FROM members WHERE email = ?";

    db.query(sql, [email], callback);
};

// Get All Members
const getAllMembers = (callback) => {

    const sql = `
        SELECT id, name, email, phone, role
        FROM members
        ORDER BY id DESC
    `;

    db.query(sql, callback);
};

// Update Member
const updateMember = (id, member, callback) => {

    const sql = `
        UPDATE members
        SET name = ?, email = ?, phone = ?, role = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            member.name,
            member.email,
            member.phone,
            member.role,
            id
        ],
        callback
    );
};

// Delete Member
const deleteMember = (id, callback) => {

    const sql = "DELETE FROM members WHERE id = ?";

    db.query(sql, [id], callback);
};

module.exports = {
    registerMember,
    findMemberByEmail,
    getAllMembers,
    updateMember,
    deleteMember
};