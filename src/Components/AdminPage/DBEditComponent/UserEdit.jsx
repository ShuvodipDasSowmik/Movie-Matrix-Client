import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const PAGE_SIZE = 10;

export default function UserEdit() {
  const [users, setUsers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '' });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?offset=${offset}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  }, [offset]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this user?')) return;
    fetch(`/api/users/${id}`, { method: 'DELETE' })
      .then(() => setUsers(users.filter(u => u.id !== id)));
  };

  const handleAdd = () => setAdding(true);

  const handleConfirmAdd = () => {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(user => {
        setUsers([user, ...users]);
        setAdding(false);
        setNewUser({ username: '', email: '' });
      });
  };

  return (
    <div className="db-edit-component">
      <div className="db-edit-header">
        <FaPlus className="db-edit-plus" onClick={handleAdd} title="Add User" />
        <span className="db-edit-title">Users</span>
      </div>
      <table className="db-edit-table">
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr>
              <td></td>
              <td>
                <input
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Username"
                  className="db-edit-input"
                />
              </td>
              <td>
                <input
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Email"
                  className="db-edit-input"
                />
                <FaCheck className="db-edit-check" onClick={handleConfirmAdd} title="Confirm" />
              </td>
            </tr>
          )}
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <FaTrash className="db-edit-trash" onClick={() => handleDelete(user.id)} title="Delete" />
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="db-edit-pagination">
        <button disabled={offset === 0} onClick={() => setOffset(offset - PAGE_SIZE)}>
          Previous
        </button>
        <span>
          Showing {offset + 1} - {Math.min(offset + PAGE_SIZE, total)} of {total}
        </span>
        <button disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
          Next
        </button>
      </div>
      {loading && <div>Loading...</div>}
    </div>
  );
}
