// import React from 'react';

// const DynamicTable = ({ headers, data, onDataChange }) => {
//   const handleCellChange = (rowIndex, colIndex, value) => {
//     const updatedData = data.map((row, rIndex) => {
//       if (rIndex === rowIndex) {
//         return row.map((cell, cIndex) => (cIndex === colIndex ? value : cell));
//       }
//       return row;
//     });
//     onDataChange(updatedData);
//   };

//   return (
//     <table>
//       <thead>
//         <tr>
//           {headers.map((header, index) => (
//             <th key={index}>{header}</th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row, rowIndex) => (
//           <tr key={rowIndex}>
//             {row.map((cell, colIndex) => (
//               <td key={colIndex}>
//                 <input
//                   type="text"
//                   value={cell}
//                   onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
//                 />
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default DynamicTable;
