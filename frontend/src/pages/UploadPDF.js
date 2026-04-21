import React, { useState } from "react";
import axios from "axios";

function UploadPDF() {
  const [selectedFile, setSelectedFile] = useState(null);

  // 📌 1. Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // 📌 2. Upload function (THIS IS WHERE YOUR CODE GOES)
  const uploadPDF = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();

    // ✅ IMPORTANT LINE (YOU ASKED ABOUT THIS)
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/pdf/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("SUCCESS:", res.data);
      alert("Upload successful");

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload PDF</h2>

      {/* 📌 3. File input */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {/* 📌 4. Upload button */}
      <button onClick={uploadPDF}>Upload</button>
    </div>
  );
}

export default UploadPDF;