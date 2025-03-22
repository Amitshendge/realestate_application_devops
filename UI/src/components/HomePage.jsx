import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    const handleOpenChatbot = () => {
        navigate('/auth'); // Navigate to the authentication route
    };

    return (
        <div style={{ 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif', 
            textAlign: 'center', 
            backgroundColor: '#f0f0f0', 
            minHeight: '100vh', 
            width: '100vw', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <h1 style={{ color: '#333', marginBottom: '20px' }}>Welcome to the Rasa Chatbot Application</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>Click the button below to open the chatbot.</p>
            <button 
                onClick={handleOpenChatbot}
                style={{ 
                    padding: '10px 20px', 
                    borderRadius: '5px', 
                    background: '#007BFF', 
                    color: '#fff', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '16px', 
                    transition: 'background 0.3s ease' 
                }}
                onMouseOver={(e) => e.target.style.background = '#005bb5'}
                onMouseOut={(e) => e.target.style.background = '#007BFF'}
            >
                Login to Access Chatbots
            </button>
        </div>
    );
}

export default HomePage;