import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const PAGE_SIZE = 10;

export default function DirectorEdit() {
  const [directors, setDirectors] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDirector, setNewDirector] = useState({ name: '' });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/directors?offset=${offset}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setDirectors(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  }, [offset]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this director?')) return;
    fetch(`/api/directors/${id}`, { method: 'DELETE' })
      .then(() => setDirectors(directors.filter(d => d.id !== id)));
  };

  const handleAdd = () => setAdding(true);

  const handleConfirmAdd = () => {
    fetch('/api/directors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDirector),
    })
      .then(res => res.json())
      .then(director => {
        setDirectors([director, ...directors]);
        setAdding(false);
        setNewDirector({ name: '' });
      });
  };

  return (
    <div className="db-edit-component">
      <div className="db-edit-header">
        <FaPlus className="db-edit-plus" onClick={handleAdd} title="Add Director" />
        <span className="db-edit-title">Directors</span>
      </div>
      <table className="db-edit-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr>
              <td></td>
              <td>
                <input
                  value={newDirector.name}
                  onChange={e => setNewDirector({ ...newDirector, name: e.target.value })}
                  placeholder="Director Name"
                  className="db-edit-input"
                />
                <FaCheck className="db-edit-check" onClick={handleConfirmAdd} title="Confirm" />
              </td>
            </tr>
          )}
          {directors.map(director => (
            <tr key={director.id}>
              <td>
                <FaTrash className="db-edit-trash" onClick={() => handleDelete(director.id)} title="Delete" />
              </td>
              <td>{director.name}</td>
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
