import { useState, useEffect } from 'react';
import { csvParser } from '../Utils/csvParser';
import { excelParser } from '../Utils/excelParser';

const STORAGE_KEY = 'movieMatrixCsvData';
const TYPE_STORAGE_KEY = 'movieMatrixDataType';

const useFileUpload = (initialDataType = '') => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [dataType, setDataType] = useState(initialDataType);

    // Load data from localStorage on initial load
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const savedFileName = localStorage.getItem(`${STORAGE_KEY}_filename`);
        const savedDataType = localStorage.getItem(TYPE_STORAGE_KEY);

        if (savedDataType) {
            setDataType(savedDataType);
        }

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
                localStorage.removeItem(TYPE_STORAGE_KEY);
            }
        }
    }, []);

    // Helper function to check if a row is empty
    const isRowEmpty = (row) => {
        // Check if all values in the row object are empty strings, null, or undefined
        return Object.values(row).every(value => 
            value === undefined || 
            value === null || 
            (typeof value === 'string' && value.trim() === '')
        );
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];     // Retrieve file from user input
        
        if (!selectedFile) {
            return;
        }
        
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            setFile(selectedFile);
            setError('');
            parseCSVFile(selectedFile);
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            setFile(selectedFile);
            setError('');
            parseExcelFile(selectedFile);
        } else {
            setFile(null);
            setData([]);
            setError('Please upload a valid CSV or Excel file.');
        }
    };

    const parseCSVFile = (file) => {
        const reader = new FileReader();    // Browser API to read files as text

        // onload() method executes the following functions after FileReader finishes reading a file
        reader.onload = (event) => {
            try {
                const csvData = event.target.result;        //csvData now contains the file content as plain text
                let parsedData = csvParser(csvData);      // Data parsed into Array of JSON objects
                
                // Filter out empty rows
                parsedData = parsedData.filter(row => !isRowEmpty(row));
                
                // If after filtering we have no data, set an error
                if (parsedData.length === 0) {
                    setError('No valid data found in the CSV file');
                    setData([]);
                    return;
                }
                
                setData(parsedData);

                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
                localStorage.setItem(`${STORAGE_KEY}_filename`, file.name);
                
                // If we have a dataType, save it too
                if (dataType) {
                    localStorage.setItem(TYPE_STORAGE_KEY, dataType);
                }
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
    
    const parseExcelFile = (file) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const arrayBuffer = event.target.result;
                excelParser(arrayBuffer)
                    .then(parsedData => {
                        // Filter out empty rows
                        const filteredData = parsedData.filter(row => !isRowEmpty(row));
                        
                        // If after filtering we have no data, set an error
                        if (filteredData.length === 0) {
                            setError('No valid data found in the Excel file');
                            setData([]);
                            return;
                        }
                        
                        setData(filteredData);

                        // Save to localStorage
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
                        localStorage.setItem(`${STORAGE_KEY}_filename`, file.name);
                        
                        // If we have a dataType, save it too
                        if (dataType) {
                            localStorage.setItem(TYPE_STORAGE_KEY, dataType);
                        }
                    })
                    .catch(err => {
                        setError('Error parsing Excel file: ' + err.message);
                        setData([]);
                    });
            } catch (err) {
                setError('Error parsing Excel file: ' + err.message);
                setData([]);
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(`${STORAGE_KEY}_filename`);
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
            setData([]);
        };

        reader.readAsArrayBuffer(file);
    };

    const clearFile = () => {
        setFile(null);
        setData([]);
        setError('');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_filename`);
        // Don't remove dataType by default
    };

    const updateDataType = (type) => {
        setDataType(type);
        localStorage.setItem(TYPE_STORAGE_KEY, type);
    };

    const clearAll = () => {
        clearFile();
        setDataType('');
        localStorage.removeItem(TYPE_STORAGE_KEY);
    };

    return { 
        file, 
        data, 
        error, 
        dataType, 
        handleFileChange, 
        clearFile, 
        updateDataType,
        clearAll
    };
};

export default useFileUpload;