# # syntax=docker/dockerfile:1

# # Backend with Python
# FROM python:3.13.5-alpine AS builder

# WORKDIR /CloudRoadReport
# # Install requirements to api-accounts and api-reports passing the env files that are in root to backend files
# COPY backend/requirements.txt backend/api-accounts/app.py .env .
# COPY backend/requirements.txt backend/api-reports/app.py .env .
# RUN pip install -r ./requirements.txt
# # Idk what the difference between production and development is
# ENV FLASK_ENV development

# # Extensions for MariaDB, I had done base with php-ext for mysqli, pdo_mysql, pecl igbinary  
# #RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
# #&& docker-php-ext-install mysqli pdo_mysql \
# #&& pecl install igbinary redis \
# #&& docker-php-ext-enable igbinary redis \
# #&& rm -rf /tmp/pear \
# #&& apk del .build-deps
# #WORKDIR /var/www/html
# # AI suggestion so line corrected from # /var/www/html/vendor because I had not included the --from=builder was missing so that rendered the multi-stage
# # approach practically useless, and it also identified that I had to copy the /app/vendor to the current working directory vendor
# #COPY --from=builder /app/vendor  ./vendor 

# # nginx to serve React
# FROM nginx:1.30-alpine
# # No idea how to even configure it
# COPY conf /etc/nginx/conf.d/default.conf 

# EXPOSE 5000
# CMD ["flask", "run"]

# # Healthcheck 
# HEALTHCHECK --start-period=10s --interval=30s --timeout=5s --retries=3 \
#     CMD curl --fail http://localhost:5000/health || exit 1