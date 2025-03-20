import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const RASA_URL = "https://onestrealestate.io/rasa_bot";
const FORMS_JSON_PATH = "https://onestrealestate.io/auth/actions/form_filling_code/forms_subset.json";

function ChatbotApp() {
    const { botId } = useParams(); // Get the botId from the URL
    const navigate = useNavigate(); // Hook for navigation
    const [message, setMessage] = useState("");
    const [responses, setResponses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [forms, setForms] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedForm, setSelectedForm] = useState("");
    const chatContainerRef = useRef(null);

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

    // Fetch forms data
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await axios.get(FORMS_JSON_PATH);
                setForms(response.data);
                setCategories(Object.keys(response.data));
            } catch (error) {
                console.error("Error fetching forms_subset.json:", error);
            }
        };
        fetchForms();
    }, []);

    // Validate date input
    const validateDate = (input) => {
        const datePattern = /^\d{2}-\d{2}-\d{4}$/;
        if (!datePattern.test(input)) return false;

        const [month, day, year] = input.split("-").map(Number);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        const monthsWith30Days = [4, 6, 9, 11];
        if (monthsWith30Days.includes(month) && day > 30) return false;

        if (month === 2) {
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
            if (day > 29 || (day === 29 && !isLeapYear)) return false;
        }

        const date = new Date(year, month - 1, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() + 1 === month &&
            date.getDate() === day
        );
    };

    // Send message to the chatbot
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        // Check if the last bot response requires a date input
        const lastBotResponse = responses[responses.length - 1];
        if (
            lastBotResponse &&
            lastBotResponse.sender === "bot" &&
            lastBotResponse.custom &&
            lastBotResponse.custom.data_type === "date"
        ) {
            if (!validateDate(text)) {
                alert("Please enter a valid date in the format MM-DD-YYYY.");
                setMessage(""); // Clear the input
                return; // Prevent sending the message
            }
        }

        setResponses((prev) => [...prev, { sender: "user", text }]);

        try {
            const res = await axios.post(RASA_URL, { sender: "user", message: text });
            const botResponses = res.data.map((r) => ({
                sender: "bot",
                ...r,
            }));
            setResponses((prev) => [...prev, ...botResponses]);
        } catch (error) {
            console.error("Error communicating with Rasa backend:", error);
            setResponses((prev) => [
                ...prev,
                { sender: "bot", text: "Error: Unable to connect to the server." },
            ]);
        }
    };

    // Handle form submission
    const handleFormSubmit = () => {
        if (selectedForm && selectedForm !== "Select Form") {
            sendMessage(`/trigger_action{"param": "${selectedForm}"}`);
        } else {
            alert("Please select a valid form before submitting.");
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("access_token"); // Clear the access token
        navigate("/auth"); // Redirect to the login page
    };

    // Render bot messages
    const renderBotMessage = (message, index) => {
        if (message.text) {
            return (
                <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                    <div
                        style={{
                            background: "#2c2c3e",
                            padding: "10px 15px",
                            borderRadius: "15px 15px 15px 0",
                            maxWidth: "70%",
                            color: "#ffffff",
                            fontSize: "0.9rem",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <strong style={{ color: "#00C853" }}>Bot:</strong> {message.text}
                    </div>
                </div>
            );
        }

        if (message.image) {
            return (
                <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                    <div
                        style={{
                            background: "#2c2c3e",
                            padding: "10px",
                            borderRadius: "15px 15px 15px 0",
                            maxWidth: "70%",
                        }}
                    >
                        <strong style={{ color: "#00C853" }}>Bot:</strong>
                        <img
                            src={message.image}
                            alt="Bot response"
                            style={{ width: "100%", borderRadius: "10px", marginTop: "5px" }}
                        />
                    </div>
                </div>
            );
        }

        if (message.custom) {
            const payload = message.custom;

            if (payload.type === "download_file") {
                const hrefPath = `Click to ${payload.href}`;
                return (
                    <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                        <div
                            style={{
                                background: "#2c2c3e",
                                padding: "10px 15px",
                                borderRadius: "15px 15px 15px 0",
                                maxWidth: "70%",
                                color: "#ffffff",
                                fontSize: "0.9rem",
                            }}
                        >
                            <strong style={{ color: "#00C853" }}>Bot:</strong>
                            <div dangerouslySetInnerHTML={{ __html: hrefPath }}></div>
                        </div>
                    </div>
                );
            }

            if (payload.type === "select_options") {
                return (
                    <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                        <div
                            style={{
                                background: "#2c2c3e",
                                padding: "10px 15px",
                                borderRadius: "15px 15px 15px 0",
                                maxWidth: "70%",
                                color: "#ffffff",
                                fontSize: "0.9rem",
                            }}
                        >
                            <strong style={{ color: "#00C853" }}>Bot:</strong> Please select an option:
                            {payload.payload.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(option.title)}
                                    style={{
                                        margin: "5px",
                                        padding: "10px",
                                        background: "#007BFF",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {option.title}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            }

            if (payload.data_type === "date" || payload.data_type === "char") {
                return (
                    <div key={index} style={{ margin: "10px 0", display: "flex", justifyContent: "flex-start" }}>
                        <div
                            style={{
                                background: "#2c2c3e",
                                padding: "10px 15px",
                                borderRadius: "15px 15px 15px 0",
                                maxWidth: "70%",
                                color: "#ffffff",
                                fontSize: "0.9rem",
                            }}
                        >
                            <strong style={{ color: "#00C853" }}>Bot:</strong> {payload.text}
                        </div>
                    </div>
                );
            }
        }

        return null;
    };

    // Handle key down event for message input
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage(message);
            setMessage("");
        }
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
                <span>Skyslope Form Bot</span> {/* Display the selected bot ID */}
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
                        return renderBotMessage(response, index);
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

            {/* Form Selection Area */}
            <div
                style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    backgroundColor: "#2c2c3e", // Dark background for input area
                    borderTop: "2px solid #007BFF",
                }}
            >
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedForm("");
                    }}
                    style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        marginRight: "10px",
                        backgroundColor: "#1e1e2f", // Dark input background
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow
                    }}
                >
                    <option value="">Select Form Category</option>
                    {categories.map((category, idx) => (
                        <option key={idx} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                {selectedCategory && (
                    <select
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "none",
                            marginRight: "10px",
                            backgroundColor: "#1e1e2f", // Dark input background
                            color: "#ffffff",
                            fontSize: "0.9rem",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Subtle shadow
                        }}
                    >
                        <option value="">Select Form</option>
                        {forms[selectedCategory]?.map((form, idx) => (
                            <option key={idx} value={form}>
                                {form}
                            </option>
                        ))}
                    </select>
                )}
                <button
                    onClick={handleFormSubmit}
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
                    Submit
                </button>
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

export default ChatbotApp;