import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        user = null;
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const name = user?.name || "Library Member";
    const role = user?.role || "Member";

    const initials = name
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="navbar-custom">

            <div className="navbar-brand-area">

                <div className="navbar-logo">
                    📚
                </div>

                <div>
                    <div className="navbar-title">
                        Digital Library
                    </div>

                    <div className="navbar-subtitle">
                        Library Management System
                    </div>
                </div>

            </div>


            <div className="navbar-user">

                <div className="user-avatar">
                    {initials}
                </div>

                <div className="user-info">

                    <strong>
                        {name}
                    </strong>

                    <span>
                        {role}
                    </span>

                </div>

                {token && (
                    <button
                        onClick={handleLogout}
                        className="action-btn delete-btn"
                        style={{
                            marginLeft: "8px",
                            padding: "9px 14px"
                        }}
                    >
                        Logout
                    </button>
                )}

            </div>

        </header>
    );
}