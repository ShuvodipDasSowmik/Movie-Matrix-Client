import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const PAGE_SIZE = 10;

export default function StudioEdit() {
  const [studios, setStudios] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newStudio, setNewStudio] = useState({ name: '' });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/studios?offset=${offset}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setStudios(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  }, [offset]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this studio?')) return;
    fetch(`/api/studios/${id}`, { method: 'DELETE' })
      .then(() => setStudios(studios.filter(s => s.id !== id)));
  };

  const handleAdd = () => setAdding(true);

  const handleConfirmAdd = () => {
    fetch('/api/studios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudio),
    })
      .then(res => res.json())
      .then(studio => {
        setStudios([studio, ...studios]);
        setAdding(false);
        setNewStudio({ name: '' });
      });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <FaPlus style={{ cursor: 'pointer', color: '#0056b3', fontSize: 22 }} onClick={handleAdd} title="Add Studio" />
        <span style={{ marginLeft: 8, fontWeight: 500 }}>Studios</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
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
                  value={newStudio.name}
                  onChange={e => setNewStudio({ ...newStudio, name: e.target.value })}
                  placeholder="Studio Name"
                  style={{ width: '90%' }}
                />
                <FaCheck style={{ color: 'green', marginLeft: 8, cursor: 'pointer' }} onClick={handleConfirmAdd} title="Confirm" />
              </td>
            </tr>
          )}
          {studios.map(studio => (
            <tr key={studio.id}>
              <td>
                <FaTrash style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(studio.id)} title="Delete" />
              </td>
              <td>{studio.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
