import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Pages/PageStyles/Admin.css';
import '../Components/ComponentStyles/AdminUserEmailTable.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AdminUserEmailTable() {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState(''); // Add subject state
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/users`);
                console.log('Fetched Users:', res.data.users);
                
                if (res.data.users && Array.isArray(res.data.users)) {
                    setUsers(res.data.users);
                } else {
                    console.error('Users data is not in expected format:', res.data);
                    setUsers([]);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, []);

    const handleCheckbox = (username) => {
        console.log('Toggling checkbox for username:', username);
        
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(username)) {
                newSet.delete(username);
            } else {
                newSet.add(username);
            }
            return newSet;
        });
    };

    const handleSend = async () => {
        setSending(true);
        const selectedUsers = users.filter(user => selected.has(user.username));
        
        try {
            await axios.post(`${API_URL}/admin/send-email`, {
                users: selectedUsers,
                subject, // Send subject to backend
                message
            });
            alert('Emails sent successfully!');
            setSelected(new Set());
            setMessage('');
            setSubject(''); // Clear subject after send
        }
        
        catch (error) {
            console.error('Error sending emails:', error);
            alert('Failed to send emails. Please try again.');
        }
        
        finally {
            setSending(false);
        }
    };

    return (
        <div className="data-table-section email-users-section">
            <div className="data-table-header">
                <h2>Send Email to Users</h2>
            </div>

            <div className="email-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th className="checkbox-column"></th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Full Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="empty-state">Loading users...</td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.username}>
                                    <td className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(user.username)}
                                            onChange={() => handleCheckbox(user.username)}
                                        />
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.fullname}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="empty-state">No users available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="email-compose-section">
                <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="email-subject-input"
                />
                <textarea
                    placeholder="Enter your message to selected users"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    className="email-message-input"
                />
                <button
                    onClick={handleSend}
                    disabled={sending || selected.size === 0 || !message.trim() || !subject.trim()}
                    className="database-entry-button email-send-button"
                >
                    {sending ? 'Sending...' : `Send Email to ${selected.size} User(s)`}
                </button>
                {selected.size > 0 && (
                    <p className="selected-count">
                        {selected.size} user(s) selected
                    </p>
                )}
            </div>
        </div>
    );
}

export default AdminUserEmailTable;
