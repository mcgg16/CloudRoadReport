import pymysql
from flask import Flask, jsonify
from db import get_connection

app = Flask(__name__)

# Basic healthcheck
@app.get("/api/reports/health")
def health():
    return {
        "service": "records",
        "status": "running",
    }


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