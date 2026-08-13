import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [loginRole, setLoginRole] = useState("member");
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/members/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, loginRole })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login Failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/dashboard");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card login-card-modern">
                <div className="auth-logo">📚</div>

                <h2>Digital Library</h2>
                <p className="subtitle">
                    Login to access your library account
                </p>

                <div className="role-switch">
                    <button
                        type="button"
                        className={loginRole === "member" ? "role-option active" : "role-option"}
                        onClick={() => setLoginRole("member")}
                    >
                        👤 Member
                    </button>

                    <button
                        type="button"
                        className={loginRole === "admin" ? "role-option active" : "role-option"}
                        onClick={() => setLoginRole("admin")}
                    >
                        🛡️ Admin
                    </button>
                </div>

                <div className="login-role-note">
                    {loginRole === "member"
                        ? "Browse books, reserve unavailable books and track your borrowing."
                        : "Manage books, members, loans, fines and reservations."}
                </div>

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <button className="auth-button" disabled={loading}>
                        {loading ? "Signing in..." : `Login as ${loginRole === "admin" ? "Admin" : "Member"} →`}
                    </button>
                </form>

                {loginRole === "member" && (
                    <div className="auth-footer">
                        New member? <Link to="/register">Create an account</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
