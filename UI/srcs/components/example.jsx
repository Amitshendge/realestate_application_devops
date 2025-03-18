import React, { useState, useEffect } from "react";
import axios from "axios";

const RASA_URL = "http://localhost:2005/webhooks/rest/webhook";
const FORMS_JSON_PATH = "actions/form_filling_code/forms_subset.json"; // Replace with the actual path to your JSON file

function ChatbotApp() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedForm, setSelectedForm] = useState("");

  // Fetch forms_subset.json on component mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get(FORMS_JSON_PATH);
        setForms(response.data); // Set forms JSON structure
        setCategories(Object.keys(response.data)); // Extract categories
      } catch (error) {
        console.error("Error fetching forms_subset.json:", error);
      }
    };
    fetchForms();
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message to the chat
    setResponses((prev) => [...prev, { sender: "user", text }]);

    try {
      const res = await axios.post('/webhooks/rest/webhook', { sender: "user", message: text });
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
        <div key={index} style={{ margin: "10px 0" }}>
          <strong style={{ color: "#00C853" }}>Bot:</strong> {message.text}
        </div>
      );
    }

    if (message.image) {
      return (
        <div key={index} style={{ margin: "10px 0" }}>
          <strong style={{ color: "#00C853" }}>Bot:</strong>
          <img
            src={message.image}
            alt="Bot response"
            style={{ width: "200px", borderRadius: "5px", marginTop: "5px" }}
          />
        </div>
      );
    }

    if (message.custom) {
      const payload = message.custom;
      if (payload.type === "download_file") {
        const fileUrl = `actions/download_file/${payload.file_name}`;
        return (
          <div key={index} style={{ margin: "10px 0" }}>
            <strong style={{ color: "#00C853" }}>Bot:</strong>{" "}
            <a href={fileUrl} download style={{ color: "#007BFF" }}>
              Download File
            </a>
          </div>
        );
      }

      if (payload.type === "select_options") {
        return (
          <div key={index} style={{ margin: "10px 0" }}>
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
                }}
              >
                {option.title}
              </button>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#121212",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1e1e2f",
          padding: "20px",
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: "2px solid #007BFF",
        }}
      >
        Form Filling Chatbot
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          margin: "0 20px",
          backgroundColor: "#1e1e2f",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {responses.map((response, index) => {
          if (response.sender === "bot") {
            return renderBotMessage(response, index);
          }
          return (
            <div
              key={index}
              style={{
                margin: "10px 0",
                textAlign: "right",
              }}
            >
              <strong style={{ color: "#007BFF" }}>You:</strong> {response.text}
            </div>
          );
        })}
      </div>

      {/* Form Selection */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          borderTop: "2px solid #007BFF",
          backgroundColor: "#1e1e2f",
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
            color: "#fff",
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
              color: "#fff",
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
            fontSize: "1rem",
          }}
        >
          Submit
        </button>
      </div>

      {/* Input Box */}
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
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginRight: "10px",
            backgroundColor: "#2c2c3e",
            color: "#fff",
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
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatbotApp;
