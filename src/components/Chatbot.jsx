import { useState, useEffect, useRef } from 'react';
import chatbotService from '../services/chatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Halo! 👋 Saya adalah asisten virtual UNKLAB Store. Saya bisa membantu Anda mencari produk, memberikan informasi tentang produk, atau menjawab pertanyaan tentang toko kami. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadInitialMessage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const loadInitialMessage = async () => {
    try {
      setIsLoadingInitial(true);
      const initialMessage = await chatbotService.getInitialMessage();
      // Ensure timestamp is a Date object
      setMessages([{
        ...initialMessage,
        timestamp: parseTimestamp(initialMessage.timestamp),
      }]);
    } catch (error) {
      console.error('Error loading initial message:', error);
      // Fallback message jika API error
      setMessages([
        {
          id: 1,
          text: 'Halo! 👋 Saya adalah asisten virtual UNKLAB Store. Saya bisa membantu Anda mencari produk, memberikan informasi tentang produk, atau menjawab pertanyaan tentang toko kami. Ada yang bisa saya bantu?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to ensure timestamp is always a Date object
  const parseTimestamp = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = parseTimestamp(timestamp);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Prepare conversation history (exclude the current message)
      const conversationHistory = messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
      }));

      // Get response from Gemini API
      const response = await chatbotService.sendMessage(userMessage, conversationHistory);

      const newBotMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: parseTimestamp(response.timestamp),
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a connection error
      let errorMessage = '';
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
        errorMessage = '⚠️ Backend server tidak berjalan. Silakan pastikan backend server sudah dijalankan di port 3001.\n\nUntuk menjalankan backend:\n1. Buka terminal baru\n2. Masuk ke folder backend: `cd backend`\n3. Jalankan: `npm run dev`';
      } else if (error.response?.status === 500) {
        errorMessage = 'Maaf, terjadi kesalahan di server. Pastikan GEMINI_API_KEY sudah dikonfigurasi di file .env backend.';
      } else {
        errorMessage = 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi atau kunjungi halaman Shop untuk melihat produk yang tersedia.';
      }
      
      const errorBotMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: parseTimestamp(new Date()),
      };
      
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-unklab-blue hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        aria-label="Buka Chatbot"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-2 md:bottom-24 md:right-6 w-[calc(100vw-1rem)] md:w-96 h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-unklab-blue text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">UNKLAB Store Assistant</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-unklab-blue text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-white/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ketik pesan Anda..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unklab-blue focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-unklab-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

