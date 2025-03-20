import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import AuthComponent from "./components/AuthComponent";
import BotSelection from "./components/BotSelection";
import ChatbotApp from "./components/ChatbotApp";
import ChatbotApp1 from "./components/ChatbotApp1";
import ChatbotApp2 from "./components/ChatbotApp2";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (userInfo) => {
        setIsAuthenticated(true);
        setUser(userInfo);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = "/"; // Redirect to homepage
    };

    return (
        <Router>
            <Routes>
                {/* <Route path="/" element={<HomePage />} /> */}
                <Route path="/auth" element={<AuthComponent onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/auth/bot-selection" element={<BotSelection handleLogout={handleLogout} />} />
                <Route path="/auth/chatbot/bot3" element={<ChatbotApp handleLogout={handleLogout} />} />
                <Route path="/auth/chatbot/bot1" element={<ChatbotApp1 handleLogout={handleLogout} />} />
                <Route path="/auth/chatbot/bot2" element={<ChatbotApp2 handleLogout={handleLogout} />} />
            </Routes>
        </Router>
    );
}

export default App;

// import React from "react";
// import LoginButton from "./components/LoginButton";

// function App() {
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "100vh",
//         backgroundColor: "#f0f0f0",
//       }}
//     >
//       <LoginButton />
//     </div>
//   );
// }

// export default App;