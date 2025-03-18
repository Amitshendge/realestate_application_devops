export const msalConfig = {
    auth: {
      clientId: import.meta.env.VITE_CLIENT_ID, // Your Azure AD Client ID
      authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`, // Your Azure AD Tenant ID
      redirectUri: import.meta.env.VITE_REDIRECT_URI, // Your app's redirect URI
    },
    cache: {
      cacheLocation: "sessionStorage", // Store tokens in sessionStorage
      storeAuthStateInCookie: false, // Set to true if you have issues in IE11/Edge
    },
  };
  
  export const loginRequest = {
    scopes: ["User.Read"],
    redirectUri: import.meta.env.VITE_REDIRECT_URI, // Requested permissions
  };
  
  console.log("MSAL Config Auth:", msalConfig);
    console.log("Login Request Auth:", loginRequest);

  export const allowedGroupId = import.meta.env.VITE_ADMIN_GROUP_ID; // Allowed group ID