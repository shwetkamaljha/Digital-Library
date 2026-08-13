import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user.role === "admin" || user.role === "librarian";

    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const booksRes = await API.get("/books");
                setBooks(booksRes.data);

                if (isAdmin) {
                    const [membersRes, loansRes] = await Promise.all([
                        API.get("/members"),
                        API.get("/loans/history")
                    ]);
                    setMembers(membersRes.data);
                    setLoans(loansRes.data);
                } else {
                    const loansRes = await API.get("/loans/my-history");
                    setLoans(loansRes.data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        load();
    }, [isAdmin]);

    const totalCopies = books.reduce((sum, b) => sum + Number(b.total_copies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + Number(b.available_copies || 0), 0);
    const activeLoans = loans.filter(l => l.status !== "Returned").length;
    const returnedLoans = loans.filter(l => l.status === "Returned").length;

    return (
        <div className="app-layout">
            <Navbar />
            <div className="body-layout">
                <Sidebar />

                <main className="main-content">
                    <div className="dashboard-hero">
                        <div>
                            <span className="welcome-label">
                                {isAdmin ? "ADMIN CONTROL CENTER" : "MEMBER AREA"}
                            </span>
                            <h1>
                                {isAdmin ? "Library Dashboard" : `Welcome, ${user.name || "Member"}`}
                            </h1>
                            <p>
                                {isAdmin
                                    ? "Manage books, members, loans, fines and reservations."
                                    : "Discover books, check availability and manage your reservations."}
                            </p>
                        </div>
                        <div className="hero-icon">📚</div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">📚</div>
                            <div><span>Total Books</span><strong>{books.length}</strong></div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">📦</div>
                            <div><span>Total Copies</span><strong>{totalCopies}</strong></div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">✓</div>
                            <div><span>Available Copies</span><strong>{availableCopies}</strong></div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">📖</div>
                            <div>
                                <span>{isAdmin ? "Members" : "My Active Loans"}</span>
                                <strong>{isAdmin ? members.length : activeLoans}</strong>
                            </div>
                        </div>
                    </div>

                    {isAdmin ? (
                        <>
                            <div className="stats-grid small-stats">
                                <div className="info-card">
                                    <span>Active Loans</span>
                                    <strong>{activeLoans}</strong>
                                    <p>Currently issued books</p>
                                </div>
                                <div className="info-card">
                                    <span>Returned Books</span>
                                    <strong>{returnedLoans}</strong>
                                    <p>Completed transactions</p>
                                </div>
                                <div className="info-card">
                                    <span>Library Utilization</span>
                                    <strong>{totalCopies ? Math.round(((totalCopies - availableCopies) / totalCopies) * 100) : 0}%</strong>
                                    <p>Books currently issued</p>
                                </div>
                            </div>

                            <div className="content-card">
                                <div className="card-heading">
                                    <div>
                                        <h3>Admin Quick Actions</h3>
                                        <p>Essential library operations</p>
                                    </div>
                                </div>

                                <div className="quick-actions">
                                    <Link to="/books" className="quick-action purple-action">
                                        <span>📚</span><div><strong>Manage Books</strong><small>Add, edit or delete books</small></div>
                                    </Link>
                                    <Link to="/members" className="quick-action blue-action">
                                        <span>👥</span><div><strong>Manage Members</strong><small>View and update members</small></div>
                                    </Link>
                                    <Link to="/loans" className="quick-action green-action">
                                        <span>🔄</span><div><strong>Loans & Fines</strong><small>Issue, return and collect fines</small></div>
                                    </Link>
                                    <Link to="/reservations" className="quick-action orange-action">
                                        <span>📌</span><div><strong>Reservations</strong><small>Accept requests when available</small></div>
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="content-card">
                                <div className="card-heading">
                                    <div>
                                        <h3>Member Quick Actions</h3>
                                        <p>Everything you need as a library member</p>
                                    </div>
                                </div>

                                <div className="quick-actions">
                                    <Link to="/books" className="quick-action purple-action">
                                        <span>🔎</span><div><strong>Browse Books</strong><small>Search and check availability</small></div>
                                    </Link>
                                    <Link to="/reservations" className="quick-action blue-action">
                                        <span>📌</span><div><strong>My Reservations</strong><small>Track reservation requests</small></div>
                                    </Link>
                                    <Link to="/my-loans" className="quick-action green-action">
                                        <span>📖</span><div><strong>Borrowing History</strong><small>View loans and fines</small></div>
                                    </Link>
                                </div>
                            </div>

                            <div className="member-info-banner">
                                💰 <strong>Fine Policy:</strong> Books are issued for 7 days. Late return fine is ₹10 per day after the due date.
                            </div>
                        </>
                    )}

                    <div className="content-card">
                        <div className="card-heading">
                            <div>
                                <h3>Recent Books</h3>
                                <p>Latest books in the library</p>
                            </div>
                            <Link to="/books">View All →</Link>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.slice(0, 5).map(book => (
                                        <tr key={book.id}>
                                            <td>#{book.id}</td>
                                            <td><strong>{book.title}</strong></td>
                                            <td>{book.author}</td>
                                            <td><span className="category-badge">{book.category}</span></td>
                                            <td>{book.available_copies}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
