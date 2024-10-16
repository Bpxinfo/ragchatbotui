import React, { useState, useEffect } from 'react';
import { FiSearch, FiMoon, FiSun, FiFileText, FiUpload, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Fileprocess() {
  const [darkMode, setDarkMode] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [uploadMode, setUploadMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrEnabled, setOcrEnabled] = useState(false);

  const [loading, setLoading] = useState(false); // For showing the loader
  const [uploadTime, setUploadTime] = useState(null); // For tracking upload time
  const [fileUrl, setFileUrl] = useState('');

  const handleUrlChange = (e) => {
    setFileUrl(e.target.value);
    console.log(e.target.value)
  };

  const navigate = useNavigate();
  const goToChat = () => {
    navigate('/'); // Redirects to the "/Login" page
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    // Check if user is logged in
    const user = sessionStorage.getItem('user');
    
    if (!user) {
      // Redirect to login page if no session is found
      navigate('/login');
    }
  }, [navigate]);
  
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/files_get'); // Adjust API endpoint as needed
      console.log('API response:', response.data); // Check what is being returned by the API
      
      // Ensure the response data is an array
      if (Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        console.error('Unexpected response format. Expected an array.');
        setFiles([]); // Fallback to an empty array if response is not an array
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]); // Set an empty array if there's an error fetching the files
    }
  };
  

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      console.error('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('ocr', ocrEnabled); // Send OCR choice (true or false)
    setLoading(true); // Start loader
    const startTime = Date.now(); // Record start time

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // onUploadProgress: (progressEvent) => {
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //   setUploadProgress(percentCompleted);
        // },
      });

      if (response.status === 200) {
        console.log('File uploaded successfully:', response.data);
       // alert("File uploaded successfully!");
        setUploadProgress(100); // Reset progress
      } else if (response.status === 201) {
        alert("Only PDF files are accepted.");
        setUploadProgress(0);
      } else if (response.status === 202) {
        alert("File name already exists in Auzre. Please rename the file.");
        setUploadProgress(0);
      }else if (response.status === 203) {
        alert("PDF File is not readable. Please select with ocr option.");
        setUploadProgress(0);
      } else {
        console.error('Failed to upload file.');
        setUploadProgress(0);
      }
    } catch (error) {
      alert(error)
      setUploadProgress(0); // Reset progress
      console.error('Error during upload:', error);
    }
    finally {
      const endTime = Date.now(); // Record end time
      const duration = ((endTime - startTime) / 1000).toFixed(2); // Calculate the upload time in seconds
      setUploadTime(duration); // Set the upload duration
      setLoading(false); // Stop loader
    }
  };
//
useEffect(() => {
  fetch('http://localhost:5000/files_get') // replace with your actual Flask API endpoint
    .then(response => response.json())
    .then(data => {
      const formattedFiles = Object.keys(data).map(key => ({
        name: key,
        size: (data[key].size / 1024).toFixed(2), // Convert bytes to KB
        uploadedAt: data[key].last_modified || new Date() // If no date, show current date as a fallback
      }));
      setFiles(formattedFiles);
    })
    .catch(error => console.error('Error fetching files:', error));
}, []);

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Left Sidebar - Fixed Width (1/5) */}
      {/* <div className="w-20 bg-gray-900 text-white h-full">
        <div className="space-y-4 p-4 overflow-y-auto" />
      </div> */}

      {/* Right Section - Main Content (4/5) */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute right-2 top-2 text-gray-500 dark:text-gray-300" />
            </div>
            <button onClick={toggleDarkMode} className="flex items-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-800" />}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Chat button */}
            <button
              onClick={goToChat}
              className="flex items-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <FiMessageSquare className="text-gray-800 dark:text-gray-300" />
              <span className="ml-2 text-gray-800 dark:text-gray-300">Chat</span>
            </button>

            {/* Show Files button */}
            <button
              onClick={() => { setShowFiles(true); setUploadMode(false); fetchFiles(); }}
              className="flex items-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <FiFileText className="text-gray-800 dark:text-gray-300" />
              <span className="ml-2 text-gray-800 dark:text-gray-300">Show Files</span>
            </button>

            {/* Upload File button */}
            <button
              onClick={() => { setUploadMode(true); setShowFiles(false); }}
              className="flex items-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <FiUpload className="text-gray-800 dark:text-gray-300" />
              <span className="ml-2 text-gray-800 dark:text-gray-300">Upload File</span>
            </button>
          </div>

        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {showFiles && (
            <div>
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">All Files</h2>
          <table className="table-auto w-full bg-white dark:bg-gray-700 text-left">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-600">
                <th className="px-4 py-2 text-gray-800 dark:text-gray-200">#</th> {/* Serial Number Column */}
                <th className="px-4 py-2 text-gray-800 dark:text-gray-200">File Name</th>
                <th className="px-4 py-2 text-gray-800 dark:text-gray-200">Size (KB)</th>
                <th className="px-4 py-2 text-gray-800 dark:text-gray-200">Date Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-800 dark:text-gray-300">No files available</td>
                </tr>
              ) : (
                files.map((file, index) => (
                  <tr key={index} className="border-t border-gray-300 dark:border-gray-500">
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{index + 1}</td> {/* Serial number */}
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{file.name}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{file.size}</td>
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-300">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

          )}

          {uploadMode && (
            <div>
              <h2 className="text-lg font-bold mb-4">Upload File</h2>
              <form onSubmit={handleFileUpload}>
              <div className="grid gap-2 mb-4 md:grid-cols-6">

                <div className="col-span-2">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  className="p-2  block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help"
                />
                
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-900 dark:text-white">OR</span>
                </div>

                {/* URL input */}
                <div className="col-span-2">
                  
                  <label htmlFor="url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Enter URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    onChange={handleUrlChange}
                    value={fileUrl}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                </div>
          </div>

<div className="flex items-center mb-4">
          <input
            id="ocr-enabled"
            type="radio"
            value="true"
            name="ocr"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => setOcrEnabled(true)}
          />
          <label htmlFor="ocr-enabled" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            OCR - (PDF file less than 100 pages)
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="ocr-disabled"
            type="radio"
            value="false"
            name="ocr"
            defaultChecked
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => setOcrEnabled(false)}
          />
          <label htmlFor="ocr-disabled" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Without OCR
          </label>
        </div>

                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                  disabled={!selectedFile}
                >
                  Upload
                </button>
              </form>
              {loading && (
                <div className="flex items-center space-x-4">
                  <div className="loader"></div> {/* You can use a CSS-based loader here */}
                  <span>Uploading... {uploadProgress}% completed</span>
                </div>
              )}

              {uploadTime && !loading && (
                <div className="flex items-center space-x-4">
                  <span>File uploaded successfully in {uploadTime} seconds</span>
                </div>
              )}

              
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <p>Uploading: {uploadProgress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Section - Fixed at Bottom */}
        <div className="p-1 bg-white dark:bg-gray-800 shadow-md fixed bottom-0 left-1/5 right-0" />
      </div>
    </div>
  );
}

export default Fileprocess;
