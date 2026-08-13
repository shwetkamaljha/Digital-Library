import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Books() {

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isAdmin =
        user.role === "admin" ||
        user.role === "librarian";

    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [loadingBook, setLoadingBook] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        title: "",
        author: "",
        category: "",
        isbn: "",
        total_copies: "",
        available_copies: ""
    };

    const [form, setForm] = useState(emptyForm);


    // =====================================
    // LOAD BOOKS
    // =====================================

    const loadBooks = async () => {

        try {

            const res = await API.get("/books");

            setBooks(res.data || []);

        } catch (error) {

            console.error("LOAD BOOKS ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to Load Books"
            );

        }

    };


    useEffect(() => {

        loadBooks();

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
    // ADD / UPDATE BOOK
    // ADMIN ONLY
    // =====================================

    const saveBook = async (e) => {

        e.preventDefault();

        const payload = {
            ...form,
            total_copies: Number(form.total_copies),
            available_copies: Number(form.available_copies)
        };

        try {

            if (editingId) {

                await API.put(
                    `/books/${editingId}`,
                    payload
                );

                alert("Book Updated Successfully");

            } else {

                await API.post(
                    "/books",
                    payload
                );

                alert("Book Added Successfully");

            }

            setForm(emptyForm);
            setEditingId(null);

            await loadBooks();

        } catch (error) {

            console.error("SAVE BOOK ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to Save Book"
            );

        }

    };


    // =====================================
    // EDIT BOOK
    // =====================================

    const editBook = (book) => {

        setEditingId(book.id);

        setForm({
            title: book.title || "",
            author: book.author || "",
            category: book.category || "",
            isbn: book.isbn || "",
            total_copies: book.total_copies || "",
            available_copies: book.available_copies || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // =====================================
    // DELETE BOOK
    // =====================================

    const deleteBook = async (id) => {

        if (!window.confirm("Delete this book?")) {
            return;
        }

        try {

            await API.delete(`/books/${id}`);

            alert("Book Deleted Successfully");

            await loadBooks();

        } catch (error) {

            console.error("DELETE BOOK ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to Delete Book"
            );

        }

    };


    // =====================================
    // MEMBER → BOOK NOW
    // AVAILABLE BOOK = DIRECT ISSUE
    // =====================================

    const borrowBook = async (book) => {

        if (!user.id) {

            alert("Please login first.");

            return;
        }

        if (Number(book.available_copies) <= 0) {

            alert(
                "This book is currently unavailable. Please reserve it."
            );

            return;
        }


        const confirmBorrow = window.confirm(
            `Book "${book.title}" now?\n\n` +
            `The book will be issued immediately for 7 days.`
        );

        if (!confirmBorrow) {
            return;
        }


        setLoadingBook(book.id);


        try {

            // =====================================
            // ISSUE DATE
            // =====================================

            const issueDate = new Date();


            // =====================================
            // DUE DATE = 7 DAYS
            // =====================================

            const dueDate = new Date(issueDate);

            dueDate.setDate(
                dueDate.getDate() + 7
            );


            // =====================================
            // FORMAT DATE
            // =====================================

            const formatDate = (date) => {

                const year =
                    date.getFullYear();

                const month =
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        date.getDate()
                    ).padStart(2, "0");

                return `${year}-${month}-${day}`;

            };


            // =====================================
            // LOAN DATA
            // =====================================

            const payload = {

                member_id: Number(user.id),

                book_id: Number(book.id),

                issue_date:
                    formatDate(issueDate),

                due_date:
                    formatDate(dueDate)

            };


            console.log(
                "BOOK NOW REQUEST:",
                payload
            );


            // =====================================
            // DIRECTLY ISSUE BOOK
            // =====================================

            const response = await API.post(
                "/loans/issue",
                payload
            );


            console.log(
                "BOOK NOW RESPONSE:",
                response.data
            );


            alert(
                `Book "${book.title}" issued successfully!\n\n` +
                `Due Date: ${formatDate(dueDate)}`
            );


            // =====================================
            // REFRESH BOOKS
            // AVAILABLE COPIES -1
            // =====================================

            await loadBooks();


        } catch (error) {

            console.error(
                "BOOK NOW ERROR:",
                error
            );

            console.error(
                "BOOK NOW RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                error.message ||
                "Unable to Borrow Book"
            );

        } finally {

            setLoadingBook(null);

        }

    };


    // =====================================
    // MEMBER → RESERVE
    // ONLY WHEN UNAVAILABLE
    // =====================================

    const reserveBook = async (bookId) => {

        if (!user.id) {

            alert("Please login first.");

            return;
        }


        try {

            const response = await API.post(
                "/reservations",
                {
                    book_id: Number(bookId)
                }
            );


            alert(
                response.data?.message ||
                "Book Reserved Successfully"
            );


        } catch (error) {

            console.error(
                "RESERVE BOOK ERROR:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Reservation Failed"
            );

        }

    };


    // =====================================
    // SEARCH
    // =====================================

    const filteredBooks = books.filter((book) => {

        const text =
            search.toLowerCase();

        return (

            book.title
                ?.toLowerCase()
                .includes(text) ||

            book.author
                ?.toLowerCase()
                .includes(text) ||

            book.category
                ?.toLowerCase()
                .includes(text) ||

            book.isbn
                ?.toLowerCase()
                .includes(text)

        );

    });


    return (

        <div className="app-layout">

            <Navbar />

            <div className="body-layout">

                <Sidebar />

                <main className="main-content">


                    {/* =====================================
                        PAGE HEADER
                    ===================================== */}

                    <div className="page-header">

                        <span className="welcome-label">
                            LIBRARY COLLECTION
                        </span>

                        <h1>
                            Books
                        </h1>

                        <p>

                            {isAdmin

                                ? "Manage the library catalog and inventory."

                                : "Search books, borrow available books or reserve unavailable books."

                            }

                        </p>

                    </div>


                    {/* =====================================
                        SEARCH
                    ===================================== */}

                    <div className="content-card">

                        <input

                            className="search-input"

                            placeholder="🔍 Search by title, author, category or ISBN..."

                            value={search}

                            onChange={(e) =>
                                setSearch(e.target.value)
                            }

                        />

                    </div>


                    {/* =====================================
                        ADMIN ADD / EDIT BOOK
                    ===================================== */}

                    {isAdmin && (

                        <div className="form-card">

                            <div className="card-heading">

                                <div>

                                    <h3>

                                        {editingId
                                            ? "Edit Book"
                                            : "Add New Book"
                                        }

                                    </h3>

                                    <p>
                                        Admin-only catalog management
                                    </p>

                                </div>


                                {editingId && (

                                    <button

                                        className="cancel-btn"

                                        type="button"

                                        onClick={() => {

                                            setEditingId(null);

                                            setForm(emptyForm);

                                        }}

                                    >

                                        Cancel Edit

                                    </button>

                                )}

                            </div>


                            <form
                                onSubmit={saveBook}
                                className="book-form"
                            >

                                <input
                                    name="title"
                                    placeholder="Book Title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="author"
                                    placeholder="Author"
                                    value={form.author}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="category"
                                    placeholder="Category"
                                    value={form.category}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    name="isbn"
                                    placeholder="ISBN"
                                    value={form.isbn}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="number"
                                    min="1"
                                    name="total_copies"
                                    placeholder="Total Copies"
                                    value={form.total_copies}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="number"
                                    min="0"
                                    name="available_copies"
                                    placeholder="Available Copies"
                                    value={form.available_copies}
                                    onChange={handleChange}
                                    required
                                />

                                <button className="primary-action">

                                    {editingId
                                        ? "✓ Update Book"
                                        : "+ Add Book"
                                    }

                                </button>

                            </form>

                        </div>

                    )}


                    {/* =====================================
                        MEMBER INFORMATION
                    ===================================== */}

                    {!isAdmin && (

                        <div className="member-info-banner">

                            📖 <strong>Book Now:</strong>{" "}
                            If a book is available, click
                            <strong> Book Now </strong>
                            to get the book immediately for 7 days.

                            <br />

                            📌 <strong>Reserve:</strong>{" "}
                            If no copy is available, click
                            <strong> Reserve </strong>
                            to send a reservation request.

                        </div>

                    )}


                    {/* =====================================
                        BOOK COLLECTION
                    ===================================== */}

                    <div className="content-card">

                        <div className="card-heading">

                            <div>

                                <h3>
                                    Book Collection
                                </h3>

                                <p>
                                    {filteredBooks.length}
                                    {" "}
                                    books found
                                </p>

                            </div>

                        </div>


                        <div className="table-wrap">

                            <table>

                                <thead>

                                    <tr>

                                        <th>ID</th>

                                        <th>Title</th>

                                        <th>Author</th>

                                        <th>Category</th>

                                        <th>ISBN</th>

                                        <th>Total</th>

                                        <th>Available</th>

                                        <th>Action</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredBooks.map(
                                        (book) => (

                                            <tr
                                                key={book.id}
                                            >

                                                <td>
                                                    #{book.id}
                                                </td>


                                                <td>

                                                    <strong>
                                                        {book.title}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {book.author}
                                                </td>


                                                <td>

                                                    <span className="category-badge">

                                                        {book.category}

                                                    </span>

                                                </td>


                                                <td>
                                                    {book.isbn}
                                                </td>


                                                <td>
                                                    {book.total_copies}
                                                </td>


                                                <td>

                                                    <span

                                                        className={
                                                            Number(
                                                                book.available_copies
                                                            ) > 0

                                                                ? "available-count"

                                                                : "unavailable-count"
                                                        }

                                                    >

                                                        {book.available_copies}

                                                    </span>

                                                </td>


                                                <td>


                                                    {/* =====================================
                                                        ADMIN ACTIONS
                                                    ===================================== */}

                                                    {isAdmin ? (

                                                        <div className="table-actions">

                                                            <button

                                                                className="edit-btn"

                                                                onClick={() =>
                                                                    editBook(book)
                                                                }

                                                            >

                                                                Edit

                                                            </button>


                                                            <button

                                                                className="delete-btn action-btn"

                                                                onClick={() =>
                                                                    deleteBook(
                                                                        book.id
                                                                    )
                                                                }

                                                            >

                                                                Delete

                                                            </button>

                                                        </div>

                                                    ) : Number(
                                                        book.available_copies
                                                    ) > 0 ? (


                                                        /* =====================================
                                                           MEMBER → BOOK NOW
                                                        ===================================== */

                                                        <button

                                                            className="primary-action"

                                                            disabled={
                                                                loadingBook ===
                                                                book.id
                                                            }

                                                            onClick={() =>
                                                                borrowBook(
                                                                    book
                                                                )
                                                            }

                                                        >

                                                            {loadingBook ===
                                                            book.id

                                                                ? "Processing..."

                                                                : "📖 Book Now"

                                                            }

                                                        </button>

                                                    ) : (


                                                        /* =====================================
                                                           MEMBER → RESERVE
                                                        ===================================== */

                                                        <button

                                                            className="secondary-action"

                                                            onClick={() =>
                                                                reserveBook(
                                                                    book.id
                                                                )
                                                            }

                                                        >

                                                            📌 Reserve

                                                        </button>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}


                                    {/* =====================================
                                        NO BOOKS
                                    ===================================== */}

                                    {filteredBooks.length === 0 && (

                                        <tr>

                                            <td

                                                colSpan="8"

                                                style={{
                                                    textAlign: "center",
                                                    padding: "30px"
                                                }}

                                            >

                                                No books found.

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