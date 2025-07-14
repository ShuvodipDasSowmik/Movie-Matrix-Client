import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ComponentStyles/DataTable.css';

const DataTable = ({ data }) => {
  if (!data || !data.length) {
    return <p className="empty-state">No data to display.</p>;
  }
  
  const headers = Object.keys(data[0]);
  
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, cellIndex) => (
                <td key={cellIndex}>{row[header]?.toString() || '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;