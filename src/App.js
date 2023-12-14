import React, { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import PdfComp from "./PdfComp";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [allImage, setAllImage] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    try {
      const response = await fetch("http://localhost:5000/get-files");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setAllImage(data.data);
    } catch (err) {
      setError("Error fetching data get");
    }
  };

  const submitImage = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload-files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      if (result.status === "ok") {
        alert("Uploaded Successfully!!!");
        getPdf();
        setTitle("");
        setFile(null);
      }
    } catch (err) {
      setError("Error uploading file");
    }
  };

  const showPdf = (pdf) => {
    setPdfFile(`http://localhost:5000/files/${pdf}`);
  };

  async function deletePdf(e, data) {
    e.preventDefault();
    console.log("data", data, "id: ", data?._id);

    if (!data || !data._id) {
      console.error("Invalid data or ID");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/delete-file/${data._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete PDF");
      }

      const result = await response.json();
      if (result.status === "ok") {
        console.log("File deleted successfully");
        getPdf();
      }
    } catch (error) {
      console.error("Error deleting PDF", error);
    }
  }
  return (
    <div className="App">
      <form className="formStyle" onSubmit={submitImage}>
        <h4>Upload Pdf in React</h4>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          className="form-control"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />
        {error && <div className="error">{error}</div>}
        <br />
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
      <div className="uploaded">
        <h4>Uploaded PDF:</h4>
        <div className="output-div">
          {allImage.map((data, index) => (
            <div className="inner-div" key={index}>
              <h6>Title: {data.title}</h6>
              <button
                className="btn btn-primary"
                onClick={() => showPdf(data.pdf)}
              >
                Show Pdf
              </button>

              <button
                onClick={(e) => deletePdf(e, data)}
                className="btn btn-danger"
              >
                Delete PDF
              </button>
            </div>
          ))}
        </div>
      </div>
      <PdfComp pdfFile={pdfFile} />
    </div>
  );
}

export default App;
