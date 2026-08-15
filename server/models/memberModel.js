const knex = require("../config/db");

// Register Member
const registerMember = (member, callback) => {
    console.log("[MODEL_REGISTER_MEMBER] Called with:", JSON.stringify(member, null, 2));
    
    const insertData = {
        name: member.name,
        email: member.email,
        password: member.password,
        role: member.role || "member"
    };

    if (member.phone !== undefined && member.phone !== null && member.phone !== "") {
        insertData.phone = member.phone;
    }

    console.log("[MODEL_REGISTER_MEMBER_INSERT] Insert data:", JSON.stringify(insertData, null, 2));

    knex("members")
        .insert(insertData)
        .then((result) => {
            console.log("[MODEL_REGISTER_MEMBER_SUCCESS] Insert result:", JSON.stringify(result, null, 2));
            const response = {
                insertId: result && result[0] ? result[0] : undefined,
                affectedRows: 1
            };
            console.log("[MODEL_REGISTER_MEMBER_CALLBACK] Calling callback with:", JSON.stringify(response, null, 2));
            callback(null, response);
        })
        .catch((err) => {
            console.error("[MODEL_REGISTER_MEMBER_ERROR]", JSON.stringify({
                errorCode: err && err.code,
                errorMessage: err && err.message,
                errorName: err && err.name,
                fullError: String(err)
            }, null, 2));
            console.error("[MODEL_REGISTER_MEMBER_ERROR_STACK]", err && err.stack);
            callback(err, null);
        });
};

// Find Member By Email
const findMemberByEmail = (email, callback) => {
    console.log("[MODEL_FIND_MEMBER] Looking up email:", email);
    
    knex("members")
        .where("email", email)
        .select("*")
        .then((result) => {
            console.log("[MODEL_FIND_MEMBER_SUCCESS] Found", Array.isArray(result) ? result.length : 0, "result(s)");
            callback(null, result);
        })
        .catch((err) => {
            console.error("[MODEL_FIND_MEMBER_ERROR]", JSON.stringify({
                email,
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};

// Get All Members
const getAllMembers = (callback) => {
    console.log("[MODEL_GET_ALL_MEMBERS] Fetching all members");
    
    knex("members")
        .select("id", "name", "email", "phone", "role")
        .orderBy("id", "desc")
        .then((result) => {
            console.log("[MODEL_GET_ALL_MEMBERS_SUCCESS] Found", Array.isArray(result) ? result.length : 0, "members");
            callback(null, result);
        })
        .catch((err) => {
            console.error("[MODEL_GET_ALL_MEMBERS_ERROR]", JSON.stringify({
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};

// Update Member
const updateMember = (id, member, callback) => {
    console.log("[MODEL_UPDATE_MEMBER] Updating id:", id, "with:", JSON.stringify(member, null, 2));
    
    knex("members")
        .where("id", id)
        .update({
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role
        })
        .then((affectedRows) => {
            console.log("[MODEL_UPDATE_MEMBER_SUCCESS] Affected rows:", affectedRows);
            callback(null, { affectedRows });
        })
        .catch((err) => {
            console.error("[MODEL_UPDATE_MEMBER_ERROR]", JSON.stringify({
                id,
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};

// Delete Member
const deleteMember = (id, callback) => {
    console.log("[MODEL_DELETE_MEMBER] Deleting id:", id);
    
    knex("members")
        .where("id", id)
        .delete()
        .then((affectedRows) => {
            console.log("[MODEL_DELETE_MEMBER_SUCCESS] Affected rows:", affectedRows);
            callback(null, { affectedRows });
        })
        .catch((err) => {
            console.error("[MODEL_DELETE_MEMBER_ERROR]", JSON.stringify({
                id,
                errorCode: err && err.code,
                errorMessage: err && err.message,
                stack: err && err.stack
            }, null, 2));
            callback(err, null);
        });
};

module.exports = {
    registerMember,
    findMemberByEmail,
    getAllMembers,
    updateMember,
    deleteMember
};