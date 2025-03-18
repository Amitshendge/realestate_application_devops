import React from 'react';
import axios from 'axios';

const AUTH_URL = "https://onestrealestate.io/login";

function AuthComponent() {
    const handleLogin = async () => {
        try {
            console.log("Redirecting to Azure AD login...");
            const response = await axios.get(AUTH_URL);
            console.log("Response:", response.data);
            window.location.href = response.data.auth_url; // Redirect to Azure AD login
            console.log("Redirecting to Azure AD login...");
        } catch (error) {
            console.error("Error during authentication:", error);
            alert("Failed to initiate login. Please try again.");
        }
    };

    return (
        <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden', // Ensure the blur effect doesn't overflow
        }}>
            {/* Background Image with Blur */}
            <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(public/home_bg.webp)', // Replace with your image path
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)', // Apply blur effect to the background image
                zIndex: -1, // Ensure it stays behind the content
            }}></div>

            {/* Dark Overlay */}
            <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(30, 30, 47, 0.5)', // Semi-transparent dark overlay
                zIndex: 0, // Place it above the blurred background but below the content
            }}></div>

            {/* Login Section */}
            <div style={{ 
                textAlign: 'center',
                padding: '40px',
                borderRadius: '15px',
                backgroundColor: '#2c2c3e', // Slightly lighter background for the container
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)', // Stronger shadow for focus
                zIndex: 1, // Ensure the login section is above everything
            }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '20px', 
                    color: '#ffffff',
                    fontWeight: 'bold',
                }}>
                    Welcome to Our Platform
                </h1>
                <p style={{ 
                    fontSize: '1.2rem', 
                    marginBottom: '40px', 
                    color: '#a0a0a0',
                }}>
                    Securely log in with your Azure AD account to access the chatbot.
                </p>
                <button 
                    onClick={handleLogin}
                    style={{ 
                        padding: '15px 30px', 
                        borderRadius: '8px', 
                        background: '#007BFF', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        transition: 'background 0.3s ease, transform 0.2s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', // Button shadow
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = '#005bb5';
                        e.target.style.transform = 'scale(1.05)'; // Slight scale effect on hover
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = '#007BFF';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Login with Azure AD
                </button>
            </div>
        </div>
    );
}

export default AuthComponent;