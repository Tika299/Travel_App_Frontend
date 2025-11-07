import React, { useState, useRef, useEffect } from 'react';
import { 
    FiSend, 
    FiMessageCircle, 
    FiX, 
    FiUser, 
    FiSmartphone,
    FiMapPin,
    FiCalendar,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiStar
} from 'react-icons/fi';

// CSS cho hiệu ứng rung và fadeIn
const shakeAnimation = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

const AITravelChat = ({ isOpen, onClose, onGenerateItinerary }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationContext, setConversationContext] = useState({});
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [showAutoGreeting, setShowAutoGreeting] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const autoGreetingTimerRef = useRef(null);
    const greetingDisplayTimerRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize with welcome message
    useEffect(() => {
        if (isChatOpen) {
            // Tạo conversation ID mới nếu chưa có
            if (!conversationId) {
                const newConversationId = Date.now().toString();
                setConversationId(newConversationId);
            }
            
            // Hiển thị lời chào nếu chưa có tin nhắn nào
            if (messages.length === 0) {
                setMessages([
                    {
                        id: 1,
                        type: 'ai',
                        content: 'Xin chào! Tôi là IPSUM Travel AI - trợ lý du lịch thông minh do nhóm phát triển FIT TDC thực hiện. Tôi có thể giúp bạn lập kế hoạch du lịch hoàn hảo. Hãy cho tôi biết bạn muốn đi đâu và khi nào nhé!',
                        timestamp: new Date(),
                        suggestions: [
                            'Tôi muốn đi TP.HCM 3 ngày',
                            'Gợi ý lịch trình Đà Nẵng',
                            'Du lịch Hà Nội với ngân sách 5 triệu',
                            'Lịch trình Phú Quốc 5 ngày'
                        ]
                    }
                ]);
            }
        }
    }, [isChatOpen, conversationId, messages.length]);

    // Auto greeting logic - chỉ hiển thị khi chat chưa mở
    useEffect(() => {
        // Chỉ hiển thị auto greeting khi chat chưa mở
        if (!isChatOpen) {
            const startAutoGreeting = () => {
                autoGreetingTimerRef.current = setTimeout(() => {
                    setShowAutoGreeting(true);
                    
                    // Tắt greeting sau 3 giây
                    greetingDisplayTimerRef.current = setTimeout(() => {
                        setShowAutoGreeting(false);
                        
                        // Lặp lại sau 30 giây
                        setTimeout(() => {
                            startAutoGreeting();
                        }, 30000);
                    }, 3000);
                }, 20000);
            };

            // Bắt đầu auto greeting
            startAutoGreeting();
        } else {
            // Nếu chat đã mở, tắt auto greeting
            setShowAutoGreeting(false);
            if (autoGreetingTimerRef.current) {
                clearTimeout(autoGreetingTimerRef.current);
            }
            if (greetingDisplayTimerRef.current) {
                clearTimeout(greetingDisplayTimerRef.current);
            }
        }

        // Cleanup
        return () => {
            if (autoGreetingTimerRef.current) {
                clearTimeout(autoGreetingTimerRef.current);
            }
            if (greetingDisplayTimerRef.current) {
                clearTimeout(greetingDisplayTimerRef.current);
            }
        };
    }, [isChatOpen]);

    // Reset timer khi user tương tác
    const resetAutoGreetingTimer = () => {
        if (autoGreetingTimerRef.current) {
            clearTimeout(autoGreetingTimerRef.current);
        }
        if (greetingDisplayTimerRef.current) {
            clearTimeout(greetingDisplayTimerRef.current);
        }
        setShowAutoGreeting(false);
        
        // Bắt đầu lại timer
        autoGreetingTimerRef.current = setTimeout(() => {
            setShowAutoGreeting(true);
            
            greetingDisplayTimerRef.current = setTimeout(() => {
                setShowAutoGreeting(false);
                
                setTimeout(() => {
                    resetAutoGreetingTimer();
                }, 30000);
            }, 3000);
        }, 20000);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        setIsThinking(true);

        try {
            // Gọi API chat với prompt yêu cầu trả lời tiếng Việt
            const response = await fetch('https://travel-app-api-ws77.onrender.com/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversation_history: messages.map(msg => ({
                        type: msg.type,
                        content: msg.content,
                        timestamp: msg.timestamp
                    })),
                    conversation_id: conversationId,
                    context: conversationContext
                })
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: data.response,
                    timestamp: new Date(),
                    suggestions: data.suggestions || [],
                    itinerary_data: data.itinerary_data || null
                };

                setMessages(prev => [...prev, aiMessage]);
                setConversationContext(data.context || {});
                
                // Cập nhật conversation_id nếu có
                if (data.conversation_id) {
                    setConversationId(data.conversation_id);
                }
                
                setIsThinking(false);

                // Nếu có yêu cầu mở form AI Model
                if (data.open_ai_modal && data.form_data) {
                    // Lưu context để sử dụng khi click "Mở form AI Model"
                    setConversationContext(prev => ({
                        ...prev,
                        pending_itinerary: data.form_data
                    }));
                    
                    setTimeout(() => {
                        onGenerateItinerary(data.form_data);
                    }, 1000);
                }
                // Nếu có itinerary data, hiển thị preview
                else if (data.itinerary_data) {
                    setTimeout(() => {
                        onGenerateItinerary(data.itinerary_data);
                    }, 1000);
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
            setIsThinking(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        // Nếu suggestion là "Mở form AI Model", trigger trực tiếp
        if (suggestion === 'Mở form AI Model' && conversationContext.pending_itinerary) {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + 3);
            
            onGenerateItinerary({
                destination: conversationContext.pending_itinerary.destination,
                days: conversationContext.pending_itinerary.days || 3,
                budget: conversationContext.pending_itinerary.budget || 5000000,
                start_date: today.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            });
            return;
        }
        
        // Nếu không, set input message và gửi
        setInputMessage(suggestion);
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Function để xử lý text đơn giản
    const cleanText = (text) => {
        return text.trim();
    };

    const toggleChat = () => {
        // Thêm hiệu ứng rung khi click
        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
        }, 500);
        
        // Reset auto greeting timer khi user tương tác
        resetAutoGreetingTimer();
        
        const newChatState = !isChatOpen;
        setIsChatOpen(newChatState);
        
        // Nếu đang mở chat và chưa có tin nhắn nào, hiển thị lời chào
        if (newChatState && messages.length === 0) {
            const newConversationId = Date.now().toString();
            setConversationId(newConversationId);
            
            setMessages([
                {
                    id: 1,
                    type: 'ai',
                    content: 'Xin chào! Tôi là IPSUM Travel AI - trợ lý du lịch thông minh do nhóm phát triển FIT TDC thực hiện. Tôi có thể giúp bạn lập kế hoạch du lịch hoàn hảo. Hãy cho tôi biết bạn muốn đi đâu và khi nào nhé!',
                    timestamp: new Date(),
                    suggestions: [
                        'Tôi muốn đi TP.HCM 3 ngày',
                        'Gợi ý lịch trình Đà Nẵng',
                        'Du lịch Hà Nội với ngân sách 5 triệu',
                        'Lịch trình Phú Quốc 5 ngày'
                    ]
                }
            ]);
        }
    };

    return (
        <>
            <style>{shakeAnimation}</style>
            {/* Floating Chat Icon */}
            <div className="fixed bottom-6 right-6 z-[9999] group">
                <button
                    onClick={toggleChat}
                    className="w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative"
                >
                    <img 
                        src={isThinking ? "https://travel-app-api-ws77.onrender.com/image/AIsuynghi.png" : "https://travel-app-api-ws77.onrender.com/image/AI.png"} 
                        alt="AI Ipsum Travel Assistant" 
                        className={`w-16 h-16 rounded-full object-contain transition-all duration-300 ${
                            isThinking ? 'animate-pulse' : 
                            isShaking ? 'animate-shake' : 
                            'group-hover:animate-bounce'
                        }`}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <FiMessageCircle className="w-8 h-8 text-gray-600 hidden" />
                    
                    {/* Auto Greeting Tooltip */}
                    {showAutoGreeting && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white text-black text-sm rounded-lg shadow-lg border border-gray-200 whitespace-nowrap pointer-events-none animate-fadeIn">
                            Xin chào! Bạn cần tôi trợ giúp gì không?
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                    )}
                    
                    {/* Hover Tooltip - chỉ hiển thị khi chat chưa mở */}
                    {!isChatOpen && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white text-black text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                            Xin chào! Bạn cần tôi trợ giúp gì không?
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            {isChatOpen && (
                <div className="fixed bottom-24 right-6 z-[9998] w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-white text-gray-800 rounded-t-xl">
                        <div className="flex items-center space-x-2">
                            <img 
                                src={isThinking ? "https://travel-app-api-ws77.onrender.com/image/AIsuynghi.png" : "https://travel-app-api-ws77.onrender.com/image/AI.png"} 
                                alt="AI Ipsum Travel Assistant" 
                                className={`w-6 h-6 rounded-full object-contain transition-all duration-300 ${isThinking ? 'animate-pulse' : ''}`}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <FiMessageCircle className="w-6 h-6 text-gray-600 hidden" />
                            <div>
                                <h3 className="font-semibold text-sm">IPSUM Travel AI</h3>
                                <p className="text-xs opacity-90">Hỏi tôi bất cứ điều gì về du lịch</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiX className="text-lg" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.type === 'user' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {message.type === 'user' ? <FiUser className="text-xs" /> : <FiSmartphone className="text-xs" />}
                                    </div>
                                    <div className={`rounded-lg p-2 ${
                                        message.type === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : message.isError
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        <div className="text-xs leading-relaxed whitespace-pre-wrap">
                                            {message.content.split('\n').map((line, index) => {
                                                const trimmedLine = line.trim();
                                                
                                                // Kiểm tra các pattern để format đặc biệt
                                                const isDayHeader = /^Ngày|^Day/.test(trimmedLine);
                                                const isCostSection = /^Ước Tính|^Tổng|^Chi phí|^Cost/.test(trimmedLine);
                                                const isTimeSection = /^Sáng:|^Trưa:|^Chiều:|^Tối:/.test(trimmedLine);
                                                const isLichTrinh = /^LỊCH TRÌNH/.test(trimmedLine);
                                                const isCostItem = /^Vé máy bay:|^Khách sạn:|^Ăn uống:|^Di chuyển:/.test(trimmedLine);
                                                
                                                if (isLichTrinh) {
                                                    return (
                                                        <div key={index} className="font-bold mt-3 mb-2 text-sm">
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                } else if (isDayHeader) {
                                                    return (
                                                        <div key={index} className="font-semibold mt-4 mb-2">
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                } else if (isTimeSection) {
                                                    return (
                                                        <div key={index} className="font-medium mt-2 mb-1 ml-2">
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                } else if (isCostSection) {
                                                    return (
                                                        <div key={index} className="font-semibold mt-4 mb-2">
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                } else if (isCostItem) {
                                                    return (
                                                        <div key={index} className="ml-2 mt-1">
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                } else if (trimmedLine === '') {
                                                    return <div key={index} className="h-3"></div>;
                                                } else {
                                                    return (
                                                        <div key={index} className={index > 0 ? 'mt-1' : ''}>
                                                            {cleanText(line)}
                                                        </div>
                                                    );
                                                }
                                            })}
                                        </div>
                                        <p className="text-xs opacity-70 mt-1">
                                            {formatTime(message.timestamp)}
                                        </p>
                                        
                                        {/* Suggestions */}
                                        {message.suggestions && message.suggestions.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-xs font-medium opacity-80">Gợi ý:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {message.suggestions.map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-start space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                                        <FiSmartphone className="text-xs" />
                                    </div>
                                    <div className="bg-gray-100 rounded-lg p-2">
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t">
                        <div className="flex space-x-2">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập tin nhắn..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    rows="1"
                                    style={{ minHeight: '36px', maxHeight: '100px' }}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiSend className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITravelChat;
