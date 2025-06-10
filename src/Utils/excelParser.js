import * as XLSX from 'xlsx';

/**
 * Parses Excel files and returns the data as an array of objects
 * @param {ArrayBuffer} arrayBuffer - The file content as array buffer
 * @returns {Promise<Array>} Array of objects representing the Excel data
 */
export const excelParser = async (arrayBuffer) => {
    // Read the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert the worksheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

    return jsonData;
};
