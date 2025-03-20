import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function BotSelection({ handleLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const authCode = queryParams.get("code");

        if (authCode) {
            // Exchange the code for an access token
            exchangeCodeForToken(authCode);
        } else {
            // Check if the user is already authenticated
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
                navigate("/auth"); // Redirect to auth if no token
            } else {
                // Fetch user groups if already authenticated
                fetchUserGroups();
            }
        }
    }, [location, navigate]);

    const exchangeCodeForToken = async (code) => {
        try {
            const tokenResponse = await axios.post("https://onestrealestate.io/token", { code });
            localStorage.setItem("access_token", tokenResponse.data.access_token); // Store token
            console.log("Token stored:", tokenResponse.data.access_token); // Debugging
            setUserGroups(tokenResponse.data.user.groups); // Store user groups
            navigate('/auth/bot-selection'); // Redirect to remove the `code` from the URL
        } catch (error) {
            console.error("Error exchanging code for token:", error);
            alert("Failed to authenticate. Please try again.");
        }
    };

    const fetchUserGroups = async () => {
        try {
            const response = await axios.get("https://onestrealestate.io/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });
            setUserGroups(response.data.user.groups);
        } catch (error) {
            console.error("Error fetching user groups:", error);
        }
    };

    const handleBotSelect = (botId) => {
        navigate(`/auth/chatbot/${botId}`); // Navigate to the selected bot's chat interface
    };

    // Define bot groups
    const botGroups = {
        "ONest Bot": ["049a2fae-0e46-456d-98bc-48262e546d28"],
        "SkySLope and Agent bot": ["41c81643-ff1a-44e1-b941-15fdbf4852a4"]
    };

    // Check if user has access to a bot
    const hasAccessToBot = (botGroupIds) => {
        return botGroupIds.some(groupId => userGroups.includes(groupId));
    };
    
    return (
        <div style={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
            position: "relative",
            overflow: "hidden", // Ensure the blur effect doesn't overflow
        }}>
            {/* Background Image with Blur */}
            <div style={{ 
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(public/home_bg.webp)', // Replace with your image path
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(8px)", // Apply blur effect to the background image
                zIndex: -1, // Ensure it stays behind the content
            }}></div>

            {/* Dark Overlay */}
            <div style={{ 
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(30, 30, 47, 0.5)", // Semi-transparent dark overlay
                zIndex: 0, // Place it above the blurred background but below the content
            }}></div>

            {/* Bot Selection Section */}
            <div style={{ 
                textAlign: "center",
                padding: "40px",
                borderRadius: "15px",
                backgroundColor: "#2c2c3e", // Slightly lighter background for the container
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)", // Stronger shadow for focus
                zIndex: 1, // Ensure the bot selection section is above everything
            }}>
                <h1 style={{ 
                    fontSize: "2.5rem", 
                    marginBottom: "20px", 
                    color: "#ffffff",
                    fontWeight: "bold",
                }}>
                    Select a Chatbot
                </h1>
                <div style={{ 
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}>
                    {hasAccessToBot(botGroups["ONest Bot"]) && (
                        <button 
                            onClick={() => handleBotSelect("bot1")}
                            style={{ 
                                padding: "15px 30px", 
                                borderRadius: "8px", 
                                background: "#007BFF", 
                                color: "#fff", 
                                border: "none", 
                                cursor: "pointer", 
                                fontSize: "1.1rem", 
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
                            oNEST Bot
                        </button>
                    )}
                    {hasAccessToBot(botGroups["SkySLope and Agent bot"]) && (
                        <>
                            <button 
                                onClick={() => handleBotSelect("bot2")}
                                style={{ 
                                    padding: "15px 30px", 
                                    borderRadius: "8px", 
                                    background: "#007BFF", 
                                    color: "#fff", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    fontSize: "1.1rem", 
                                    fontWeight: "bold",
                                    transition: "background 0.3s ease, transform 0.2s ease",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Button shadow
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = "#005bb5";
                                    e.target.style.transform = "scale(1.05)"; // Slight scale ffect on hover
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = "#007BFF";
                                    e.target.style.transform = "scale(1)";
                                }}
                            >
                                Agent Resource Bot
                            </button>
                            <button 
                                onClick={() => handleBotSelect("bot3")}
                                style={{ 
                                    padding: "15px 30px", 
                                    borderRadius: "8px", 
                                    background: "#007BFF", 
                                    color: "#fff", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    fontSize: "1.1rem", 
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
                                Skyslope Form Bot
                            </button>
                        </>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: "15px 30px",
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        transition: "background 0.3s ease, transform 0.2s ease",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", // Button shadow
                        marginTop: "20px",
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
        </div>
    );
}

export default BotSelection;