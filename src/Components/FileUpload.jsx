import csvParser from "../Utils/csvParser";
import { excelParser } from "../Utils/excelParser";
import React, { useState } from "react";

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
        
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'csv' || ['xlsx', 'xls'].includes(fileExtension)) {
            setFile(selectedFile);
            // Trigger parsing process here
        } else {
            alert("Please upload a valid CSV or Excel file.");
        }
    };

    const handleUpload = () => {
        if (!file) return;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'csv') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedData = csvParser(e.target.result);
                    console.log("Parsed CSV data:", parsedData);
                    // Handle the parsed data (e.g., send it to the server)
                } catch (error) {
                    console.error("Error parsing CSV file:", error);
                }
            };
            reader.readAsText(file);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const parsedData = await excelParser(e.target.result);
                    console.log("Parsed Excel data:", parsedData);
                    // Handle the parsed data
                } catch (error) {
                    console.error("Error parsing Excel file:", error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <div>
            <h2>Upload CSV or Excel File</h2>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;