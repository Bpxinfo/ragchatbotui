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
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || null); // Get session ID from localStorage if exists
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

        await new Promise((resolve) => setTimeout(resolve, 20)); // Speed of rendering one character at a time
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

  const handleShareChat = () => {
    const shareUrl = `${window.location.origin}/share_chat/${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Chat URL copied to clipboard: ${shareUrl}`);
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

      {/* Main Chat */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between p-4 border-b border-gray-200">
          <div className="text-lg font-bold">Chatbot</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShareChat}
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
    </div>
  );
}

export default Chatbot;
