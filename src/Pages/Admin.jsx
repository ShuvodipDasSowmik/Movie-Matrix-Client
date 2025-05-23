import React, { useEffect, useState } from "react";
import DataTable from "../Components/DataTable";
import useFileUpload from "../Hooks/useFileUpload";
import "./Admin.css";

const Admin = () => {
    const { file, data, error, handleFileChange, clearFile } = useFileUpload();
    const [submissionStatus, setSubmissionStatus] = useState({
        loading: false,
        success: false,
        error: null
    });
    
    const handleDatabaseEntry = async () => {
        if (!data || data.length === 0) {
            setSubmissionStatus({
                loading: false,
                success: false,
                error: "No data to submit. Please upload a CSV file first."
            });
            return;
        }
        
        setSubmissionStatus({
            loading: true,
            success: false,
            error: null
        });
        
        try {
            // Replace with your actual API endpoint
            const response = await fetch('http://localhost:3000/adminEntry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movies: data }),
            });

            console.log(response);
            
            
            if (!response.ok) {
                throw new Error('Failed to submit data to database');
            }
            
            setSubmissionStatus({
                loading: false,
                success: true,
                error: null
            });
            
            // Optional: Clear data after successful submission
            // clearFile();
            
        } catch (error) {
            setSubmissionStatus({
                loading: false,
                success: false,
                error: error.message
            });
        }
    };

    // Reset success message after 5 seconds
    useEffect(() => {
        let timer;
        if (submissionStatus.success) {
            timer = setTimeout(() => {
                setSubmissionStatus(prev => ({ ...prev, success: false }));
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [submissionStatus.success]);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Upload and manage your movie data</p>
            </div>

            <div className="admin-content">
                <div className="file-upload-section">
                    <h2>Upload CSV File</h2>
                    <div className="file-input-container">
                        <label className="file-input-label">
                            Choose File
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                        </label>

                        {file && (
                            <button
                                className="file-remove-button"
                                onClick={clearFile}
                                title="Remove file"
                            >
                                Remove File
                            </button>
                        )}
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {file && <p className="file-name-display">File selected: {file.name}</p>}
                </div>

                <div className="data-table-section">
                    <div className="data-table-header">
                        <h2>Uploaded Data</h2>
                        {data && data.length > 0 && (
                            <button 
                                className="database-entry-button"
                                onClick={handleDatabaseEntry}
                                disabled={submissionStatus.loading || !data.length}
                            >
                                {submissionStatus.loading ? 'Processing...' : 'Entry to Database'}
                            </button>
                        )}
                    </div>
                    
                    {submissionStatus.success && (
                        <p className="success-message">Data successfully submitted to database!</p>
                    )}
                    {submissionStatus.error && (
                        <p className="error-message">{submissionStatus.error}</p>
                    )}
                    
                    {data && data.length > 0 ? (
                        <DataTable data={data} />
                    ) : (
                        <p className="empty-state">No data to display. Please upload a CSV file.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;