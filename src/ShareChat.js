// src/components/ShareChat.jsx

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
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`https://chatapi-ecbwhwf8bxhpd9ba.eastus2-01.azurewebsites.net/chat_history/${session_id}`);
        const formattedMessages = response.data.map(item => ({
          text: item.role === 'user' ? item.content : item.message,
          sender: item.role === 'user' ? 'user' : 'bot'
        }));
        setMessages(formattedMessages); // Set formatted messages to state
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchChatHistory();
  }, [session_id]);

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
    <div className="flex flex-col p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat History</h1>
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`p-3 rounded mb-2 ${message.sender === 'user' ? 'bg-blue-500 text-white ml-auto max-w-[80%]' : 'bg-gray-300 text-gray-900 mr-auto max-w-[80%]'}`}>
            <div className="flex items-center">
              {message.sender === 'user' ? <FiUser className="mr-2" /> : <FiCpu className="mr-2" />}
              <MessageComponent message={message.text} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareChat;
