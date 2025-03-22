from fastapi import FastAPI, HTTPException, Form
from dotenv import load_dotenv
from msal import ConfidentialClientApplication
import os
import uuid
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests

# Load environment variables
load_dotenv()

# Azure AD credentials
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = os.getenv("TENANT_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["User.Read"]  # Microsoft Graph API scope

# MSAL instance
app_instance = ConfidentialClientApplication(
    CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
)

# FastAPI app
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

# FastAPI app
app = FastAPI()

# CORS settings
origins = [
    "*",  # React app running locally
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/api/")
def index():
    """Home route"""
    return {"message": "Welcome to the FastAPI App with Azure AD Authentication!"}

@app.get("/api/login")
def login():
    """Generate Azure AD login URL"""
    state = str(uuid.uuid4())  # Random session state
    auth_url = app_instance.get_authorization_request_url(
        SCOPE, state=state, redirect_uri=REDIRECT_URI
    )
    return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Login URL generated successfully",
                "auth_url": auth_url,
                "state": state,  # You might need this for validation in frontend
            },
        )

@app.get("/api/dev_login")
def login():
    """Generate Azure AD login URL"""
    state = str(uuid.uuid4())  # Random session state
    auth_url = app_instance.get_authorization_request_url(
        SCOPE, state=state, redirect_uri=REDIRECT_URI
    )
    return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Login URL generated successfully",
                "auth_url": auth_url,
                "state": state,  # You might need this for validation in frontend
            },
        )

# Define a Pydantic model for the request body
class TokenRequest(BaseModel):
    code: str

@app.post("/api/token")
def get_user_info(request: TokenRequest):
    """Exchange authorization code for user info"""
    try:
        result = app_instance.acquire_token_by_authorization_code(
            request.code, scopes=SCOPE, redirect_uri=REDIRECT_URI
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result.get("error_description", "Authentication failed"))

        claims = result.get("id_token_claims", {})
        user_info = {
            "name": claims.get("name"),
            "groups": claims.get("groups", []),
        }

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "User authenticated successfully",
                "user": user_info,
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Error during authentication", "error": str(e)},
        )
    
# Define a Pydantic model for the request body
class TextRequest(BaseModel):
    text_question: str

@app.post("/api/bot1")
def get_user_info(request: TextRequest):
    """Exchange authorization code for user info"""
    from bot1 import chatbot  # Import the chatbot function from your backend
    return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "bot_answer": chatbot(request.text_question),
            },
        )

@app.post("/api/bot2")
def get_user_info(request: TextRequest):
    """Exchange authorization code for user info"""
    from bot2 import chatbot  # Import the chatbot function from your backend
    return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "bot_answer": chatbot(request.text_question),
            },
        )

class RasaRequest(BaseModel):
    message: str
    sender: str
@app.post("/api/rasa_bot")
def get_user_info(request: RasaRequest):
    """Exchange authorization code for user info"""
    payload = {"sender":request.sender,"message": request.message}
    response = requests.post("http://localhost:2005/webhooks/rest/webhook", json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return [{"text": "Sorry, I couldn't get a response from the bot."}]
