const db = require("../config/db");

// Register Member
const registerMember = (member, callback) => {
    const hasPhone = member.phone !== undefined && member.phone !== null && member.phone !== "";

    const sql = hasPhone
        ? `
            INSERT INTO members
            (name, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5)
        `
        : `
            INSERT INTO members
            (name, email, password, role)
            VALUES ($1, $2, $3, $4)
        `;

    const values = hasPhone
        ? [
            member.name,
            member.email,
            member.phone,
            member.password,
            member.role || "member"
        ]
        : [
            member.name,
            member.email,
            member.password,
            member.role || "member"
        ];

    db.query(sql, values, callback);
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