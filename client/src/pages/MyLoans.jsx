import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function MyLoans() {

    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);


    // =====================================
    // LOAD MEMBER LOANS
    // =====================================

    const loadLoans = async () => {

        try {

            setLoading(true);

            const res =
                await API.get(
                    "/loans/my-history"
                );

            setLoans(
                res.data || []
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to Load Borrowing History"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadLoans();

    }, []);


    return (

        <div className="app-layout">

            <Navbar />

            <div className="body-layout">

                <Sidebar />

                <main className="main-content">

                    {/* HEADER */}

                    <div className="page-header">

                        <div>

                            <span className="welcome-label">
                                MEMBER AREA
                            </span>

                            <h1>
                                My Borrowing History
                            </h1>

                            <p>
                                Track your issued and returned books.
                            </p>

                        </div>

                    </div>


                    {/* SUMMARY */}

                    <div className="member-info-banner">

                        📚 Total Borrowing Records:
                        {" "}
                        <strong>
                            {loans.length}
                        </strong>

                        {" | "}

                        💰 Total Fine:
                        {" "}
                        <strong>
                            ₹
                            {loans
                                .reduce(
                                    (total, loan) =>
                                        total +
                                        Number(
                                            loan.fine || 0
                                        ),
                                    0
                                )
                                .toFixed(2)}
                        </strong>

                    </div>


                    {/* LOANS */}

                    <div className="content-card">

                        <div className="card-heading">

                            <div>

                                <h3>
                                    My Books
                                </h3>

                                <p>
                                    Your borrowing history
                                </p>

                            </div>

                        </div>


                        <div className="table-wrap">

                            <table>

                                <thead>

                                    <tr>

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

                                    </tr>

                                </thead>


                                <tbody>

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                style={{
                                                    textAlign:
                                                        "center",
                                                    padding:
                                                        "30px"
                                                }}
                                            >
                                                Loading...
                                            </td>

                                        </tr>

                                    ) : loans.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                style={{
                                                    textAlign:
                                                        "center",
                                                    padding:
                                                        "40px"
                                                }}
                                            >

                                                No borrowing history found.

                                            </td>

                                        </tr>

                                    ) : (

                                        loans.map(
                                            loan => (

                                                <tr
                                                    key={
                                                        loan.id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                loan.book_title
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        {loan.issue_date
                                                            ? new Date(
                                                                loan.issue_date
                                                            ).toLocaleDateString()
                                                            : "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        {loan.due_date
                                                            ? new Date(
                                                                loan.due_date
                                                            ).toLocaleDateString()
                                                            : "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        {loan.return_date
                                                            ? new Date(
                                                                loan.return_date
                                                            ).toLocaleDateString()
                                                            : "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                loan.status ===
                                                                "Returned"

                                                                    ? "status-badge returned"

                                                                    : "status-badge active"
                                                            }
                                                        >

                                                            {
                                                                loan.status
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <strong>
                                                            ₹
                                                            {Number(
                                                                loan.fine ||
                                                                0
                                                            ).toFixed(2)}
                                                        </strong>

                                                    </td>

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