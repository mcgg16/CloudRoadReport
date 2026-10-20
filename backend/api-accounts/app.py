import os
from datetime import timedelta # For sessions

import pymysql
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS 
from werkzeug.security import generate_password_hash, check_password_hash


# Database
from db import get_connection

app = Flask(__name__)

# Added to configure secrets, genereated by ChatGPT to add session that lasts max 6 hours for rides
app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_HTTPONLY=True, # Use this because using HTTP so that JS doesn't read the cookie
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False, # Would be true if using HTTPs, but HTTP is insecure
    PERMANENT_SESSION_LIFETIME=timedelta(hours=6),
)

# Basic health check
@app.get("/api/accounts/health")
def health():
    return {
        "service": "accounts",
        "status": "running",
    }

# Revised create account
@app.post("/api/accounts/register")
def register():
    data = request.get_json(silent=True)

    # Badly structured gives an error
    if not isinstance(data, dict):
        return {"error": "Expected username and password as JSON"}, 400

    # POST with username and pwd
    username = data.get("username")
    password = data.get("password")

    # One of them is empty 
    if not isinstance(username, str) or not isinstance(password, str):
        return {"error": "Username and password are required"}, 400

    # Remove any spaces and such from it
    username = username.strip()
    
    if not username and not password: 
        return {"error": "Please enter a username and password"}
    
    # Keep within database limits 
    if not username or len(username) > 50:
        return {"error": "Username must be less than 50 characters"}, 400

    # Keep within password limits
    if not password or len(password) > 256:
        return {"error": "Password must be 1–256 characters"}, 400

    # Create a hash 
    password_hash = generate_password_hash(password)
    connection = None

    # Establish connection 
    try:
        connection = get_connection()
        
        # SQL query to execute, and extract id that was just generated with %s to pass the strings
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (username, password_hash)
                VALUES (%s, %s)
                """,
                (username, password_hash),
            )
            user_id = cursor.lastrowid

        # All went smoothly, 
        connection.commit()

        # Sets the session with created account
        session.clear()
        session.permanent = True
        session["user_id"] = user_id
        session["username"] = username

        # For error logging
        return {"id": user_id, "username": username}, 201

    # Got SQL error from non-unique username 
    except pymysql.IntegrityError as error:
        if connection is not None:
            connection.rollback()
            
        if error.args[0] == 1062:
            return {"error": "This username already exists"}, 409

        # Had an erorr 
        app.logger.exception("Registration failed")
        return {"error": "Could not create account"}, 500

    # Something else failed
    except pymysql.MySQLError:
        if connection is not None:
            connection.rollback()

        app.logger.exception("Registration database error")
        return {"error": "Database temporarily unavailable, please try again later"}, 503

    # Once done, closes the connection
    finally:
        if connection is not None:
            connection.close()
            
# Login as a post to protect security
@app.post("/api/accounts/login")
def login():
    data = request.get_json(silent=True)

    # Badly structured gives an error
    if not isinstance(data, dict):
        return {"error": "Expected username and password as JSON"}, 400

    # Extract username and pwd
    username = data.get("username")
    password = data.get("password")

    # One of them is empty 
    if not isinstance(username, str) or not isinstance(password, str):
        return {"error": "Username and password are required"}, 400

    # Remove any spaces and such from it
    username = username.strip()
    
    if not username and not password: 
        return {"error": "Please enter a username and password"}
    
    # Keep within database limits 
    if not username or len(username) > 50:
        return {"error": "Username must be less than 50 characters"}, 400

    # Keep within password limits
    if not password or len(password) > 256:
        return {"error": "Password must be between 1–256 characters"}, 400

    connection = None

    # Establish connection 
    try:
        connection = get_connection()
        
        # SQL query to execute, and extract id that was just generated with %s to pass the strings, sets as dictionary to extract rows more easily
        # AI correction remove it formatted as dictionary, and set username as a tuple adding comma
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, username, password_hash FROM users WHERE username = %s
                """,
                (username,),
            )
            user = cursor.fetchone() # Extracts the id

        # Close cursor
        cursor.close()
        
        # Verify the user exists in database and the password matches
        if user is None or not check_password_hash(user['password_hash'], password): 
            # Does not exist or incorrect credentials
            return {"error": "Incorrect username or password"}, 401

        # Otherwise login succeeded, replace session with correct auth
        session.clear()
        session.permanent = True
        session["user_id"] = user["id"]
        session["username"] = user["username"]
        
        return {
            "id": user["id"], 
            "username": user["username"],
        }, 200

    # Something failed
    except pymysql.MySQLError:
        app.logger.exception("Login database error")
        return {"error": "Database temporarily unavailable, please try again later"}, 503

    # Once done, closes the connection
    finally:
        if connection is not None:
            connection.close()

@app.route("/logout")
def logout():
    # Erase session token
    session.clear()
    return {"success": "Logged out"}, 201

# AI suggestion to check session
@app.get("/api/accounts/session")
def current_user():
    # Checks the flask session wrt to the id 
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401

    return {
        "id": session["user_id"],
        "username": session["username"],
    }, 200