const knex = require("../config/db");

// Register Member
const registerMember = (member, callback) => {
    const insertData = {
        name: member.name,
        email: member.email,
        password: member.password,
        role: member.role || "member"
    };

    if (member.phone !== undefined && member.phone !== null && member.phone !== "") {
        insertData.phone = member.phone;
    }

    knex("members")
        .insert(insertData)
        .then((result) => {
            callback(null, {
                insertId: result[0],
                affectedRows: 1
            });
        })
        .catch((err) => callback(err, null));
};

// Find Member By Email
const findMemberByEmail = (email, callback) => {
    knex("members")
        .where("email", email)
        .select("*")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};

// Get All Members
const getAllMembers = (callback) => {
    knex("members")
        .select("id", "name", "email", "phone", "role")
        .orderBy("id", "desc")
        .then((result) => {
            callback(null, result);
        })
        .catch((err) => callback(err, null));
};

// Update Member
const updateMember = (id, member, callback) => {
    knex("members")
        .where("id", id)
        .update({
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role
        })
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

// Delete Member
const deleteMember = (id, callback) => {
    knex("members")
        .where("id", id)
        .delete()
        .then((affectedRows) => {
            callback(null, { affectedRows });
        })
        .catch((err) => callback(err, null));
};

module.exports = {
    registerMember,
    findMemberByEmail,
    getAllMembers,
    updateMember,
    deleteMember
};