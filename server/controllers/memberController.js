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

    try {

        const member = req.body;

        if (
            !member.name ||
            !member.email ||
            !member.password
        ) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(
            member.password,
            10
        );

        member.password = hashedPassword;

        // Public registration = Member
        member.role = "member";

        registerMember(member, (err, result) => {

            if (err) {

                console.log("REGISTER ERROR:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Email already registered"
                    });
                }

                return res.status(500).json({
                    message: "Registration Failed"
                });
            }

            return res.status(201).json({
                message: "Member Registered Successfully"
            });

        });

    } catch (error) {

        console.log("REGISTER SERVER ERROR:", error);

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

    console.log("LOGIN REQUEST:", {
        email,
        loginRole
    });

    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    findMemberByEmail(email, async (err, result) => {

        if (err) {

            console.log("LOGIN DATABASE ERROR:", err);

            return res.status(500).json({
                message: "Database Error"
            });
        }

        if (!result || result.length === 0) {

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


        // =========================
        // ADMIN LOGIN
        // =========================

        if (
            requestedRole === "admin" &&
            !isAdmin
        ) {

            return res.status(403).json({
                message:
                    "This account is not an admin account"
            });
        }


        // =========================
        // MEMBER LOGIN
        // =========================

        if (
            requestedRole === "member" &&
            isAdmin
        ) {

            return res.status(403).json({
                message:
                    "Please select Login as Admin"
            });
        }


        // =========================
        // PASSWORD CHECK
        // =========================

        try {

            const isMatch = await bcrypt.compare(
                password,
                member.password
            );

            if (!isMatch) {

                return res.status(401).json({
                    message: "Invalid Password"
                });
            }

        } catch (error) {

            console.log(
                "PASSWORD CHECK ERROR:",
                error
            );

            return res.status(500).json({
                message: "Password verification failed"
            });
        }


        // =========================
        // JWT TOKEN
        // =========================

        const secret =
            process.env.JWT_SECRET;

        if (!secret) {

            console.log(
                "JWT_SECRET is missing in .env"
            );

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


        // =========================
        // LOGIN SUCCESS
        // =========================

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

    getAllMembers((err, result) => {

        if (err) {

            console.log(
                "GET MEMBERS ERROR:",
                err
            );

            return res.status(500).json({
                message: "Unable to Load Members"
            });
        }

        return res.status(200).json(result);

    });

};


// =========================
// UPDATE MEMBER
// =========================

const editMember = (req, res) => {

    const id = req.params.id;

    updateMember(
        id,
        req.body,
        (err, result) => {

            if (err) {

                console.log(
                    "UPDATE MEMBER ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Member Update Failed"
                });
            }

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

    deleteMember(
        id,
        (err, result) => {

            if (err) {

                console.log(
                    "DELETE MEMBER ERROR:",
                    err
                );

                return res.status(500).json({
                    message: "Member Delete Failed"
                });
            }

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