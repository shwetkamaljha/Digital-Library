import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Members() {
    const [members, setMembers] = useState([]);

    const loadMembers = async () => {
        try {
            const res = await API.get("/members");
            setMembers(res.data);
        } catch (error) {
            alert(error.response?.data?.message || "Unable to Load Members");
        }
    };

    useEffect(() => { loadMembers(); }, []);

    const editMember = async (member) => {
        const name = window.prompt("Member Name", member.name);
        if (name === null) return;

        const email = window.prompt("Email", member.email);
        if (email === null) return;

        const phone = window.prompt("Phone", member.phone || "");
        if (phone === null) return;

        try {
            await API.put(`/members/${member.id}`, {
                name,
                email,
                phone,
                role: member.role
            });
            alert("Member Updated Successfully");
            loadMembers();
        } catch (error) {
            alert(error.response?.data?.message || "Member Update Failed");
        }
    };

    const deleteMember = async (id) => {
        if (!window.confirm("Delete this member?")) return;

        try {
            await API.delete(`/members/${id}`);
            alert("Member Deleted Successfully");
            loadMembers();
        } catch (error) {
            alert(error.response?.data?.message || "Member Delete Failed");
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <div className="body-layout">
                <Sidebar />

                <main className="main-content">
                    <div className="page-header">
                        <span className="welcome-label">USER MANAGEMENT</span>
                        <h1>Members</h1>
                        <p>Manage members who registered through the public registration page.</p>
                    </div>

                    <div className="member-info-banner">
                        👤 Members create their own account and password from the Register page. Admin does not set member passwords.
                    </div>

                    <div className="content-card">
                        <div className="card-heading">
                            <div>
                                <h3>Registered Members</h3>
                                <p>{members.length} member(s)</p>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(member => (
                                        <tr key={member.id}>
                                            <td>#{member.id}</td>
                                            <td><strong>{member.name}</strong></td>
                                            <td>{member.email}</td>
                                            <td>{member.phone}</td>
                                            <td><span className="category-badge">{member.role}</span></td>
                                            <td>
                                                <button className="edit-btn" onClick={() => editMember(member)}>Edit</button>
                                                {member.id !== JSON.parse(localStorage.getItem("user") || "{}").id && (
                                                    <button className="delete-btn action-btn" onClick={() => deleteMember(member.id)}>
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
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
