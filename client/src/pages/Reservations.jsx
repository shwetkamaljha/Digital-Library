import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Reservations() {

    const user =
        JSON.parse(localStorage.getItem("user") || "{}");

    const isAdmin =
        user.role === "admin" ||
        user.role === "librarian";

    const [reservations, setReservations] = useState([]);
    const [books, setBooks] = useState([]);
    const [reserving, setReserving] = useState(null);


    // =====================================
    // LOAD RESERVATIONS
    // =====================================

    const loadReservations = async () => {

        try {

            const url =
                isAdmin
                    ? "/reservations"
                    : "/reservations/mine";

            const res =
                await API.get(url);

            setReservations(
                res.data || []
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to Load Reservations"
            );

        }

    };


    // =====================================
    // LOAD BOOKS FOR MEMBER
    // =====================================

    const loadBooks = async () => {

        try {

            const res =
                await API.get("/books");

            setBooks(
                res.data || []
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to Load Books"
            );

        }

    };


    useEffect(() => {

        loadReservations();

        if (!isAdmin) {
            loadBooks();
        }

    }, [isAdmin]);


    // =====================================
    // RESERVE BOOK
    // =====================================

    const reserveBook = async (bookId) => {

        if (reserving) return;

        if (
            !window.confirm(
                "Send reservation request for this book?"
            )
        ) {
            return;
        }

        try {

            setReserving(bookId);

            const res =
                await API.post(
                    "/reservations",
                    {
                        book_id: bookId
                    }
                );

            alert(
                res.data.message ||
                "Reservation Request Sent"
            );

            await loadReservations();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to Reserve Book"
            );

        } finally {

            setReserving(null);

        }

    };


    // =====================================
    // ADMIN ACCEPT
    // =====================================

    const accept = async (id) => {

        if (
            !window.confirm(
                "Accept this reservation and issue the book?"
            )
        ) {
            return;
        }

        try {

            const res =
                await API.put(
                    `/reservations/${id}/accept`
                );

            alert(
                res.data.message ||
                "Reservation Accepted"
            );

            await loadReservations();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to Accept Reservation"
            );

        }

    };


    // =====================================
    // CHECK EXISTING RESERVATION
    // =====================================

    const getBookReservation = (bookId) => {

        return reservations.find(
            r =>
                Number(r.book_id) ===
                    Number(bookId) &&
                (
                    r.status === "Pending" ||
                    r.status === "Accepted"
                )
        );

    };


    return (

        <div className="app-layout">

            <Navbar />

            <div className="body-layout">

                <Sidebar />

                <main className="main-content">

                    {/* HEADER */}

                    <div className="page-header">

                        <span className="welcome-label">
                            BOOK RESERVATIONS
                        </span>

                        <h1>
                            {isAdmin
                                ? "Reservation Requests"
                                : "My Reservations"
                            }
                        </h1>

                        <p>
                            {isAdmin
                                ? "Review member requests and issue books when available."
                                : "Reserve unavailable books and track your requests."
                            }
                        </p>

                    </div>


                    {/* MEMBER BOOKS */}

                    {!isAdmin && (

                        <div className="content-card reservation-books-card">

                            <div className="card-heading">

                                <div>

                                    <h3>
                                        📚 Unavailable Books
                                    </h3>

                                    <p>
                                        Reserve a book when no copy is currently available.
                                    </p>

                                </div>

                            </div>


                            <div className="reservation-book-grid">

                                {books
                                    .filter(
                                        book =>
                                            Number(
                                                book.available_copies
                                            ) === 0
                                    )
                                    .map(book => {

                                        const existing =
                                            getBookReservation(
                                                book.id
                                            );

                                        return (

                                            <div
                                                className="reservation-book-card"
                                                key={book.id}
                                            >

                                                <div className="book-card-icon">
                                                    📖
                                                </div>

                                                <div className="book-card-info">

                                                    <h3>
                                                        {book.title}
                                                    </h3>

                                                    <p>
                                                        By {book.author}
                                                    </p>

                                                    <span className="category-badge">
                                                        {book.category}
                                                    </span>

                                                </div>

                                                <div className="book-availability">

                                                    <span>
                                                        Available
                                                    </span>

                                                    <strong>
                                                        0 / {book.total_copies}
                                                    </strong>

                                                </div>


                                                {existing ? (

                                                    <button
                                                        className="secondary-action"
                                                        disabled
                                                    >
                                                        ✓ {existing.status}
                                                    </button>

                                                ) : (

                                                    <button
                                                        className="secondary-action"
                                                        disabled={
                                                            reserving === book.id
                                                        }
                                                        onClick={() =>
                                                            reserveBook(
                                                                book.id
                                                            )
                                                        }
                                                    >

                                                        {reserving === book.id
                                                            ? "Sending..."
                                                            : "📌 Reserve Book"
                                                        }

                                                    </button>

                                                )}

                                            </div>

                                        );

                                    })}

                            </div>

                        </div>

                    )}


                    {/* INFORMATION */}

                    <div className="member-info-banner">

                        {isAdmin ? (

                            <>
                                🛡️ Pending reservations can be accepted
                                when a copy becomes available.
                                Accepting a request automatically issues
                                the book for 7 days.
                            </>

                        ) : (

                            <>
                                📌 Available books ko <strong>Books</strong>
                                page se directly <strong>Book Now</strong>
                                karein. Unavailable books ko yahan se
                                <strong> Reserve</strong> karein.
                            </>

                        )}

                    </div>


                    {/* HISTORY */}

                    <div className="content-card">

                        <div className="card-heading">

                            <div>

                                <h3>
                                    {isAdmin
                                        ? "All Reservation Requests"
                                        : "Your Reservation History"
                                    }
                                </h3>

                                <p>
                                    {reservations.length}
                                    {" "}
                                    reservation(s)
                                </p>

                            </div>

                        </div>


                        <div className="table-wrap">

                            <table>

                                <thead>

                                    <tr>

                                        <th>ID</th>

                                        {isAdmin && (
                                            <th>Member</th>
                                        )}

                                        <th>Book</th>

                                        <th>Available</th>

                                        <th>Date</th>

                                        <th>Status</th>

                                        {isAdmin && (
                                            <th>Action</th>
                                        )}

                                    </tr>

                                </thead>


                                <tbody>

                                    {reservations.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={
                                                    isAdmin
                                                        ? 7
                                                        : 5
                                                }
                                                style={{
                                                    textAlign:
                                                        "center",
                                                    padding:
                                                        "40px"
                                                }}
                                            >
                                                No reservations yet.
                                            </td>

                                        </tr>

                                    ) : (

                                        reservations.map(
                                            r => (

                                                <tr
                                                    key={r.id}
                                                >

                                                    <td>
                                                        #{r.id}
                                                    </td>

                                                    {isAdmin && (

                                                        <td>
                                                            <strong>
                                                                {r.member_name}
                                                            </strong>
                                                        </td>

                                                    )}

                                                    <td>
                                                        <strong>
                                                            {r.book_title}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {r.available_copies}
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            r.reservation_date
                                                        ).toLocaleDateString()}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                `status-badge ${
                                                                    r.status === "Accepted"
                                                                        ? "returned"
                                                                        : r.status === "Rejected"
                                                                            ? "danger"
                                                                            : "active"
                                                                }`
                                                            }
                                                        >
                                                            {r.status}
                                                        </span>

                                                    </td>

                                                    {isAdmin && (

                                                        <td>

                                                            {r.status === "Pending" ? (

                                                                Number(
                                                                    r.available_copies
                                                                ) > 0 ? (

                                                                    <button
                                                                        className="secondary-action"
                                                                        onClick={() =>
                                                                            accept(
                                                                                r.id
                                                                            )
                                                                        }
                                                                    >
                                                                        ✓ Accept & Issue
                                                                    </button>

                                                                ) : (

                                                                    <span className="waiting-text">
                                                                        Waiting for copy
                                                                    </span>

                                                                )

                                                            ) : (

                                                                <span className="completed-text">
                                                                    {r.status}
                                                                </span>

                                                            )}

                                                        </td>

                                                    )}

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}