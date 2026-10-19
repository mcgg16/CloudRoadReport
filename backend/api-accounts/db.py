import os
from pathlib import Path

import pymysql
from dotenv import load_dotenv

# Both service folders have backend/ as their parent.
env_path = Path(__file__).resolve().parents[2] / ".env" # Goes to root folder for env
load_dotenv(env_path)

# Form the connection
def get_connection():
    return pymysql.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ.get("DB_PORT", "3306")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
        init_command="SET time_zone = '+00:00'",
    )