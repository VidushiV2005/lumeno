import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "../features/firebase";
import { v4 as uuidv4 } from "uuid";

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  // 📁 Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage("");
    } else {
      setMessage("❌ Please select a valid PDF file.");
      setFile(null);
    }
  };

  // 🚀 Handle file upload to Firebase Storage + Firestore
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file before uploading.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setMessage("You must be logged in to upload PDFs.");
      return;
    }

    const fileId = uuidv4();
    const storageRef = ref(storage, `pdfs/${user.uid}/${fileId}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error("Upload error:", error);
        setMessage("❌ Upload failed. Please try again.");
      },
      async () => {
        // ✅ Get file URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // ✅ Save metadata to Firestore
        await addDoc(collection(db, "pdfs"), {
          uid: user.uid,
          name: file.name,
          url: downloadURL,
          uploadedAt: serverTimestamp(),
        });

        setMessage("✅ PDF uploaded successfully!");
        setFile(null);
        setProgress(0);
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">Upload a PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        onClick={handleUpload}
        disabled={!file}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        Upload
      </button>

      {progress > 0 && (
        <div className="mt-4">
          <p className="text-gray-600">Uploading: {progress.toFixed(0)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-gray-700 font-medium">{message}</p>}
    </div>
  );
}
