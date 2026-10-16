from flask import Flask

app = Flask(__name__)

# Basic health check
@app.get("/api/accounts/health")
def health():
    return {
        "service": "accounts",
        "status": "running",
    }