import os
from datetime import datetime, timedelta, timezone
import pymysql
from flask import Flask, request, jsonify, session
from db import get_connection

app = Flask(__name__)

# Added to configure secrets from the api-accounts to use session info
app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_HTTPONLY=True, # Use this because using HTTP so that JS doesn't read the cookie
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False, # Would be true if using HTTPs, but HTTP is insecure
    PERMANENT_SESSION_LIFETIME=timedelta(hours=6),
)

# Basic healthcheck
@app.get("/api/reports/health")
def health():
    return {
        "service": "records",
        "status": "running",
    }
    
# Make region reports if user has a session
@app.post("/api/reports/make")
def make_report(): 
    user_id = session.get("user_id") # Extract id from the saved session
    
    if user_id is None: 
        return  {"error": "Log in to make a report"}, 401
    
    # Does have sesh, can make request
    data = request.get_json(silent=True)

    # Badly structured gives an error
    if not isinstance(data, dict):
        return {"error": "Expected report as JSON"}, 400

    # POST with report info
    observed_at = data.get("observed_at") # May differ from default wheras submitted_at does adhere perfectly
    condition_id = data.get("condition_id")
    region_id = data.get("region_id")

    # One of them is empty 
    if not isinstance(observed_at, user_id, condition_id, region_id):
        return {"error": "Missing information to generate report"}, 400
    
    # Check numeric foreign keys are valid, shouldn't even be needed though
    if type(condition_id) is not int or condition_id <= 0:
        return {"error": "Select a valid condition"}, 400

    if type(region_id) is not int or region_id <= 0:
        return {"error": "Select a valid region"}, 400
    
    # If no observed time, set it to current time 
    if observed_at is None: 
        observation = datetime.now(timezone.utc)
        
    # Get rid of timezone info, AI suggestion
    observation = observation.replace(tzinfo=None)
    connection = None
    
    # Establish connection to make the post
    try:
        connection = get_connection()
        
        # SQL query to execute, and extract id that was just generated with %s to pass the strings
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO reports (observed_at, user_id, condition_id, region_id)
                VALUES (%s, %s, %s, %s)
                """,
                (observation, user_id, condition_id, region_id),
            )
            id = cursor.lastrowid

        # All went smoothly, 
        connection.commit()

        # For error logging
        return {"id": id, "user_id": user_id, "region_id": region_id, "condition_id": condition_id}, 201

    # Got SQL error from non-unique username 
    except pymysql.IntegrityError as error:
        # Error inserting
        app.logger.exception("Report failed")
        return {"error": "Could not create make report"}, 500

    # Something else failed
    except pymysql.MySQLError:
        if connection is not None:
            connection.rollback()
            
        # AI suggestion because that ID rejects foreign keys that do not exist in referenced table
        if error.args[0] == 1452:
            return {"error": "User, region, or condition no longer exists"}, 400

        app.logger.exception("Report insertion failed")
        return {"error": "Could not create report"}, 500
    
    except pymysql.MySQLError:
        if connection is not None:
            connection.rollback()

        app.logger.exception("Report database error")
        return {"error": "Database temporarily unavailable"}, 503

    # Once done, closes the connection
    finally:
        if connection is not None:
            connection.close()

# Get information from db for pop-ups
## Get conditions to display in dropdown
@app.get("/api/reports/conditions")
def get_conditions(): 
    try:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name, description FROM conditions ORDER BY id"
                )
                conditions = cursor.fetchall()
        finally:
            connection.close()

        return jsonify(conditions)

    except pymysql.MySQLError:
        app.logger.exception("Could not retrieve regions")
        return {"error": "Database temporarily unavailable"}, 503
    return

## Get region id and name
@app.get("/api/reports/names")
def get_region_names():
    try:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name FROM regions ORDER BY id"
                )
                names = cursor.fetchall()
        finally:
            connection.close()

        return jsonify(names)

    except pymysql.MySQLError:
        app.logger.exception("Could not retrieve region names")
        return {"error": "Database temporarily unavailable"}, 503 

# Get region reports 
@app.get("/api/reports/regions")
def get_regions():
    try:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name FROM regions ORDER BY id"
                )
                regions = cursor.fetchall()
        finally:
            connection.close()

        return jsonify(regions)

    except pymysql.MySQLError:
        app.logger.exception("Could not retrieve regions")
        return {"error": "Database temporarily unavailable"}, 503