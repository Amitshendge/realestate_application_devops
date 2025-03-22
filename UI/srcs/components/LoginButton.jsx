// import React from "react";
// import { useMsal } from "@azure/msal-react";
// import { loginRequest } from "../authConfig";

// function LoginButton() {
//   const { instance } = useMsal();

//   console.log("MSAL instance Login:", instance);

//   const handleLogin = () => {
//     instance
//       .loginRedirect(loginRequest)
//       .then(() => {
//         console.log("Login initiated successfully.");
//       })
//       .catch((error) => {
//         console.error("Login failed:", error);
//       });
//   };

//   return (
//     <button onClick={handleLogin}>
//       Login with Azure AD
//     </button>
//   );
// }

// export default LoginButton;

import { PublicClientApplication } from "@azure/msal-browser";
import { useState, useEffect } from "react";

const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
        redirectUri: import.meta.env.VITE_REDIRECT_URI, // Ensure this matches your Azure AD config
    },
};

const msalInstance = new PublicClientApplication(msalConfig);

const LoginButton = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize(); // Ensure initialization
                setIsInitialized(true);
            } catch (error) {
                console.error("MSAL initialization error:", error);
            }
        };
        initializeMsal();
    }, []);

    const login = async () => {
        if (!isInitialized) {
            console.error("MSAL instance is not initialized.");
            return;
        }
        try {
            const state = crypto.randomUUID(); // Generate a random state value
            const authRequest = {
                scopes: ["User.Read"], // Adjust your scopes
                state: state,
            };

            await msalInstance.loginRedirect(authRequest);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div>
            <button onClick={login} disabled={!isInitialized}>
                {isInitialized ? "Login with Azure AD" : "Initializing..."}
            </button>
        </div>
    );
};

export default LoginButton;
