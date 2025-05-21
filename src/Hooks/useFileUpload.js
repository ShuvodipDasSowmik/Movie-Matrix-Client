import { useState } from 'react';
import { csvParser } from '../Utils/csvParser';

const useFileUpload = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {

        const selectedFile = event.target.files[0];     // Retrieve file from user input


        if (selectedFile && selectedFile.type === 'text/csv') {

            setFile(selectedFile);
            setError('');
            parseFile(selectedFile);

        } else {

            setFile(null);
            setData([]);
            setError('Please upload a valid CSV file.');

        }
    };

    const parseFile = (file) => {

        const reader = new FileReader();    // Browser API to read files as text

        // onload() method executes the following functions after FileReader finishes reading a file
        reader.onload = (event) => {

            try {

                const csvData = event.target.result;        //csvData now contains the file content as plain text
                const parsedData = csvParser(csvData);      // Data parsed into Array of JSON objects
                setData(parsedData);

            } catch (err) {

                setError('Error parsing CSV file: ' + err.message);
                setData([]);

            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setData([]);
        };
        
        reader.readAsText(file);
    };

    return { file, data, error, handleFileChange };
};

export default useFileUpload;