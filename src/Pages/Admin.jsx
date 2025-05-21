import DataTable from "../Components/DataTable";
import useFileUpload from "../Hooks/useFileUpload";

const Admin = () => {
    const { file, data, error, handleFileChange } = useFileUpload();
    
    console.log("Admin rendering with data:", data);
    
    return (
        <div className="admin-container">
            
            <div className="file-upload-section">
                <h2>Upload CSV File</h2>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {file && <p>File selected: {file.name}</p>}
            </div>
            
            {data && data.length > 0 ? (
                <div className="data-table-section">
                    <h2>Uploaded Data</h2>
                    <DataTable data={data} />
                </div>
            ) : (
                <p>No data to display. Please upload a CSV file.</p>
            )}
        </div>
    );
};

export default Admin;