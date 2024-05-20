import React from 'react';

function CSVFileDisplay({ fileContent, fileName }) {
     return (
         <div style={{ display: 'block', overflow: 'scroll', maxHeight: '300px' }}>
             <h2>{`Uploaded ${fileName} CSV File Content`}</h2> {/* Display file name here */}
             <table>
                 <thead>
                     <tr>
                         { fileContent && fileContent.length > 0 && Object.keys(fileContent[0]).map((key, index) => (
                             <th key={index}>{key}</th>
                         ))}
                     </tr>
                 </thead>
                 <tbody>
                     { fileContent && fileContent.length > 0 && fileContent.map((row, rowIndex) => (
                         <tr key={rowIndex}>
                             {Object.values(row).map((cell, cellIndex) => (
                                 <td key={cellIndex}>{cell}</td>
                             ))}
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
     );
}

export default CSVFileDisplay;
