# syntax=docker/dockerfile:1

# Stage 1: Build react 
FROM node:22-alpine AS builder

# Sets directory in build stage 
WORKDIR /app

# Stuff for react definitions and lockfile 
COPY frontend/package*.json ./ 

# AI suggestion, I had npm install but ci is better for CI/CD to install dependencies 
RUN npm ci 

# Copy rest of the frontend code 
COPY frontend/ ./

# Makes the dist file deployable 
RUN npm run build

# Stage 2: serve the files w nginx
FROM nginx:1.13-alpine

# Copies the built website into its web directory 
COPY --from=builder /app/dist /usr/share/nginx/html
# Installs nginx configuration 
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf 

# Uses the HTTP port on container
EXPOSE 80

# Runs nginx in foreground so that the container can stay running 
CMD ["nginx", "-g", "daemon off;"]