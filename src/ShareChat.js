import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To access the session_id from the URL
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX styles for proper LaTeX rendering
import { FiCpu, FiUser } from 'react-icons/fi';

const ShareChat = () => {
  const { session_id } = useParams(); // Get session_id from URL params
  const [messages, setMessages] = useState([]); // State to hold chat history
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [error, setError] = useState(null); // State to handle errors
  const [password, setPassword] = useState(''); // State to hold the input password
  const [authenticated, setAuthenticated] = useState(false); // State to track authentication

  const fetchChatHistory = async (password) => {
    try {
      // Fetch chat history using session_id and password
      const historyResponse = await axios.get(`https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/chat_history/${password}`, {
        
      });

      const formattedMessages = historyResponse.data.map(item => ({
        text: item.role === 'user' ? item.content : item.message,
        sender: item.role === 'user' ? 'user' : 'bot'
      }));

      setMessages(formattedMessages); // Set formatted messages to state
      setAuthenticated(true); // Mark as authenticated
    } catch (err) {
      console.error('Error:', err);
      setError('Error fetching chat history. Please check your password or session ID.'); // Updated error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(null); // Reset error state
    fetchChatHistory(password); // Fetch chat history with the provided password
  };

  useEffect(() => {
    // Initially set loading to false until the user submits the password
    setLoading(false);
  }, []);

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

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <div className="flex flex-col p-4 bg-gray-100 min-h-screen items-center justify-center">
      {authenticated ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Chat History</h1>
          <div className="flex-1 overflow-y-auto w-full max-w-xl">
            {messages.map((message, index) => (
              <div key={index} className={`p-3 rounded mb-2 ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto max-w-[80%]' : 'bg-gray-300 text-gray-900 mr-auto max-w-[80%]'}`}>
                <div className="flex items-center">
                  {message.sender === 'user' ? <FiUser className="mr-2" /> : <FiCpu className="mr-2" />}
                  <MessageComponent message={message.text} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-lg bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Enter Password to Access Chat History</h1>
          {/* Password input form */}
          <form onSubmit={handleSubmit} className="mb-4 w-full">
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state on input change
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Submit
            </button>
          </form>
          {/* Show error message if any */}
          {error && <div className="text-red-500 text-center">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default ShareChat;
