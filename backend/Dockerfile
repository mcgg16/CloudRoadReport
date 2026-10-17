# syntax=docker/dockerfile:1

FROM python:3.13-slim

# Img will contain api-reports 
ARG API_SERVICE=api-reports 

# Copy backend dependencies to the app image  
COPY backend/requirements.txt /app/backend/requirements.txt

# Package for api-reports passing requirements with no cache to keep it leaner 
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the API_Sercice 
WORKDIR /app/backend/${API_SERVICE}

# Copy only the selected API, including app.py and db.py.
COPY backend/${API_SERVICE}/ ./

EXPOSE 8000

# Start server, listen on port 8000, starts two processes for requests, and loads variable app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "app:app"]