import { useState, useEffect } from 'react';
import { csvParser } from '../Utils/csvParser';

const STORAGE_KEY = 'movieMatrixCsvData';

const useFileUpload = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    // Load data from localStorage on initial load
    useEffect(() => {

        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedFileName = localStorage.getItem(`${STORAGE_KEY}_filename`);

        if (savedData) {
            try {

                const parsedData = JSON.parse(savedData);
                setData(parsedData);

                console.log('Loaded data from localStorage:', parsedData);

                // If we had a filename saved, recreate a minimal file object
                if (savedFileName) {
                    setFile({ name: savedFileName });
                }
            } catch (err) {
                setError('Error loading saved data');
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(`${STORAGE_KEY}_filename`);
            }
        }
    }, []);



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

                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
                localStorage.setItem(`${STORAGE_KEY}_filename`, file.name);
            } catch (err) {
                setError('Error parsing CSV file: ' + err.message);
                setData([]);
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(`${STORAGE_KEY}_filename`);
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setData([]);
        };

        reader.readAsText(file);
    };

    const clearFile = () => {
        setFile(null);
        setData([]);
        setError('');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_filename`);
    };

    return { file, data, error, handleFileChange, clearFile };
};

export default useFileUpload;