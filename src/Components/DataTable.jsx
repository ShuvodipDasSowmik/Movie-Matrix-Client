import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ComponentStyles/DataTable.css';

const DataTable = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-muted">No data available</p>;
    }

    // Get all unique headers
    const headers = [...new Set(data.flatMap(item => Object.keys(item)))];

    return (
        <div className="table-responsive data-table-container">
            <table className="table table-striped table-hover table-bordered">
                <thead className="table-header">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} scope="col">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {headers.map((header, idx) => (
                                <td key={`${index}-${idx}`}>{row[header] || ''}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;