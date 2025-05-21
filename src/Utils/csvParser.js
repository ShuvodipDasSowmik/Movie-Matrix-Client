
export const csvParser = (csvData) => {

    const rows = csvData.split('\n');       // In CSV files, each row is separated by a newline character

    const dataMatrix = rows.map(row => {        // Columns of Seperated rows is now converted into a 2D Array of data
        return row.split(',');
    })

    // Headers of each column lies in the first row of the matrix
    const headers = dataMatrix[0];

    const data = dataMatrix.slice(1)      // Skip the headers row
        .map(row => {

            // reduce() method returns an object jsonArr, iterating over headers array with each Key assigned to the header variable
            return headers.reduce((jsonArr, header, index) => {

                jsonArr[header] = row[index] || '';
                return jsonArr;

            }, {});     // The empty curly braces are the initial state of the jsonArr

        });
    return data;

};
