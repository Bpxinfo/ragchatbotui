import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiPlus, FiChevronLeft, FiChevronRight, FiSend, FiUser, FiCpu, FiLoader, FiSun, FiMoon, FiShare2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX styles for proper LaTeX rendering

function Chatbot() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'assistant', text: "Hello! I'm your chatbot assistant. How can I help?" }]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null); // Get session ID from localStorage if exists
  const [showModal, setShowModal] = useState(false); // State for controlling the modal visibility
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // Reference for the sidebar chat history container
  const messageContainerRef = useRef(null);

  const scrollToBottom = (ref) => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(messageContainerRef); // Scrolls the main message area
  }, [messages]);

  useEffect(() => {
    scrollToBottom(chatContainerRef); // Scrolls the sidebar chat history
  }, [messages]);

  const goToFile = () => {
    navigate('/Login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

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

  const TypingIndicator = () => (
    <div className={`p-3 rounded mb-2 bg-gray-300 text-gray-900 mr-auto max-w-[80%]`}>
      <div className="flex items-center">
        <FiCpu className="mr-2" />
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputMessage.trim() === '') return;

    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: inputMessage }]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      const payload = {
        message: inputMessage,
        fileName: selectedFile || '',
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Optional delay for streaming effect

      const response = await axios.post(
        'https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/chat',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(sessionId ? { 'Session-Id': sessionId } : {}), // Include sessionId if available
          },
        }
      );

      setIsTyping(false);

      const botResponse = response?.data?.response || 'Sorry, I could not get a valid response.';

      // If the response includes a session ID, save it for future use
      if (response?.data?.session_id && !sessionId) {
        setSessionId(response.data.session_id);
        localStorage.setItem('sessionId', response.data.session_id); // Save sessionId to localStorage
      }

      let tempText = '';

      for (const char of botResponse) {
        tempText += char;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1]?.sender === 'assistant') {
            updatedMessages[updatedMessages.length - 1].text = tempText;
          } else {
            updatedMessages.push({ sender: 'assistant', text: tempText });
          }
          return updatedMessages;
        });

        await new Promise((resolve) => setTimeout(resolve, 5)); // Speed of rendering one character at a time
        scrollToBottom(messageContainerRef);
      }

    } catch (error) {
      console.error('Error fetching bot response:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'assistant', text: 'Sorry, something went wrong. Please try again.' }]);
    }

    setLoading(false);
    setIsTyping(false);
  };

  const handleNewChat = () => {
    // Clear the session ID for a new chat
    localStorage.removeItem('sessionId');
    setSessionId(null);
    window.location.reload();
  };

  // Handle opening the modal when Share button is clicked
  const handleOpenShareModal = () => {
    if (!sessionId) {
      alert('Session ID is not available. Please start a chat first.');
    } else {
      setShowModal(true); // Show the modal
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Trigger the save_chat API when Confirm is clicked
  const handleConfirmShare = async () => {
    try {
      if (!sessionId) {
        alert('Session ID is not available. Please start a chat first.');
        return;
      }

      const payload = {sessionId : sessionId};

      if (selectedFile){
        payload.fileName = selectedFile;
      }
      // Call the API to save the chat
      const response = await axios.post(`https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/save_chat/`, payload, {
        headers: {
            'Content-Type' : 'application/json'
        }
      });

      if (response.status === 200) {
        const shareUrl = `${window.location.origin}/share_chat`;
        alert(`Chat history saved successfully${selectedFile ? ` with file: ${selectedFile}` : ''}. Visit ${shareUrl} to view history.`);
      } else {
        alert('Failed to save the chat history. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing chat:', error);
      alert('Error saving chat history. Please try again.');
    } finally {
      handleCloseModal(); // Close the modal after confirmation
    }
  };

  const MessageComponent = ({ message }) => (
    <ReactMarkdown
      className="text-sm break-words"
      components={{
        math: ({ value }) => <BlockMath>{value}</BlockMath>,
        inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>,
      }}
    >
      {message}
    </ReactMarkdown>
  );

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`relative h-full bg-gray-900 text-white flex flex-col transition-transform duration-300 ${showSidebar ? 'w-1/5' : 'w-0'} md:w-1/5 overflow-hidden`}>
        <div className="flex justify-between items-center p-4">
          <div className="text-xl font-bold">Chat History</div>
          <button onClick={handleNewChat}>
            <FiPlus className="w-6 h-6 mr-2" />
          </button>
        </div>

        {/* Chat history container with auto-scroll */}
        <div className="space-y-4 p-4 overflow-y-auto" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded ${message.sender === 'user' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
            >
              <p className="text-sm">
                {message.sender === 'user' ? 'You' : 'Assistant'}: {message.text.trim().split(/\s+/).slice(-4).join(' ')}
              </p>
            </div>
          ))}
        </div>

        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 md:hidden">
          <button
            className="bg-gray-700 text-white px-2 py-1 rounded-full"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <FiChevronLeft /> : <FiChevronRight />}
          </button>
        </div>
      </div>

        {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        <div className={`flex items-center justify-between p-4 shadow-md ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className={`text-xl font-bold cursor-pointer ${darkMode ? 'text-white-500' : 'text-black'}`} onClick={goToFile}>
            File Process
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative inline-block text-left w-full">
              <select
                id="fileSelect"
                name="fileSelect"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className={`transition-all duration-300 ease-in-out transform w-90 ${darkMode ? 'text-white bg-gray-700 hover:bg-gray-600 focus:ring-gray-500' : 'text-gray-900 bg-white hover:bg-gray-200 focus:ring-gray-300'} font-medium rounded-lg text-sm shadow-sm p-2`}
              >
                <option value="">Select a file</option>
                {files.map((file) => (
                  <option key={file.name} value={file.name}>{file.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenShareModal} // Open the share modal
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-400"
            >
              <FiShare2 />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-400"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
            
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto" ref={messageContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`p-3 rounded mb-2 ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto max-w-[80%]' : 'bg-gray-300 text-gray-900 mr-auto max-w-[80%]'}`}>
              <div className="flex items-center">
                {message.sender === 'user' ? <FiUser className="mr-2" /> : <FiCpu className="mr-2" />}
                <MessageComponent message={message.text} />
              </div>
            </div>
          ))}
          {isTyping && <TypingIndicator />}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-gray-200">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="p-3 ml-2 text-white bg-blue-500 rounded-full focus:outline-none focus:ring focus:ring-blue-400"
          >
            {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
          </button>
        </form>
      </div>

      {/* Modal for Sharing Chat */},
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Share Chat Session</h2>
            <p className="mb-4">Session ID: <strong>{sessionId}</strong></p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShare}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
