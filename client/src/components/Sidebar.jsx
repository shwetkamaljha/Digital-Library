import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin" || user.role === "librarian";

    const linkClass = ({ isActive }) =>
        isActive ? "sidebar-link active" : "sidebar-link";

    return (
        <aside className="sidebar">
            <div className="sidebar-title">DIGITAL LIBRARY</div>

            <NavLink to="/dashboard" className={linkClass}>🏠 Dashboard</NavLink>
            <NavLink to="/books" className={linkClass}>📚 Books</NavLink>

            {isAdmin ? (
                <>
                    <NavLink to="/members" className={linkClass}>👥 Members</NavLink>
                    <NavLink to="/loans" className={linkClass}>📖 Loans & Fines</NavLink>
                    <NavLink to="/reservations" className={linkClass}>📌 Reservations</NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/reservations" className={linkClass}>📌 My Reservations</NavLink>
                    <NavLink to="/my-loans" className={linkClass}>📖 My Borrowing History</NavLink>
                </>
            )}

            <div className="sidebar-role">
                <span>Logged in as</span>
                <strong>{isAdmin ? "Administrator" : "Library Member"}</strong>
            </div>
        </aside>
    );
}
