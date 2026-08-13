import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Loans() {

    const [loans, setLoans] = useState([]);

    const [form, setForm] = useState({
        member_id: "",
        book_id: "",
        issue_date: "",
        due_date: ""
    });

    const [loading, setLoading] = useState(false);
    const [returningId, setReturningId] = useState(null);


    // =====================================
    // LOAD ALL LOANS
    // =====================================

    const loadLoans = async () => {

        try {

            const res = await API.get("/loans/history");

            setLoans(res.data || []);

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Unable to Load Loan History"
            );

        }

    };


    useEffect(() => {

        loadLoans();

    }, []);


    // =====================================
    // FORM CHANGE
    // =====================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // =====================================
    // ADMIN → ISSUE BOOK
    // =====================================

    const issueBook = async (e) => {

        e.preventDefault();

        if (!form.member_id || !form.book_id) {

            alert("Member ID and Book ID are required.");

            return;
        }

        try {

            setLoading(true);

            const res = await API.post(
                "/loans/admin/issue",
                {
                    member_id: Number(form.member_id),
                    book_id: Number(form.book_id),
                    issue_date: form.issue_date || undefined,
                    due_date: form.due_date || undefined
                }
            );

            alert(
                res.data.message ||
                "Book Issued Successfully"
            );

            setForm({
                member_id: "",
                book_id: "",
                issue_date: "",
                due_date: ""
            });

            await loadLoans();

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Unable to Issue Book"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // ADMIN → RETURN BOOK
    // =====================================

    const returnBook = async (id) => {

        if (
            !window.confirm(
                "Are you sure you want to return this book?"
            )
        ) {
            return;
        }

        try {

            setReturningId(id);

            const res = await API.put(
                `/loans/return/${id}`
            );

            const fine = Number(
                res.data.fine || 0
            );

            const lateDays = Number(
                res.data.late_days || 0
            );

            if (fine > 0) {

                alert(
                    `${res.data.message}\n\n` +
                    `Late Days: ${lateDays}\n` +
                    `Fine: ₹${fine.toFixed(2)}`
                );

            } else {

                alert(
                    `${res.data.message}\n\nFine: ₹0.00`
                );

            }

            await loadLoans();

        } catch (error) {

            console.log(error);

            alert(
                error.response?.data?.message ||
                "Unable to Return Book"
            );

        } finally {

            setReturningId(null);

        }

    };


    // =====================================
    // DATE FORMAT
    // =====================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString();

    };


    // =====================================
    // TOTAL FINE
    // =====================================

    const totalFine = loans.reduce(
        (total, loan) =>
            total + Number(loan.fine || 0),
        0
    );


    // =====================================
    // ACTIVE LOANS
    // =====================================

    const activeLoans = loans.filter(
        loan => loan.status !== "Returned"
    ).length;


    // =====================================
    // RETURNED LOANS
    // =====================================

    const returnedLoans = loans.filter(
        loan => loan.status === "Returned"
    ).length;


    return (

        <div className="app-layout">

            <Navbar />

            <div className="body-layout">

                <Sidebar />

                <main className="main-content">


                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div className="page-header">

                        <div>

                            <span className="welcome-label">
                                LIBRARY OPERATIONS
                            </span>

                            <h1>
                                Loans
                            </h1>

                            <p>
                                Issue, return and track library books.
                            </p>

                        </div>

                    </div>


                    {/* =====================================
                        SUMMARY
                    ===================================== */}

                    <div
                        className="content-card"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "15px",
                            marginBottom: "20px"
                        }}
                    >

                        <div>

                            <p>Total Loans</p>

                            <h2>
                                {loans.length}
                            </h2>

                        </div>


                        <div>

                            <p>Active Loans</p>

                            <h2>
                                {activeLoans}
                            </h2>

                        </div>


                        <div>

                            <p>Returned</p>

                            <h2>
                                {returnedLoans}
                            </h2>

                        </div>


                        <div>

                            <p>Total Fine</p>

                            <h2>
                                ₹{totalFine.toFixed(2)}
                            </h2>

                        </div>

                    </div>


                    {/* =====================================
                        ADMIN ISSUE BOOK
                    ===================================== */}

                    <div className="form-card">

                        <div className="card-heading">

                            <div>

                                <h3>
                                    📖 Issue a Book
                                </h3>

                                <p>
                                    Manually issue a book to a member.
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={issueBook}
                            className="book-form"
                        >


                            {/* MEMBER ID */}

                            <input
                                type="number"
                                min="1"
                                name="member_id"
                                placeholder="Member ID"
                                value={form.member_id}
                                onChange={handleChange}
                                required
                            />


                            {/* BOOK ID */}

                            <input
                                type="number"
                                min="1"
                                name="book_id"
                                placeholder="Book ID"
                                value={form.book_id}
                                onChange={handleChange}
                                required
                            />


                            {/* ISSUE DATE */}

                            <input
                                type="date"
                                name="issue_date"
                                value={form.issue_date}
                                onChange={handleChange}
                            />


                            {/* DUE DATE */}

                            <input
                                type="date"
                                name="due_date"
                                value={form.due_date}
                                onChange={handleChange}
                            />


                            {/* ISSUE BUTTON */}

                            <button
                                className="primary-action"
                                disabled={loading}
                            >

                                {loading
                                    ? "Issuing..."
                                    : "📖 Issue Book"
                                }

                            </button>

                        </form>

                        <div
                            className="member-info-banner"
                            style={{ marginTop: "15px" }}
                        >

                            📌 If issue date and due date are empty,
                            the system automatically uses today's date
                            and a 7-day borrowing period.

                        </div>

                    </div>


                    {/* =====================================
                        LOAN HISTORY
                    ===================================== */}

                    <div className="content-card">

                        <div className="card-heading">

                            <div>

                                <h3>
                                    Loan History
                                </h3>

                                <p>
                                    {loans.length} transaction(s)
                                </p>

                            </div>

                        </div>


                        <div className="table-wrap">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Member
                                        </th>

                                        <th>
                                            Book
                                        </th>

                                        <th>
                                            Issue Date
                                        </th>

                                        <th>
                                            Due Date
                                        </th>

                                        <th>
                                            Return Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Fine
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {loans.map(
                                        (loan) => (

                                            <tr
                                                key={loan.id}
                                            >


                                                {/* ID */}

                                                <td>
                                                    #{loan.id}
                                                </td>


                                                {/* MEMBER */}

                                                <td>

                                                    <strong>
                                                        {loan.member_name ||
                                                            `Member #${loan.member_id}`
                                                        }
                                                    </strong>

                                                </td>


                                                {/* BOOK */}

                                                <td>
                                                    <strong>
                                                        {loan.book_title ||
                                                            `Book #${loan.book_id}`
                                                        }
                                                    </strong>
                                                </td>


                                                {/* ISSUE DATE */}

                                                <td>
                                                    {formatDate(
                                                        loan.issue_date
                                                    )}
                                                </td>


                                                {/* DUE DATE */}

                                                <td>
                                                    {formatDate(
                                                        loan.due_date
                                                    )}
                                                </td>


                                                {/* RETURN DATE */}

                                                <td>

                                                    {loan.return_date
                                                        ? formatDate(
                                                            loan.return_date
                                                        )
                                                        : "-"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            loan.status ===
                                                            "Returned"

                                                                ? "status-badge returned"

                                                                : "status-badge active"
                                                        }
                                                    >

                                                        {loan.status}

                                                    </span>

                                                </td>


                                                {/* FINE */}

                                                <td>

                                                    <strong>

                                                        ₹
                                                        {Number(
                                                            loan.fine || 0
                                                        ).toFixed(2)}

                                                    </strong>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    {loan.status !==
                                                    "Returned" ? (

                                                        <button
                                                            className="secondary-action"
                                                            disabled={
                                                                returningId ===
                                                                loan.id
                                                            }
                                                            onClick={() =>
                                                                returnBook(
                                                                    loan.id
                                                                )
                                                            }
                                                        >

                                                            {returningId ===
                                                            loan.id
                                                                ? "Returning..."
                                                                : "↩ Return"
                                                            }

                                                        </button>

                                                    ) : (

                                                        <span className="completed-text">

                                                            ✓ Completed

                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}


                                    {/* EMPTY */}

                                    {loans.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                style={{
                                                    textAlign:
                                                        "center",
                                                    padding:
                                                        "40px"
                                                }}
                                            >

                                                No loan records found.

                                            </td>

                                        </tr>

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