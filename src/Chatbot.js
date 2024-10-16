import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiPlus, FiChevronLeft, FiChevronRight, FiSend, FiUser, FiCpu, FiLoader, FiSun, FiMoon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function Chatbot() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]); // State to store the file names
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to manage dropdown visibility
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: "Hello! I'm your chatbot assistant. How can I help?" }]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(''); // State to store the selected file name
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null); // Reference to auto-scroll to the bottom
  const chatContainerRef = useRef(null); // Reference for left-side scrolling

  const goToFile = () => {
    navigate('/Login'); // Redirects to the "/Login" page
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch file names from the API when the component loads
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/metadata_file');
        const files = Object.keys(response.data).map(key => ({
          name: response.data[key].name
        }));
        setFiles(files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    fetchFiles();
  }, []);

  // Handle form submit and call the chatbot API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure the input is not empty
    if (inputMessage.trim() === '') return;

    // Add user's message to the chat history
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: inputMessage }]);
    setInputMessage('');
    setLoading(true);

    try {
      // Prepare the data to send (message and file name)
      const payload = {
        message: inputMessage,
        fileName: selectedFile || '', // Ensure the file name is passed, or empty if none selected
      };

      // Send the message and file name to the Flask backend API
      const response = await axios.post(
        'https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/chat',
        payload,
        {
          headers: {
            'Content-Type': 'application/json', // Sending JSON data
          },
        }
      );
      console.log(response);
      const botResponse = response?.data?.response || 'Sorry, I could not get a valid response.';

      let tempText = '';

      // Streaming effect for bot response
      for (const char of botResponse) {
        tempText += char;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];

          // Ensure bot's streaming text is shown properly
          if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1]?.sender === 'bot') {
            updatedMessages[updatedMessages.length - 1].text = tempText;
          } else {
            updatedMessages.push({ sender: 'bot', text: tempText });
          }

          return updatedMessages;
        });

        await new Promise((resolve) => setTimeout(resolve, 20)); // Delay for streaming effect
      }
      
    } catch (error) {
      console.error('Error fetching bot response:', error);
      // Add error message to chat history
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    // Refresh the page
    window.location.reload();
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar - Toggleable */}
      <div className={`relative h-full md:w-1/5 bg-gray-900 text-white flex flex-col transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Sidebar Content */}
        <div className="flex justify-between items-center p-4">
          <div className="text-xl font-bold">Chat History</div>
          <button onClick={handleNewChat}>
            <FiPlus className="w-6 h-6 mr-2" />
          </button>
        </div>

        {/* Scrollable Chat History */}
        <div className="space-y-4 p-4 overflow-y-auto h-64" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded ${message.sender === 'user' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
            >
              <p className="text-sm">
                {message.sender === 'user' ? 'You' : 'Bot'}: {message.text.trim().split(/\s+/).slice(-4).join(' ')}
              </p>
            </div>
          ))}
        </div>

        {/* Toggle Sidebar Arrow */}
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 md:hidden">
          <button
            className="bg-gray-700 text-white px-2 py-1 rounded-full"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <FiChevronLeft className="w-6 h-6" /> : <FiChevronRight className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`flex items-center justify-between p-4 shadow-md ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div
            className={`text-xl font-bold cursor-pointer ${darkMode ? 'text-white-500' : 'text-black'}`}
            onClick={goToFile}
          >
            File Process
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative inline-block text-left w-full">
              {/* File Selection Dropdown */}
              <select
                id="fileSelect"
                name="fileSelect"
                value={selectedFile} // Bind selected file
                onChange={(e) => setSelectedFile(e.target.value)} // Update selected file state
                className={`transition-all duration-300 ease-in-out transform w-90 
                  ${darkMode ? 'text-white bg-gray-700 hover:bg-gray-600 focus:ring-gray-500' : 'text-gray-900 bg-white hover:bg-gray-200 focus:ring-gray-300'}
                  font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4`}
              >
                <option value="" disabled>
                  Select File
                </option>
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <option key={index} value={file.name}>
                      {file.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No files available
                  </option>
                )}
              </select>
            </div>
          </div>

          <button onClick={toggleDarkMode}>
            {darkMode ? <FiSun className="text-yellow-500" /> : <FiMoon className="text-gray-500" />}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded mb-2 ${message.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-gray-900 self-start'}`}
            >
              {message.sender === 'user' ? <FiUser className="mr-2" /> : <FiCpu className="mr-2" />}
              <p className="text-sm">{message.sender === 'user' ? 'You' : 'Bot'}: {message.text}</p>
            </div>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className={`p-4 shadow-md flex ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-2 rounded-lg outline-none focus:ring-2 
              ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' : 'bg-gray-200 text-black placeholder-gray-500 focus:ring-blue-400'}`}
            disabled={loading}
          />
          <button
            type="submit"
            className={`ml-4 px-4 py-2 rounded-lg text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
              ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500'}`}
            disabled={loading}
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
