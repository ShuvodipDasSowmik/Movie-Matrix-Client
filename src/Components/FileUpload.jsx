import csvParser from "../Utils/csvParser";
import React, { useState } from "react";

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            // Trigger parsing process here
        } else {
            alert("Please upload a valid CSV file.");
        }
    };

    const handleUpload = () => {
        if (file) {
            csvParser(file)
                .then((data) => {
                    console.log("Parsed CSV data:", data);
                    // Handle the parsed data (e.g., send it to the server)
                })
                .catch((error) => {
                    console.error("Error parsing CSV file:", error);
                });
        }
    };

    return (
        <div>
            <h2>Upload CSV File</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;