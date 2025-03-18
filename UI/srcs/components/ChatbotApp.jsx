import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const RASA_URL = "https://onestrealestate.io/rasa_bot";
const FORMS_JSON_PATH = "actions/form_filling_code/forms_subset.json";
const AUTH_URL = "https://onestrealestate.io/login";


function ChatbotApp() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Ref for the chat container
  const chatContainerRef = useRef(null);

  // Auto-scroll to the bottom of the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [responses]); // Trigger auto-scroll when responses change

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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const authCode = queryParams.get("code");

    if (authCode) {
      exchangeCodeForToken(authCode);
    }
  }, [location]);

  const handleLogin = async () => {
    try {
      const response = await axios.get(AUTH_URL);
      const authRedirectUrl = response.data.auth_url;
      console.log("authRedirectUrl", authRedirectUrl);
      window.location.href = authRedirectUrl;
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Failed to initiate login. Please try again.");
    }
  };

  const exchangeCodeForToken = async (code) => {
    try {
      const tokenResponse = await axios.post("https://onestrealestate.io/token", {
        code,
      });

      const { access_token, user_info } = tokenResponse.data;

      localStorage.setItem("access_token", access_token);
      setUser(user_info);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      // alert("Failed to complete authentication. Please try again.");
    }
  };

  const handleLogout = () => {
    // Clear the access token and user information
    localStorage.removeItem("access_token");
    setUser(null);
    setIsAuthorized(false);

    // Clear the authorization code from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("code"); // Remove the `code` parameter from the URL

    // Redirect to the base URL (dynamically determined)
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.location.href = baseUrl; // Redirect to the base URL
  };

  const validateDate = (input) => {
    // Basic format validation (e.g., MM-DD-YYYY)
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    if (!datePattern.test(input)) return false;
  
    // Split the input into month, day, and year
    const [month, day, year] = input.split("-").map(Number);
  
    // Validate month (01-12)
    if (month < 1 || month > 12) return false;
  
    // Validate day (01-31)
    if (day < 1 || day > 31) return false;
  
    // Validate specific month-day combinations
    const monthsWith30Days = [4, 6, 9, 11]; // April, June, September, November
    if (monthsWith30Days.includes(month) && day > 30) return false;
  
    // Validate February
    if (month === 2) {
      // Check for leap year
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      if (day > 29 || (day === 29 && !isLeapYear)) return false;
    }
  
    // Additional validation using JavaScript's Date object
    const date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  };

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
      // Validate the date input
      if (!validateDate(text)) {
        alert("Please enter a valid date in the format MM-DD-YYYY.");
        setMessage(""); // Clear the input
        return; // Prevent sending the message
      }
    }

    setResponses((prev) => [...prev, { sender: "user", text }]);

    try {
      const res = await axios.post(RASA_URL, { sender: user['preferred_username'], message: text });
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

  const handleFormSubmit = () => {
    if (selectedForm && selectedForm !== "Select Form") {
      sendMessage(`/trigger_action{"param": "${selectedForm}"}`);
    } else {
      alert("Please select a valid form before submitting.");
    }
  };

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
        backgroundColor: "#1e1e2f",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        style={{
          backgroundColor: "#007BFF",
          padding: "20px",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#ffffff",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Form Filling Chatbot</span>
        {isAuthorized ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              backgroundColor: "#ff4d4d",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              backgroundColor: "rgb(215 166 16)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            Login with Azure AD
          </button>
        )}
      </div>

      {isAuthorized ? (
        <>
          <div
            ref={chatContainerRef} // Attach the ref to the chat container
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              margin: "0",
              backgroundColor: "#121212",
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
                      background: "#007BFF",
                      padding: "10px 15px",
                      borderRadius: "15px 15px 0 15px",
                      maxWidth: "70%",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>You:</strong> {response.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              backgroundColor: "#1e1e2f",
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
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: "#2c2c3e",
                color: "#ffffff",
                fontSize: "0.9rem",
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
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#2c2c3e",
                  color: "#ffffff",
                  fontSize: "0.9rem",
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
                borderRadius: "5px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              Submit
            </button>
          </div>

          <div
            style={{
              display: "flex",
              padding: "20px",
              backgroundColor: "#1e1e2f",
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
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginRight: "10px",
                backgroundColor: "#2c2c3e",
                color: "#ffffff",
                fontSize: "0.9rem",
              }}
            />
            <button
              onClick={() => sendMessage(message)}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "1.2rem",
          }}
        >
          Please log in to continue.
        </div>
      )}
    </div>
  );
}

export default ChatbotApp;