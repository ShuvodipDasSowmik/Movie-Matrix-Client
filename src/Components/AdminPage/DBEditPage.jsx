import React, { useState } from 'react';
import UserEdit from './DBEditComponent/UserEdit';
import ActorEdit from './DBEditComponent/ActorEdit';
import DirectorEdit from './DBEditComponent/DirectorEdit';
import StudioEdit from './DBEditComponent/StudioEdit';
import MediaEdit from './DBEditComponent/MediaEdit';

const COMPONENTS = {
  Users: UserEdit,
  Actors: ActorEdit,
  Directors: DirectorEdit,
  Studio: StudioEdit,
  Media: MediaEdit,
};

export default function DBEditPage() {
  const [selected, setSelected] = useState('Users');
  const SelectedComponent = COMPONENTS[selected];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {Object.keys(COMPONENTS).map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            style={{
              padding: '8px 20px',
              fontWeight: selected === key ? 'bold' : 'normal',
              background: selected === key ? '#0056b3' : '#f0f0f0',
              color: selected === key ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <div>
        <SelectedComponent />
      </div>
    </div>
  );
}
