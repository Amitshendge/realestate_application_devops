import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://onestrealestate.io/bot1"; // Backend API URL

function ChatbotApp1() {
    const navigate = useNavigate(); // Hook for navigation
    const [message, setMessage] = useState(""); // User input message
    const [responses, setResponses] = useState([]); // Chat history
    const chatContainerRef = useRef(null); // Reference for auto-scrolling

    // Check authentication on component mount
    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            navigate("/auth"); // Redirect to auth if no token
        }
    }, [navigate]);

    // Auto-scroll to the bottom of the chat container
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [responses]);

    // Send message to the backend API
    const sendMessage = async (text) => {
        if (!text.trim()) return; // Ignore empty messages

        // Add user message to chat history
        setResponses((prev) => [...prev, { sender: "user", text }]);

        try {
            // Send the user's message to the backend API
            const response = await axios.post(API_URL, {
                text_question: text, // Payload as per API requirement
            });

            if (response.data.success) {
                // Add bot's response to chat history
                setResponses((prev) => [
                    ...prev,
                    { sender: "bot", text: response.data.bot_answer },
                ]);
            } else {
                console.error("API response was not successful:", response.data);
                setResponses((prev) => [
                    ...prev,
                    { sender: "bot", text: "Error: Unable to get a valid response from the bot." },
                ]);
            }
        } catch (error) {
            console.error("Error communicating with the backend API:", error);
            setResponses((prev) => [
                ...prev,
                { sender: "bot", text: "Error: Unable to connect to the server." },
            ]);
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("access_token"); // Clear the access token
        navigate("/auth"); // Redirect to the login page
    };

    // Handle key down event for message input
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage(message);
            setMessage(""); // Clear the input field
        }
    };

    // Parse and format the bot's response
    const formatBotResponse = (text) => {
        // Split the text into lines
        const lines = text.split("\n");

        return (
            <div>
                {lines.map((line, index) => {
                    // Check if the line contains a URL
                    if (line.includes("http")) {
                        const urlMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                        if (urlMatch) {
                            const [_, linkText, url] = urlMatch;
                            return (
                                <div key={index} style={{ marginBottom: "10px" }}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#007BFF", textDecoration: "none" }}
                                    >
                                        {linkText}
                                    </a>
                                </div>
                            );
                        }
                    }

                    // Bold specific parts of the text
                    const boldPattern = /\*\*(.*?)\*\*/g; // Matches text between **
                    const formattedLine = line.split(boldPattern).map((part, i) => {
                        if (i % 2 === 1) {
                            return <strong key={i}>{part}</strong>; // Wrap in <strong> for bold
                        }
                        return part; // Regular text
                    });

                    return (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            {formattedLine}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100vw",
                backgroundImage: "linear-gradient(135deg, #1e1e2f, #2c2c3e)", // Gradient background
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                padding: "0",
                margin: "0",
            }}
        >
            {/* Header */}
            <div
                style={{
                    backgroundColor: "#2c2c3e", // Darker header background
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#ffffff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Subtle shadow
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span>oNEST Bot</span>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        transition: "background 0.3s ease, transform 0.2s ease",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Button shadow
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = "#cc0000";
                        e.target.style.transform = "scale(1.05)"; // Slight scale effect on hover
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = "#ff4d4d";
                        e.target.style.transform = "scale(1)";
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Chat Container */}
            <div
                ref={chatContainerRef}
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    margin: "0",
                    backgroundColor: "#1e1e2f", // Dark background for chat area
                }}
            >
                {responses.map((response, index) => {
                    if (response.sender === "bot") {
                        return (
                            <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                                <div
                                    style={{
                                        background: "#2c2c3e", // Bot bubble background
                                        padding: "10px 15px",
                                        borderRadius: "15px 15px 15px 0",
                                        maxWidth: "70%",
                                        color: "#ffffff",
                                        fontSize: "0.9rem",
                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow
                                    }}
                                >
                                    <strong style={{ color: "#00C853" }}>Bot:</strong> {formatBotResponse(response.text)}
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-end" }}>
                            <div
                                style={{
                                    background: "#007BFF", // User bubble background
                                    padding: "10px 15px",
                                    borderRadius: "15px 15px 0 15px",
                                    maxWidth: "70%",
                                    color: "#ffffff",
                                    fontSize: "0.9rem",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow
                                }}
                            >
                                <strong>You:</strong> {response.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div
                style={{
                    display: "flex",
                    padding: "20px",
                    backgroundColor: "#2c2c3e", // Dark background for input area
                    borderTop: "2px solid #007BFF",
                }}
            >
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        marginRight: "10px",
                        backgroundColor: "#1e1e2f", // Dark input background
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow
                    }}
                />
                <button
                    onClick={() => sendMessage(message)}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        background: "#007BFF",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        transition: "background 0.3s ease, transform 0.2s ease",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Button shadow
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = "#005bb5";
                        e.target.style.transform = "scale(1.05)"; // Slight scale effect on hover
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = "#007BFF";
                        e.target.style.transform = "scale(1)";
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default ChatbotApp1;