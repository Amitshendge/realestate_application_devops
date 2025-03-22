import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import ChatbotApp from './components/ChatbotApp';

function App() {
    console.log("App component rendered"); // Debug log
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chatbot" element={<ChatbotApp />} />
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