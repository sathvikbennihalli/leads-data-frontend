import React, { useState } from "react";
import "./Home.css";
import * as XLSX from "xlsx";

function Home() {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSheetSelect = (event) => {
    setSelectedSheet(event.target.value);
  };

  const handleFileUpload = () => {
    if (file && selectedSheet) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const selectedSheetData = XLSX.utils.sheet_to_json(
          workbook.Sheets[selectedSheet]
        );
        console.log(selectedSheetData);
        // You can send selectedSheetData to the backend for further processing
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="home-container">
      <div className="upload-box">
        <h1 className="title">Upload Your Excel File</h1>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="file-input"
        />
        {sheets.length > 0 && (
          <div className="select-container">
            <h2>Select Sheet :</h2>
            <select onChange={handleSheetSelect} className="sheet-dropdown">
              <option value="">Select a sheet</option>
              {sheets.map((sheet, index) => (
                <option key={index} value={sheet}>
                  {sheet}
                </option>
              ))}
            </select>
          </div>
        )}
        <button onClick={handleFileUpload} className="upload-button">
          Upload
        </button>
      </div>
    </div>
  );
}

export default Home;
