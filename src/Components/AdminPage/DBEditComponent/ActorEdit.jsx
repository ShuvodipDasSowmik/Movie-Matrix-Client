import React, { useEffect, useState } from 'react';
import { FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const PAGE_SIZE = 10;

export default function ActorEdit() {
  const [actors, setActors] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newActor, setNewActor] = useState({ name: '' });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/actors?offset=${offset}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setActors(data.items);
        setTotal(data.total);
        setLoading(false);
      });
  }, [offset]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this actor?')) return;
    fetch(`/api/actors/${id}`, { method: 'DELETE' })
      .then(() => setActors(actors.filter(a => a.id !== id)));
  };

  const handleAdd = () => setAdding(true);

  const handleConfirmAdd = () => {
    fetch('/api/actors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActor),
    })
      .then(res => res.json())
      .then(actor => {
        setActors([actor, ...actors]);
        setAdding(false);
        setNewActor({ name: '' });
      });
  };

  return (
    <div className="db-edit-component">
      <div className="db-edit-header">
        <FaPlus className="db-edit-plus" onClick={handleAdd} title="Add Actor" />
        <span className="db-edit-title">Actors</span>
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
                  value={newActor.name}
                  onChange={e => setNewActor({ ...newActor, name: e.target.value })}
                  placeholder="Actor Name"
                  className="db-edit-input"
                />
                <FaCheck className="db-edit-check" onClick={handleConfirmAdd} title="Confirm" />
              </td>
            </tr>
          )}
          {actors.map(actor => (
            <tr key={actor.id}>
              <td>
                <FaTrash className="db-edit-trash" onClick={() => handleDelete(actor.id)} title="Delete" />
              </td>
              <td>{actor.name}</td>
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
