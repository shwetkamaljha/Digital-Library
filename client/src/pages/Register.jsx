import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:5000/members/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration Failed"
                );
            }

            alert("Registration Successful");

            navigate("/");

        } catch (error) {

            console.error("REGISTER ERROR:", error);

            alert(
                error.message ||
                "Unable to Register"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-page register-page">

            {/* LEFT SIDE */}

            <div className="auth-hero">

                <div className="hero-content">

                    <div className="hero-logo">
                        📚
                    </div>

                    <div className="hero-small-title">
                        DIGITAL LIBRARY
                    </div>

                    <h1>
                        Your Books.<br />
                        Your Library.
                    </h1>

                    <p>
                        Create your library account and
                        explore, reserve and manage your
                        books from one place.
                    </p>

                    <div className="hero-features">

                        <div>
                            ✓ Browse available books
                        </div>

                        <div>
                            ✓ Reserve books easily
                        </div>

                        <div>
                            ✓ Track your borrowing history
                        </div>

                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="auth-form-section">

                <div className="auth-card register-card">

                    <div className="auth-logo">
                        📚
                    </div>

                    <h2>
                        Create Account
                    </h2>

                    <p className="subtitle">
                        Register as a library member
                    </p>


                    <form onSubmit={handleSubmit}>

                        <label>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />


                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />


                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />


                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />


                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating account..."
                                : "Create Account →"
                            }

                        </button>

                    </form>


                    <div className="auth-footer">

                        Already have an account?

                        <Link to="/">
                            {" "}Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}