import React, { useEffect, useState } from "react";
import DataTable from "../Components/DataTable";
import useFileUpload from "../Hooks/useFileUpload";
import "./PageStyles/Admin.css";
import AdminUserEmailTable from "../Components/AdminUserEmailTable";
import DatabaseOverview from "../Components/DatabaseOverview";
import UserInfo from "../Components/UserInfo";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Admin = () => {
    const { file, data, error, dataType, handleFileChange, clearFile, updateDataType, clearAll } = useFileUpload();
    const [submissionStatus, setSubmissionStatus] = useState({
        loading: false,
        success: false,
        error: null
    });
    
    const dataTypeRequirements = {
        genre: ['genrename'],
        studio: ['studioname', 'foundingyear', 'location'],
        director: ['directorname', 'biography', 'nationality', 'dob'],
        actor: ['actorname', 'biography', 'nationality', 'dob'],
        media: ['title', 'releaseyear', 'description', 'language', 'pgrating', 'trailerlink', 'mediatype', 'duration', 'isongoing'],
        mediaactor: ['media', 'actor'],
        mediadirector: ['media', 'director'],
        mediastudio: ['media', 'studio'],
        mediagenre: ['media', 'genre']
    };
    
    const validateData = () => {
        if (!dataType || !data || data.length === 0) return false;
        
        const requiredColumns = dataTypeRequirements[dataType];
        if (!requiredColumns) return false;
        
        // Check if headers (first row keys) match required columns
        const headers = Object.keys(data[0]).map(header => header.toLowerCase());
        console.log(headers);
        
        return requiredColumns.every(col => headers.includes(col.toLowerCase()));
    };
    
    const handleDataTypeChange = (e) => {
        const newType = e.target.value;
        updateDataType(newType);

        console.log(newType);
        
        // Clear any existing data and errors when changing type
        if (file) clearFile();
    };
    
    const handleDatabaseEntry = async () => {
        if (!data || data.length === 0) {
            setSubmissionStatus({
                loading: false,
                success: false,
                error: "No data to submit. Please upload a CSV file first."
            });
            return;
        }
        
        if (!dataType) {
            setSubmissionStatus({
                loading: false,
                success: false,
                error: "Please select a data type before submitting."
            });
            return;
        }
        
        if (!validateData()) {
            setSubmissionStatus({
                loading: false,
                success: false,
                error: `CSV file does not match the required columns for ${dataType} data.`
            });
            return;
        }
        
        setSubmissionStatus({
            loading: true,
            success: false,
            error: null
        });
        
        try {
            const response = await axios.post(`${API_URL}/admin`, {
                data: data,
                dataType: dataType
            });

            console.log(response);
            
            if(response.status === 207) {
                const errorData = response.data;
                const success = errorData.success;
                const failure = errorData.failure;
                throw new Error(errorData.message || 'Failed to submit data');
            }
            else if( response.status === 500) {
                const message = response.data.message;

                throw new Error('Internal server error. Please try again later.');
            }
            else if (response.status === 200) {
                const result = response.data;
                const message = result.message || 'Data submitted successfully';
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

    // Add this new function to determine why button is disabled
    const getButtonDisabledReason = () => {
        if (submissionStatus.loading) return "Processing your request...";
        if (!data || data.length === 0) return "No data available. Please upload a CSV file first.";
        if (!dataType) return "Please select a data type before submitting.";
        if (!validateData()) return `CSV file does not match the required columns for ${dataType} data.`;
        return null;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Upload and manage your movie data</p>
            </div>

            {/* User Location & Device Analytics */}
            <UserInfo />

            {/* DatabaseOverview component is not defined - commenting out for now */}
            <DatabaseOverview />

            <div className="admin-content">
                <div className="file-upload-section">
                    <h2>Upload CSV/XLSX File</h2>
                    
                    <div className="data-type-selection">
                        <h3>Select Data Type</h3>
                        <select 
                            value={dataType} 
                            onChange={handleDataTypeChange}
                            className="data-type-dropdown"
                        >
                            <option value="">-- Select Data Type --</option>
                            <option value="genre">Genre</option>
                            <option value="studio">Studio</option>
                            <option value="director">Director</option>
                            <option value="actor">Actor</option>
                            <option value="media">Media</option>
                            <option value="mediaactor">Media Actor Mapping</option>
                            <option value ='mediadirector'>Media Director Mapping</option>
                            <option value ='mediastudio'>Media Studio Mapping</option>
                            <option value ='mediagenre'>Media Genre Mapping</option>
                        </select>
                    </div>
                    
                    {dataType && (
                        <div className="data-type-requirements">
                            <h3>Required Columns</h3>
                            <ul className="required-columns-list">
                                {dataTypeRequirements[dataType].map(column => (
                                    <li key={column}>{column}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="file-input-container">
                        <label className="file-input-label">
                            Choose File
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input"
                                disabled={!dataType}
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
                                disabled={submissionStatus.loading || !data.length || !dataType || !validateData()}
                            >
                                {submissionStatus.loading ? 'Processing...' : 'Entry to Database'}
                            </button>
                        )}
                    </div>
                    
                    <div className="submission-status-container">
                        {submissionStatus.success && (
                            <p className="success-message">Data successfully submitted to database!</p>
                        )}
                        {submissionStatus.error && (
                            <p className="error-message">{submissionStatus.error}</p>
                        )}
                        {submissionStatus.loading && (
                            <p className="loading-message">Processing your request...</p>
                        )}
                        {/* Add disabled button reason */}
                        {!submissionStatus.loading && !submissionStatus.success && !submissionStatus.error && 
                         getButtonDisabledReason() && (
                            <p className="disabled-button-message">{getButtonDisabledReason()}</p>
                        )}
                    </div>
                    
                    {data && data.length > 0 ? (
                        <DataTable data={data} />
                    ) : (
                        <p className="empty-state">No data to display. Please upload a CSV file.</p>
                    )}
                </div>
            </div>

            <AdminUserEmailTable/>
        </div>
    );
};

export default Admin;