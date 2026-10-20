# Project Installation
This specification assumes that Google's Cloud Engine is being used and a VM and kubernetes cluster are already configured. Additionally, gcloud, kubectl, docker, vim and GKE authentication plugins are installed.

Pull repository from GitHub: ```git clone https://github.com/mcgg16/CloudRoadReport && cd CloudRoadReport/``` and copy the .env.example file values by navigating to ```vim .env.example``` and then typing ```vim .env```; the env that was used for this submission will be attached in blackboard. Then, run the following command to create the database 
```
kubectl create configmap road-db-init \
  --from-file=01-init.sql=database/init.sql \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

For local testing, ```docker compose build``` to build the services, then ```docker compose up -d``` and access via the VM?s external IP with http:<EXTERNAL_IP>:8080, which may be subject to firewall rules.

To test with kubernetes, check which project is being used with ```gcloud config get-value project```, and, if necessary, create a cluster that can be utilized for testing this project. Then, scale the nodes using the following command, modifying zone with respect to the clusters' zone and the previuos project id as necessary:
```bash
gcloud container clusters resize road-report-cluster \
  --node-pool=default-pool \
  --num-nodes=3 \
  --zone=ZONE \
  --project=ID
```

Then, generate a session token by running ```bash k8s/setup_session_secret.sh``` in order to authenticate users. Then, run ```kubectl apply -f kubernetes.yaml``` and wait for the configuration to be applied. Afterwards, type ```kubectl get services``` and wait for the service named frontend of type LoadBalancer to come online. It will generate an EXTERNAL-IP, type http://<EXTERNAL_IP> in the browser. 

## Basic project flow
Once installed, there will be no reports already in the database–only configured regions showing that no reports have been made as indicated by the 0s. Since there are no users configured, it is necessary to click on "Register" in the navigation bar with the desired credentials, which will enable the report button "+ Make report". Once clicked, a pop-up opens, allowing the user to choose a suburb, road condition, and time of observation. Once done, click "Submit" and, if the report time was set within the last 12 hours, watch how the suburb table is modified accordingly. Once you are done, click on "Sign Out". If you wish to log in again, use the same credentials to start your session. Please note the session has a duration of six hours, after which signing in again will be necessary to log in again.

# AI Declaration
## AI Tools Used
I primairly utilized OpenAI's GPT-6.1 Sol, though ocasional quick searches for implementations also brought up results from Gemini highlighted below. 

## Purpose of Use
I used the tool to brainstorm my general project architecture, obtain guidance as to what I needed to investigate to work on the project, feedback at my implementation attempts, assistance with generating secrets, obtaining Flask endpoint templates because it was a new technology for me, help with React components, backend function corrections and implementation suggestions and revision of my individual report. There are many things I did not know how to do before starting the project, and the tool helped me understand better how I could apply the concepts learned in class–and investigate new ones–in order to build a funcional web application. I always took care to read the suggestions and question what was presented to truly enhance my learning. I noticed it took me a while to learn the commands, and I began to generate my own document that now has over 18 pages with key commands for this project, which I can now apply without resorting to the tool. 

## Prompts Used and Application
The section below will include key prompts and their applications throughout the project. 

### Brainstorming
[Project instructions and rubric criteria files uploaded]
Self-reporting map rain, I have noticed that BNE has really bad weather forecasts. Like I’ll wake up, and see rain forecast, and then go for an entire ride with literally no rain so I almost cancel my rides because of nothing. I’ve seen that there are like magpie swooping maps and such, but maybe a community website that reports the rain. - It could be an open street map with basic api that just sends the time and location, so cyclists can report rain in an area and classify as cloudy, drizzing, moderate rain, strong rain, dry once its over. So it kinda cloudsources a reported rain map.
- Back home my dad is in a WA chat where ppl will ask if like Huasteca is dry to see if they go riding there, so this could kinda help the community explore and people can reshape their training/commutes around whether it is actually raining than a bad forecast.
- This is kinda relevant to the scaleability because on sunny days with genuinely no clouds, no one will be needing to report any weather. So it will practically remain unused, and then it might need to scale up during peak riding hours when ppl are self reporting.
- So kinda like the google maps or waze recordings lol.
- I can have simple features of like create account, add report status, see profile (how many reports made and stuff like that), admin status to manually override reports or see history or smth. And ofc display pins on the map with the rain status.
- Ok maybe I can make it easier just like have the database have a dropdown defining the areas like a simple form where they select their suburb (South Bank, Burleigh, Indoorpilly, etc) and then select the rain level so that kinda helps build a crowdsourced rain report like how many ppl agree with the weather at what time.

Okay so for this I think I want to do the following. I will eliminate the map. The website will just be with these features:

- Make report feature (user selects dropdown region, reports condition, time default now but can modify it and submit button)
- Fetch data from regions (like South bank was reported dry within the last 10 mins by 5 users, South bank dry 20 minutes ago; Toowong Slightly wet: within 10 mins ago by one user (so even if submitted it within last two minutes); Mt coot tha wet within last 10 min; Indoorpilly dry 28 hours ago (with yellow warning icon old info, will be classified as old if more than 24 hrs have passed); Burleigh No report (red icon). I might add a filter by region just a dropdown that then filters stuff out, but that might be too extra.&#x20;
- Login/logout: there will be a profile button in top bar that is default not initiated with an account, but if they click it without being logged in, then it redirects to login page with username, password, and below a simple create acc hyperlink if they don't have one to redirect. If the user is logged in, then clicking the button takes to a view of their name, counter of how many reports they have made, and logout button.&#x20;
- Create account: simple form to create an account. This was suggested by my tutor.

For microservices I proposed DB persistence, website deployed, load balancing, kubernetes scaling, rollout and rollback;  my tutor told me that was enough to show that I was working properly.

Just not sure how to approach it, I'd like to start selecting my tech stack and setting up the base db even if its just with one schema with maybe base fake reports, then write the full file for Docker and Kubernetes, and then actually add the website features, but just overall make sure I hit the class content first... Not sure how to approach this using google vms, like if I can dev locally on GH and then pull it on my vm to be chewcking pedriodically the contaienr is still up

#### Application
Suggested to use the following stacks based on my architecture
| Part | My recommendation | Purpose |
|---|---|---|
| Frontend | React + Vite | Your forms, regional cards, and profile |
| Backend | Node.js + Express | APIs in a language you already know |
| Database | PostgreSQL | Similar SQL foundations to what you used through Supabase |
| Frontend container | Nginx serving the React build | Serves the website and forwards API requests |
| Local environment | Docker Compose | Runs the whole application on your laptop |
| Cloud deployment | Kubernetes across GCP VMs | Replicas, load balancing, failure recovery, updates |

And it recommended using just two backend services of api/auth and api/reports. Note it suggested using PostgreSQL, I opted for MariaDB. 

### Container base 
Honestly, I am really confused now.... For task 1, I aws given a github file that had the app folder with public src worker and a composer.json with a basic name of the class descritpion type project using just php and and optimize autoloader and such. A folder database with an init.sql just CREATE TABLE commands and insert products. An nginx folder with a default.conf that just had a server listening on port 80, location try_files $uri $uri/ /index.php?$query_string;... so i guess this was just their nginx. 

The website was just simple php, and I wrote the following docker file: 
# syntax=docker/dockerfile:1
# Included build syntax because of AI feedback 

# 1 Basic image
# Define version 
ARG PHP_VERSION=8.4

# AI feedback is that I had declared FROM and done a base install here, now deleted it

# Multi-stage build php-fpm installation 
## 2: Composer build
FROM composer:2.10 AS builder
WORKDIR /app
# AI corrected add . at the end to correctly copy file to current app directory
COPY app/composer.json . 

# 2.1 only prod dependencies without dev ones; 2.2 autoloader changed from no -> optimize after AI correction;
# 2.3 to install without user input; and last one just not to show progress bars from article I read
RUN composer install \
	--no-dev \
	--optimize-autoloader \
	--no-interaction \
	--no-progress

## 3: PHP-FPM installation 
FROM php:${PHP_VERSION}-fpm-alpine 
# Imgage metadata 
LABEL student_name="Monica Guzman" \
student_email="m.guzmangarcia@student.uq.edu.au"

# Extensions for MariaDB, I had done base with php-ext for mysqli, pdo_mysql, pecl igbinary  
# and redis, but AI suggested I use apk instead of the unsuported apt command
# Correction was that I had also enabled all services myself, AI said only needed to enable pecl # since php already activated them, and del removes build dependencies and rm -rf /tmp/pear was also suggested by ChatGPT to keep the image lean
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
&& docker-php-ext-install mysqli pdo_mysql \
&& pecl install igbinary redis \
&& docker-php-ext-enable igbinary redis \
&& rm -rf /tmp/pear \
&& apk del .build-deps
# AI suggestion to add the workdir, useful for next stage as well, uses builder and copies to 
# workdir file 
WORKDIR /var/www/html
# AI suggestion so line corrected from # /var/www/html/vendor because I had not included the --from=builder was missing so that rendered the multi-stage
# approach practically useless, and it also identified that I had to copy the /app/vendor to the current working directory vendor
COPY --from=builder /app/vendor  ./vendor 

## 4: Configure application image 
# Copies app file to current directory 
COPY app/ . 
EXPOSE 9000
CMD ["php-fpm", "-F"]

## 5: Implement a healthcheck
# 0: success, 1: unhealthy  
# Default is 3 retries but I’ll establish again just in case
# AI corrected because I had a curl to localhost and exit 1, but since container is PHP-FPM, 
# suggested to use in-built php and check extensions are loaded for maria and redis with the CMD provided 
HEALTHCHECK --start-period=10s --interval=30s --timeout=5s --retries=3 \
	CMD php -r 'exit(extension_loaded("mysqli") && extension_loaded("pdo_mysql") && extension_loaded("igbinary") && extension_loaded("redis") ? 0 : 1);'

Then, I wrote a docker-compose.yml:
services: 
  # 2. MariaDB
  db: 
    image: mariadb:11.8
    volumes: 
    # Database info from AI correction from README.md Prompt: Feedback on Docker compose 1
      - mariadb_data:/var/lib/mysql # Originally had done /var/lib/postgresql/data, AI suggested change to current MariaDB format 
      # Mounts info to initdb directory, ChatGPT provided this line because I did not understand how mounting and permissions worked 
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    environment: 
      - MARIADB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MARIADB_DATABASE=${DB_NAME}  
      - MARIADB_USER=${DB_USER}
      - MARIADB_PASSWORD=${DB_PASSWORD}
    healthcheck: 
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: always
    networks:
      - backend

  # 3. Redis from presentation example and health research 
  redis: 
    image: redis:8-alpine
    command: redis-server --appendonly yes # From AI tool to set up redis server and persist
      # Gemini tool provided a compose template that I modified, found in README.md under Prompt: Gemini Base compose for php-fpm and redis
    volumes: 
      - redis_data:/data
    # AI suggested change of test to more basic, had “--raw” and “incr” previously for my health check
    # Redis should respond w pong if healthy
    healthcheck: 
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 3  
    restart: unless-stopped
    networks: 
      - backend

  # 4. PHP-FPM Web 
  ## AI Provided feedback: I’d specified container_name as the image, and 
  ## it fixed the build by suggesting Dockerfile path change from ../Dockerfile to 
  ## Dockerfile and passing as args the PHP_VERSION with default 8.4
  app: 
    image: cloudshop-php:local # Originally php-fpm:$PHP_VERSION, AI said the cloudshop is not the container name, rather the image name 
    build: 
      context: . 
      dockerfile: Dockerfile
      args:
        PHP_VERSION: ${PHP_VERSION}

    # I had completely forgot to attempt the mounts, AI suggested the lines for mounting format source : container destination : access permissions for public and src 
    volumes: 
      - ./app/public:/var/www/html/public:ro
      - ./app/src:/var/www/html/src:ro
    # I had originally just put redis basic info, AI specified that I also had to link
    # the DB variables; cool thing I didn’t notice is host points to mariadb
    environment: 
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_QUEUE=${REDIS_QUEUE}
    # ChatGPT suggestion to add the depends_on db as well, seeing as I had originally only defined redis
    depends_on: 
      db: 
        condition: service_healthy
      redis: 
        condition: service_healthy
    networks:
      - frontend
      - backend

  # 5. PHP worker
  worker: 
    image: cloudshop-php:local
    # Originally I just had redis, AI tool told me I also had to write results to MariaDB
    environment: 
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
      - REDIS_QUEUE=${REDIS_QUEUE}
    # I had just originally failed mounts, AI suggested correct structure for src and worker
    volumes: 
      - ./app/src:/var/www/html/src:ro
      - ./app/worker:/var/www/html/worker:ro
    # ChatGPT also suggested in its feedback that I include db being healthy as required
    depends_on: 
      db: 
        condition: service_healthy
      redis: 
        condition: service_healthy
    command: php /var/www/html/worker/worker.php 
    networks:
      - backend

  # 6. Nginx  
  nginx: 
    image: nginx:1.30-alpine
    # AI assisted with target mapping for nginx and app/public
    volumes: 
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./app/public:/var/www/html/public:ro
    ports: 
      - "${APP_PORT}:80"
    # AI suggestion to “consider making Nginx depend on a healthy app, because it forwards PHP requests to PHP-FPM” 
    depends_on: 
      app: 
        condition: service_healthy
    # I used AI to debug the healthcheck because nginx was unhealthy when I used the assignment-specified localhost, 
    # the prompts are found under README.md Prompts: nginx checking, resulted in change from localhost to 127.0.0.1 in Dockerfile
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/health.php"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: always
    networks: 
      - frontend

  # 7. phpMyAdmin 
  pma: 
    image: phpmyadmin:5.2.3
    # Connection for pma:maria db, suggested addition from AI to map pma to db, I had struggled to understand how ports worked and had originally
    # just set ports as ${PMA_PORT}:${PMA_PORT} without env configurations, so it explained that I needed to add env and pass MariaDB base information
    # so that the container knew where to look for the database info by connecting 3306 db to interior pma port
    environment: 
      - PMA_PORT=${DB_PORT}
      - PMA_HOST=${DB_HOST} 
    ports: 
      - "${PMA_PORT}:80"
    depends_on: 
      db: 
        condition: service_healthy
    restart: always
    networks:
      - backend

# Data persistance 
volumes: 
  mariadb_data: 
    driver: local 
  redis_data: 
    driver: local


# 1. Define  networks 
networks: 
  frontend:
    driver: bridge
  backend:
    driver: bridge



I do not know or like php, I would rather do either basic base ugly html or react. Someone inthe class asked whether they could reuse the starter application, and they said they were "I'm thinking of building on that application and adding the required features, such as microservices, Docker Swarm, scalability, load balancing, and rollout/rollback. the cca1 repository also includes starter PHP application code (such as index.php and order.php). Would we be allowed to reuse that existing application as the base and extend it with the additional Type I requirements, provided the cloud deployment and additional implementation are our own work?"

The prof said "Hi, cca1 only contains dockerfile and docker-compose.yml file, if this is the application that you mentioned then yes, you can use it. as long as the dockerfile and docker-compose.yml file are your work then this won't affect the marks for originality and innovation. Yes, you can use those files"

I also had anotherp orject for a jupyter notebook that had a data folder with csv of the data, a provided folder with distributed_runtime.py, base FAISS.ipynb notebok we had to work on and also some commands.sh, kubernetes.yaml where this is what I did for kubernetes.yml:
# INFS3208 A2 
# Do not rename Kubernetes objects, labels, ports, or volume names.

# -----------------------------------------------------------------------------
# 1. Shared FAISS configuration
# -----------------------------------------------------------------------------
apiVersion: v1
kind: ConfigMap
metadata:
  name: faiss-config
# 1. Config shared FAISS, will use in pt 3 to consume it
data: 
  FAISS_MAX_SHARDS: "3"
  FAISS_SERVICE: "faiss-headless"
  FAISS_PORT: "8000"
  DEFAULT_TOP_K: "5"


---
# -----------------------------------------------------------------------------
# 2. Headless Service for stable FAISS shard network identities
# -----------------------------------------------------------------------------
apiVersion: v1
kind: Service
metadata:
  name: faiss-headless
# 2. Deploy FAISS headless
spec:
  # Critical it's None to set it as headless, aka doesn't allocate cluster IP and exposes pod thru own DNS record so apps comm w pods directly and bypass load balancing, useful stte apps, distributed dbs, etc. 
  clusterIP: None
  # Ensures service targets pods that are labelled as app
  selector: 
    app: faiss-shard # AI suggested correction, I found my-app in documentation
  # Map service port to target 
  ports: 
  - port: 8000 # AI correction, it exposes instead 8000:8000
    targetPort: 8000 # Expose internal shard port, AI suggest correction because I'd done ${FAISS_PORT} but can't use yaml as vars


---
# -----------------------------------------------------------------------------
# 3. FAISS shard StatefulSet
# Use the following image for the StatefulSet: 
# australia-southeast1-docker.pkg.dev/infs3208-429801/infs3208-a2/faiss-shard:2026-a2
# -----------------------------------------------------------------------------
# Used to make stateful app and distributed sys
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: faiss-shard
spec:
  serviceName: "faiss-headless" 
  replicas: 3 # For faiss-shard-0, faiss-shard-1, and faiss-shard-2
  selector: 
    matchLabels: 
      app: faiss-shard
  # AI correction, missed template info 
  template: 
    metadata: 
      labels: 
        app: faiss-shard

    # Now for the shard configs from images, AI correction must be nested within template
    spec: 
      # Adding from AI suggestion to attempt fix jupyter notebook
      securityContext:
        fsGroup: 1000
        
      containers:
      - name: faiss-shard
        # Using img from course instructs
        image: ackesnalxu/infs3208-faiss-shard:2026-a2# australia-southeast1-docker.pkg.dev/infs3208-429801/infs3208-a2/faiss-shard:2026-a2
        ports: 
          - containerPort: 8000 # AI corrected, I put 80 cause I thought it was internal 80 but it's the FAISS Port instead oops!
        # Uses the config from pt 1 to create env vars for container
        envFrom: 
          - configMapRef: 
              name: faiss-config
        # Configure volume mounts at /data 
        volumeMounts: 
          - name: faiss-data
            mountPath: /data # AI suggestion was to add the extra two spaces for indentation, I had forgotten them and it was level with the dash
  # From documentation at height of template
  volumeClaimTemplates: 
    - metadata: 
        name: faiss-data
      spec:
        accessModes:
          - ReadWriteOnce # To make data persistent
        resources:
          requests:
            storage: 1Gi # Storage per shard 

---
# -----------------------------------------------------------------------------
# 4. PROVIDED Jupyter workspace PVC
# Do not modify this object. It protects notebook changes if the Jupyter Pod is
# recreated while you are working.
# -----------------------------------------------------------------------------
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jupyter-workspace
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi

---
# -----------------------------------------------------------------------------
# 5. Jupyter Notebook Deployment
# Use the following image for the Deployment: 
# australia-southeast1-docker.pkg.dev/infs3208-429801/infs3208-a2/jupyter:2026-a2
# -----------------------------------------------------------------------------
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jupyter
spec: 
  replicas: 1 # Line suggested by AI upon asking for feedback

  # Selector and template suggested by AI, I had not included it 
  selector:
    matchLabels: 
      app: jupyter

  template: 
    metadata: 
      labels: 
        app: jupyter
    # Now from here is work that I had done nested into the template that I had not considered
    spec: 
      # Added upon AI suggestion for issue w the joyce mounting
      securityContext: 
        fsGroup: 1000

      containers: 
        - name: jupyter
          image: ackesnalxu/infs3208-jupyter:2026-a2# australia-southeast1-docker.pkg.dev/infs3208-429801/infs3208-a2/jupyter:2026-a2
          ports: 
            - containerPort: 8888
          envFrom: 
            - configMapRef: 
                name: faiss-config
            # AI correction, I'd done secret: secretName w jupyter-secret and a key and path to the setup file, but apparetnly secret already applied to cluster upon exec so I don't need to provide the path
            - secretRef: 
                name: jupyter-secret
          # Mounting on the volume 
          volumeMounts: 
            - name: jupyter-workspace
              mountPath: /home/jovyan/work
      # To use the PVC
      volumes: 
        - name: jupyter-workspace
          persistentVolumeClaim: 
            claimName: jupyter-workspace # This is the one that matters 

---
# -----------------------------------------------------------------------------
# 6. Public Jupyter Service
# -----------------------------------------------------------------------------
apiVersion: v1
kind: Service
metadata:
  name: jupyter-service
# Async creation of LB
spec: 
  # Using from part 5 name
  selector: 
    app: jupyter
  ports: 
    - protocol: TCP 
      port: 8080 # Externally exposes port I think, AI suggested change from containerPort to port and removing a leading -
      targetPort: 8888 # Fowards traffic to jupyter port
  type: LoadBalancer

So anyway, important distinction is I can base myself off from previous work, I need to understand it though. I want to build the simplest form of my web app possible, just having the simple user logins, databases, and the microservice stuff. not sure if i can do it all within one github file and just wirte the docker files cause idk if that will actually meet the rubric criteria saying "Microservice architecture and containerization: Decouple
functionalities into microservices and run these microservices in
individual containers." 

So idk if i have to do one microservice container for login/logout, one for account creation (but I guess login stuff will be related same table schema), one for data posting when making report, one for data fetching to get the road reports in main website display. Pretty much, I know i can make a website in react easily enough, I dont know how to even deploy the containers or decouple the microservices in individual containers. i dont know if all of my previous work has just been one same container beignrun or if i have accidentally already created more than one container in one dockerfile/yaml

### Base for Flask
### Gemini: Base prompt for stack setup recommendation
"react with maria db and flask api monorepo"

#### Application
Got sample output of base for Flask  
```python
# backend/requirements.txt
# flask
# flask-sqlalchemy
# pymysql
# flask-cors

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Allows React frontend to communicate with Flask

    # MariaDB connection string format: mysql+pymysql://user:password@host:port/db_name
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 
        'mysql+pymysql://root:password@localhost:3306/mydb'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        from . import routes
        db.create_all()  # Creates tables if they don't exist

    return app

```

Sample output base for connectivity to App
```
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Points to the Flask local development server
    fetch('http://localhost:5000/api/data')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h1>Items from MariaDB via Flask</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

Base docker compose 
```yaml
version: '3.8'

services:
  # Database Service (MariaDB)
  db:
    image: mariadb:latest
    container_name: mariadb_db
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: rootpassword
      MARIADB_DATABASE: mydb
      MARIADB_USER: user
      MARIADB_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Backend Service (Flask)
  backend:
    build: ./backend
    container_name: flask_backend
    restart: always
    environment:
      - DATABASE_URL=mysql+pymysql://user:password@db:3306/mydb
      - FLASK_ENV=development
    ports:
      - "5000:5000"
    depends_on:
      - db

  # Frontend Service (React)
  frontend:
    build: ./frontend
    container_name: react_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USECHOKING=true
    depends_on:
      - backend

volumes:
  db_data:
```


Nvm I am using Chat instead for basic flask setup, run these from project root
```bash
source backend/.venv/bin/activate
cd backend/api-accounts
python -m flask --app app run --debug --port 5001
```
http://127.0.0.1:5001/api/accounts/health

For the records
```bash
source backend/.venv/bin/activate
cd backend/api-records
python -m flask --app app run --debug --port 5002
```

It also helped implement sessions with command ```bash python3 -c "import secrets; print(secrets.token_hex(32))"```

# Sources
https://blog.miguelgrinberg.com/post/how-to-dockerize-a-react-flask-project Dockerizing a Flask + React project 
https://github.com/docker/awesome-compose/tree/master/nginx-flask-mysql Docker documentation sample nginx-flask-mysql
https://stackoverflow.com/questions/75959625/flask-docker-health-check Dockerfile health check
https://github.com/bahachammakhi/docker-react-nginx-blog Dockerfile for nginx
https://www.docker.com/blog/how-to-dockerize-react-app/ Dockerize a react app from the docker blog
https://docs.docker.com/guides/reactjs/ More react for nodejs
[ a lot of it to get the cloud clusters up and running ]
https://stackoverflow.com/questions/77764974/how-do-i-deploy-and-run-an-applications-on-k8s Kubernetes on react
https://medium.com/@cldop.com/deploying-a-two-tier-application-with-flask-reactjs-and-postgresql-on-a-local-kubernetes-cluster-8f0afad8612b 
https://amlanscloud.com/reactappdeploy/ Kubernetes, useful diagram of architecture
https://kubernetes.io/docs/concepts/workloads/controllers/statefulset Stateful set
https://chamszamouri.medium.com/why-stateful-applications-in-k8s-need-a-headless-service-20d3db993872 Stateful set vs headless

Now moving onto the sub-points like liveness, readiness, and startup
https://kubernetes.io/docs/concepts/workloads/pods/probes/ Probes to help verify reliability, scalability and rollout/rollback
https://discuss.kubernetes.io/t/how-to-enable-binlog-for-1-pod-in-galera-mariadb-statefulset/3209 readiness probe for mariadb 
https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/using-healthcheck-sh Investigating healtcheck, says the healthcheck.sh script is part of official images and part of image mariaDB server
https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ Deployment and updates theory
https://www.youtube.com/watch?v=78s-fW-zv6E Example in yaml

Website itself
https://tutorial101.blogspot.com/2023/04/react-and-python-flask-login-register.html Login 
https://www.geeksforgeeks.org/python/how-to-add-authentication-to-your-app-with-flask-login/ Login
https://stackoverflow.com/questions/77868617/state-management-of-multiple-buttons Button families
https://stackoverflow.com/questions/40575501/how-do-i-properly-get-the-date-and-time Time
https://tailwindcss.com/docs/table-layout tables

https://bytebytego.com/guides/what-does-a-typical-microservice-architecture-look-like/ Diagram
https://www.geeksforgeeks.org/system-design/microservices/ Diagram 