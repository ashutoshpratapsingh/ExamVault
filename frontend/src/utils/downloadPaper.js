import axios from "axios";

export const downloadPaper = async (paper) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/exam/download-paper",
      { paper },
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "QuestionPaper.pdf");
    document.body.appendChild(link);
    link.click();

  } catch (err) {
    console.log("DOWNLOAD ERROR:", err);
  }
};