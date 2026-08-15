const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    registerMember,
    findMemberByEmail,
    getAllMembers,
    updateMember,
    deleteMember
} = require("../models/memberModel");


// =========================
// REGISTER MEMBER
// =========================

const register = async (req, res) => {
    console.log("[MEMBER_REGISTER] Endpoint called");
    console.log("[MEMBER_REGISTER] Payload received:", JSON.stringify(req.body, null, 2));

    try {

        const member = req.body;

        if (
            !member.name ||
            !member.email ||
            !member.password
        ) {
            console.warn("[MEMBER_REGISTER_VALIDATION_ERROR] Missing required fields", JSON.stringify({
                received: member
            }, null, 2));
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        member.phone = member.phone ?? null;

        const hashedPassword = await bcrypt.hash(
            member.password,
            10
        );

        member.password = hashedPassword;

        // Public registration = Member
        member.role = "member";

        console.log("[MEMBER_REGISTER] About to call registerMember()");

        registerMember(member, (err, result) => {

            try {
                console.log("[MEMBER_REGISTER_CALLBACK] Callback invoked, err:", err ? "present" : "null", "result:", result ? "present" : "null");

                if (err) {

                    console.error("[MEMBER_REGISTER_DATABASE_ERROR]", JSON.stringify({
                        error: err,
                        code: err && err.code,
                        message: err && err.message,
                        payload: member
                    }, null, 2));

                    const isDuplicateEmail =
                        err.code === "ER_DUP_ENTRY" ||
                        err.code === "23505" ||
                        (err.message && err.message.toLowerCase().includes("duplicate"));

                    if (isDuplicateEmail) {
                        return res.status(409).json({
                            message: "Email already registered"
                        });
                    }

                    return res.status(500).json({
                        message: "Registration Failed",
                        error: process.env.NODE_ENV === "production" ? undefined : err.message
                    });
                }

                console.log("[MEMBER_REGISTER_SUCCESS] Created member:", JSON.stringify({
                    id: result && result.insertId,
                    email: member.email
                }, null, 2));
                return res.status(201).json({
                    message: "Member Registered Successfully"
                });
            } catch (callbackError) {
                console.error("[MEMBER_REGISTER_CALLBACK_ERROR] Error in callback:", JSON.stringify({
                    errorName: callbackError && callbackError.name,
                    errorMessage: callbackError && callbackError.message,
                    stack: callbackError && callbackError.stack
                }, null, 2));
                return res.status(500).json({
                    message: "Callback error during registration",
                    error: process.env.NODE_ENV === "production" ? undefined : (callbackError && callbackError.message)
                });
            }
        });

    } catch (error) {

        console.error("[MEMBER_REGISTER_SERVER_ERROR]", JSON.stringify({
            error: error,
            stack: error && error.stack,
            payload: req.body
        }, null, 2));

        return res.status(500).json({
            message: "Server Error"
        });
    }
};


// =========================
// LOGIN
// =========================

const login = (req, res) => {

    const {
        email,
        password,
        loginRole = "member"
    } = req.body;

    console.log("[MEMBER_LOGIN] Attempt", JSON.stringify({
        email,
        loginRole
    }, null, 2));

    if (!email || !password) {
        console.warn("[MEMBER_LOGIN_VALIDATION_ERROR] Missing credentials", JSON.stringify({
            email: !!email,
            password: !!password,
            loginRole
        }, null, 2));

        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    findMemberByEmail(email, async (err, result) => {

        if (err) {

            console.error("[MEMBER_LOGIN_DATABASE_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                email
            }, null, 2));

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (!result || result.length === 0) {
            console.warn("[MEMBER_LOGIN_NOT_FOUND] No user found for email:", email);

            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const member = result[0];

        // Normalize requested role
        const requestedRole =
            loginRole === "admin"
                ? "admin"
                : "member";

        // Admin / librarian check
        const isAdmin =
            member.role === "admin" ||
            member.role === "librarian";

        if (
            requestedRole === "admin" &&
            !isAdmin
        ) {
            console.warn("[MEMBER_LOGIN_ROLE_MISMATCH] Requested admin login for non-admin account", JSON.stringify({
                requestedRole,
                memberRole: member.role,
                email
            }, null, 2));

            return res.status(403).json({
                message:
                    "This account is not an admin account"
            });
        }

        if (
            requestedRole === "member" &&
            isAdmin
        ) {
            console.warn("[MEMBER_LOGIN_ROLE_MISMATCH] Requested member login for admin account", JSON.stringify({
                requestedRole,
                memberRole: member.role,
                email
            }, null, 2));

            return res.status(403).json({
                message:
                    "Please select Login as Admin"
            });
        }

        try {

            const isMatch = await bcrypt.compare(
                password,
                member.password
            );

            if (!isMatch) {
                console.warn("[MEMBER_LOGIN_PASSWORD_MISMATCH] Password mismatch for email:", email);

                return res.status(401).json({
                    message: "Invalid Password"
                });
            }

        } catch (error) {

            console.error("[MEMBER_LOGIN_PASSWORD_CHECK_ERROR]", JSON.stringify({
                error: error,
                stack: error && error.stack,
                email
            }, null, 2));

            return res.status(500).json({
                message: "Password verification failed"
            });
        }

        const secret =
            process.env.JWT_SECRET;

        if (!secret) {

            console.error("[MEMBER_LOGIN_JWT_SECRET_MISSING] JWT_SECRET not configured");

            return res.status(500).json({
                message:
                    "Server configuration error"
            });
        }

        const token = jwt.sign(
            {
                id: member.id,
                email: member.email,
                role: member.role
            },
            secret,
            {
                expiresIn: "1d"
            }
        );

        console.log("[MEMBER_LOGIN_SUCCESS] Logged in user:", JSON.stringify({
            id: member.id,
            email: member.email,
            role: member.role
        }, null, 2));

        return res.status(200).json({

            message: "Login Successful",

            token,

            user: {
                id: member.id,
                name: member.name,
                email: member.email,
                role: member.role
            }

        });

    });
};


// =========================
// GET ALL MEMBERS
// =========================

const getMembers = (req, res) => {
    console.log("[MEMBERS_GET] Fetching members for:", JSON.stringify(req.user || null, null, 2));

    getAllMembers((err, result) => {

        if (err) {

            console.error("[MEMBERS_GET_ERROR]", JSON.stringify({
                error: err,
                stack: err && err.stack,
                user: req.user || null
            }, null, 2));

            return res.status(500).json({
                message: "Unable to Load Members"
            });
        }

        console.log("[MEMBERS_GET_SUCCESS] Members returned count:", Array.isArray(result) ? result.length : "unknown");
        return res.status(200).json(result);

    });

};


// =========================
// UPDATE MEMBER
// =========================

const editMember = (req, res) => {

    const id = req.params.id;
    console.log("[MEMBER_UPDATE] Attempting update", JSON.stringify({
        id,
        body: req.body,
        user: req.user || null
    }, null, 2));

    updateMember(
        id,
        req.body,
        (err, result) => {

            if (err) {

                console.error("[MEMBER_UPDATE_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    id,
                    payload: req.body
                }, null, 2));

                return res.status(500).json({
                    message: "Member Update Failed"
                });
            }

            console.log("[MEMBER_UPDATE_SUCCESS] Updated member id:", id);
            return res.json({
                message:
                    "Member Updated Successfully"
            });

        }
    );

};


// =========================
// DELETE MEMBER
// =========================

const removeMember = (req, res) => {

    const id = req.params.id;
    console.log("[MEMBER_DELETE] Attempting delete", JSON.stringify({
        id,
        user: req.user || null
    }, null, 2));

    deleteMember(
        id,
        (err, result) => {

            if (err) {

                console.error("[MEMBER_DELETE_ERROR]", JSON.stringify({
                    error: err,
                    stack: err && err.stack,
                    id
                }, null, 2));

                return res.status(500).json({
                    message: "Member Delete Failed"
                });
            }

            console.log("[MEMBER_DELETE_SUCCESS] Deleted member id:", id);
            return res.json({
                message:
                    "Member Deleted Successfully"
            });

        }
    );

};


module.exports = {
    register,
    login,
    getMembers,
    editMember,
    removeMember
};