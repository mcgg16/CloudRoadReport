syntax=docker/dockerfile:1

FROM nginx:1.13-alpine AS builder
# I currently have frontend/vite.config.ts with the server listening for the ports, not sure if I should copy to app/composer.json or smth else that does not exsist yet 
WORKDIR frontend
# Nginx connection
COPY /vite.config.ts /etc/nginx/conf.d/default.conf
# Stuff for react code 
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy rest of source code 
COPY . . 
# Not sure if I should run dev, build, or soemthing more complex
RUN npm run dev 

# Make sure "node" user owns app files
RUN chown -R node:node /app

# Switch to node user 
USER node 

# Expose Vite dev port, not sure if I should use 5173 or the env APP_PORT=8080
EXPOSE 5173 

# Run Vite in dev mode, accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

## OTHER VERSIONS I FOUND
# Idk if i should expose the APP_PORT 8080 or localhost 5173 or the port when i do npm run build or smth... the one I had done with nginx had an ap copy exposing 9000 and CMD ["php-fpm", "-F"]
#EXPOSE 8080

# I foudn this for a build enviornment, i think i can probably use dev no? Like as long as its on the cloud, i am okay? 
RUN yarn
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]