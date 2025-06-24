import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const PAGE_SIZE = 10;

export default function MediaEdit() {
  const [media, setMedia] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newMedia, setNewMedia] = useState({ title: '', type: '' });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/media?offset=${offset}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setMedia(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  }, [offset]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this media?')) return;
    fetch(`/api/media/${id}`, { method: 'DELETE' })
      .then(() => setMedia(media.filter(m => m.id !== id)));
  };

  const handleAdd = () => setAdding(true);

  const handleConfirmAdd = () => {
    fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedia),
    })
      .then(res => res.json())
      .then(m => {
        setMedia([m, ...media]);
        setAdding(false);
        setNewMedia({ title: '', type: '' });
      });
  };

  return (
    <div className="db-edit-component">
      <div className="db-edit-header">
        <FaPlus className="db-edit-plus" onClick={handleAdd} title="Add Media" />
        <span className="db-edit-title">Media</span>
      </div>
      <table className="db-edit-table">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {adding && (
            <tr>
              <td></td>
              <td>
                <input
                  value={newMedia.title}
                  onChange={e => setNewMedia({ ...newMedia, title: e.target.value })}
                  placeholder="Title"
                  className="db-edit-input"
                />
              </td>
              <td>
                <input
                  value={newMedia.type}
                  onChange={e => setNewMedia({ ...newMedia, type: e.target.value })}
                  placeholder="Type"
                  className="db-edit-input"
                />
                <FaCheck className="db-edit-check" onClick={handleConfirmAdd} title="Confirm" />
              </td>
            </tr>
          )}
          {media.map(m => (
            <tr key={m.id}>
              <td>
                <FaTrash className="db-edit-trash" onClick={() => handleDelete(m.id)} title="Delete" />
              </td>
              <td>{m.title}</td>
              <td>{m.type}</td>
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
