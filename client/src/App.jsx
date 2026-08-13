import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Loans from "./pages/Loans";
import MyLoans from "./pages/MyLoans";
import Reservations from "./pages/Reservations";

export default function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/books"
                    element={<Books />}
                />

                <Route
                    path="/members"
                    element={<Members />}
                />

                <Route
                    path="/loans"
                    element={<Loans />}
                />

                <Route
                    path="/my-loans"
                    element={<MyLoans />}
                />

                <Route
                    path="/reservations"
                    element={<Reservations />}
                />

            </Routes>

        </BrowserRouter>
    );
}