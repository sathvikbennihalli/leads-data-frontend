import React, { useState } from "react";
import "./Home.css";
import * as XLSX from "xlsx";
import axios from "axios";

function Home() {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(""); // State to hold the message
  const [messageType, setMessageType] = useState(""); // State to hold message type (success or error)

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

  const handleFileUpload = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        try {
          if (selectedSheet === "ALL_SHEETS") {
            const allSheetsData = {};
            sheets.forEach((sheet) => {
              const sheetData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet],
                {
                  raw: false,
                  dateNF: "DD-MM-YYYY",
                }
              );

              // Convert serial numbers to date strings
              sheetData.forEach((row) => {
                Object.keys(row).forEach((key) => {
                  if (
                    typeof row[key] === "number" &&
                    XLSX.SSF.parse_date_code(row[key])
                  ) {
                    row[key] = XLSX.SSF.parse_date_code(row[key]);
                  }
                });
              });

              allSheetsData[sheet] = sheetData;
            });

            // Log the data from all sheets
            console.log("All Sheets Data:", allSheetsData);

            await axios.post("https://leads-data-backend.onrender.com/upload", {
              data: allSheetsData,
            });
            setMessage("All sheets data uploaded successfully");
            setMessageType("success");
          } else {
            const selectedSheetData = XLSX.utils.sheet_to_json(
              workbook.Sheets[selectedSheet],
              {
                raw: false,
                dateNF: "DD-MM-YYYY",
              }
            );

            // Convert serial numbers to date strings
            selectedSheetData.forEach((row) => {
              Object.keys(row).forEach((key) => {
                if (
                  typeof row[key] === "number" &&
                  XLSX.SSF.parse_date_code(row[key])
                ) {
                  row[key] = XLSX.SSF.parse_date_code(row[key]);
                }
              });
            });

            console.log("Selected Sheet Data:", selectedSheetData);

            await axios.post("https://leads-data-backend.onrender.com/upload", {
              data: { [selectedSheet]: selectedSheetData },
            });
            setMessage(
              `Data from sheet '${selectedSheet}' uploaded successfully`
            );
            setMessageType("success");
          }
        } catch (error) {
          console.error("Error uploading data", error);
          setMessage("Error uploading data");
          setMessageType("error");
        }
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
              <option value="ALL_SHEETS">All Sheets</option>
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
        {message && <p className={`message ${messageType}`}>{message}</p>}{" "}
        {/* Display message */}
      </div>
    </div>
  );
}

export default Home;
