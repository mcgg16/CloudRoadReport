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

## Brainstorming Prompts
The section below will include key prompts and their applications throughout the project. 

### Initial brainstorming
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

And it recommended using just two backend services of api/auth and api/reports. Note it suggested using PostgreSQL, I opted for MariaDB. It is worth mentioning the idea is entirely my own, I am a cyclist and have struggled to ride in Brisbane because I struggle to know when it will rain; back home, my dad has a whatsapp chat where riders compare conditions, so this is a way to facilitate that information sharing.

### Container base 
Honestly, I am really confused now.... For task 1, I aws given a github file that had the app folder with public src worker and a composer.json with a basic name of the class descritpion type project using just php and and optimize autoloader and such. A folder database with an init.sql just CREATE TABLE commands and insert products. An nginx folder with a default.conf that just had a server listening on port 80, location try_files $uri $uri/ /index.php?$query_string;... so i guess this was just their nginx. 

The website was just simple php, and I wrote the following docker file: 
```
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
```

Then, I wrote a docker-compose.yml:
```yaml
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
```

I do not know or like php, I would rather do either basic base ugly html or react. Someone inthe class asked whether they could reuse the starter application, and they said they were "I'm thinking of building on that application and adding the required features, such as microservices, Docker Swarm, scalability, load balancing, and rollout/rollback. the cca1 repository also includes starter PHP application code (such as index.php and order.php). Would we be allowed to reuse that existing application as the base and extend it with the additional Type I requirements, provided the cloud deployment and additional implementation are our own work?"

The prof said "Hi, cca1 only contains dockerfile and docker-compose.yml file, if this is the application that you mentioned then yes, you can use it. as long as the dockerfile and docker-compose.yml file are your work then this won't affect the marks for originality and innovation. Yes, you can use those files"

I also had anotherp orject for a jupyter notebook that had a data folder with csv of the data, a provided folder with distributed_runtime.py, base FAISS.ipynb notebok we had to work on and also some commands.sh, kubernetes.yaml where this is what I did for kubernetes.yml:
```yaml
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
```

So anyway, important distinction is I can base myself off from previous work, I need to understand it though. I want to build the simplest form of my web app possible, just having the simple user logins, databases, and the microservice stuff. not sure if i can do it all within one github file and just wirte the docker files cause idk if that will actually meet the rubric criteria saying "Microservice architecture and containerization: Decouple
functionalities into microservices and run these microservices in
individual containers." 

So idk if i have to do one microservice container for login/logout, one for account creation (but I guess login stuff will be related same table schema), one for data posting when making report, one for data fetching to get the road reports in main website display. Pretty much, I know i can make a website in react easily enough, I dont know how to even deploy the containers or decouple the microservices in individual containers. i dont know if all of my previous work has just been one same container beignrun or if i have accidentally already created more than one container in one dockerfile/yaml

#### Application
Tool corrected that I was already running many containers in both assignments, and it suggested a simple React project with two Flask APIs and one database because I was trying to decouple the services too much in my prompt. It also corrected a key logic error that two build stages does not mean two running application contaienrs, rather the compose file is the one decoupling the containers and explained what that looked like for a previous assignment I had done. This was mostly useful just to try to understand the setup and choose my technology task for this project. It also hel'ed me structure the files, where the key correction is that I divided the accounts and reports as api-accounts and api-repots folders, docker-compose.yaml and I put the kubernetes file in a k8s folder for the table suggestion it generated: 
| Location | Contents |
|---|---|
| `frontend/` | React website, frontend Dockerfile, Nginx configuration |
| `accounts/` | Account Flask application, dependencies, Dockerfile |
| `reports/` | Reports Flask application, dependencies, Dockerfile |
| `database/init.sql` | Tables and sample records |
| `compose.yaml` | Defines how the four components run together locally |
| `kubernetes.yaml` | Defines their cloud deployment and networking |

### Brainstorming for project 
quikc style question, should i make it so that i show like South bank and then below like an sql function that checks reports within a time period differentiating conflicting reports...&#x20;

or idk if maybe i can even have the person indicate like "Rideable" and a column in the table indicating the total counts as like yeah you can still ride or too wet based on their opinion.

\* Damp: reported by 10 within last 10 minutes&#x20;

\* Wet: reported by 5 within last 10 minutes&#x20;

\---- here it uses the last 10 min reprots + whatever was reported within last hour&#x20;

\* Damp: reported by 20 within last hour

- Wet: reported by 5 within last hour

---

- Dry: reported by&#x20;

Or idk, just make a table where row is time ago and then each cell is the number of reports, maybe adding rideable column.&#x20;

| Time period | Dry | Damp | Wet | Standing water |

Last 10 minutes | 0 | 10 | 5 | 0 |

Last hour | 0 | 0 20 | 5 | 0 |

So based on this, ppl can see and maybe say ok its leaning towards damp.&#x20;

But then wet and standingwater indicate a nah can't ride.&#x20;

I guess I could just do within last 10 mins, last hour, last 12 hours and more than that undetermined. its cause maybe as a rider if road is damp or wet, i can go ride in flat like south bank loop around the river.  if its damp, wet, or standing water i cant go to mt coot tha. its possible it rains overnight and main roads are dry, but mt coot tha is still wet because there is more tree cover there, but maybe routs alng the north bikeway are flatter and drier so a damp road is more acceptable–even with a few m of elevation difference- than it is to go to mt coot tha...

#### Application
It suggested I use my proposed table setup itself, which was useful just for idea specification and the hand-drawn wireframes I made.

## Database Feedback prompts
### Initial database suggestions
Okay so I already made all of the base layout pages that I set out in app and added a navbar component to show up on app layout, and a basic simple login and register page with just front end. I have the schema I want for my database, and I think I want now your help to revise it and general thoughts. i used the format my prof provided, so i think i'd like to use mariadb as well lol: 
```sql
CREATE TABLE IF NOT EXISTS regions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conditions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    user_id INT UNSIGNED NOT NULL,
    condition_id INT UNSIGNED NOT NULL,
    region_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id), 
    CONSTRAINT fk_condition FOREIGN KEY (condition_id) REFERENCES conditions(id), 
    CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES regions(id), 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO regions (id, name) VALUES 
    (1, 'South Bank'), 
    (2, 'Kangaroo Point'),
    (3, 'Toowong'),
    (4, 'Mount Coot-tha')
    (5, 'Kenmore Hills'),
    (6, 'Mount Gravatt'),
    (7, 'Upper Mount Gravatt'),
    (8, 'Burbank'),
    (9, 'Wynnum'),
    (10, 'Enoggera'),
    (11, 'Nudgee'), 
    (12, 'Boondall'),
    (13, 'Shorncliffe');
```

#### Application
It let me know I had syntax errors with trailing commas after fk_region, missed one separating Mt. Coot-tha, suggested I make usernames unique to avoid collisions, add a separate submission and observation fields, and suggested the initial conditions that I had forgotten to include in my script using the previous categories I had described: 
```sql
INSERT INTO conditions (id, name, description) VALUES
    (1, 'Dry', 'No visible surface moisture'),
    (2, 'Damp', 'Surface is moist with little visible water'),
    (3, 'Wet', 'Visible water across the surface'),
    (4, 'Standing water', 'Puddles or accumulated water');
```

## Base for Flask
### Setting up Flask project
Okay, so I do not know how to create a monorepo flask api thing. Ive created a folder called backend with a requirements folder,  I ran "pip install Flask" and then in the requirements.txt wrote Flask==3.1.2. I created an api-accounts folder and an api-records folder, and i know i need to create the app with from flask import Flask, somehow ocnfigure the connection as well and then use it. but idk, since i dont know how to use microservices idk if its supposed to be technically two different apis in my same container, should i init both of them seperately...? I think i need it so that if login is down, then the other one can still fetch the suburb reports. but i am not sure if i should create an env file, how i would confiugre the secrets, and stuff like that so i dont even know how to set up the connection. my professor for the first project just gave us a predefined env as such: 
```python
APP_PORT=8080
PMA_PORT=8082
PHP_VERSION=8.4

DB_HOST=db
DB_PORT=3306
DB_NAME=cloud_computing
DB_USER=php
DB_PASSWORD=php_dev_password
DB_ROOT_PASSWORD=change_this_root_password

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_QUEUE=orders
```

So i dont know what to do like how to structure the API, and base starter code for flask would be greatly appreciated

#### Application
In previous units, I had been provided a starter Flask code but I did not know how well it aligned with the scope of this project, and I wanted to save time with help setting up the flask configuration because that was not a critical aspect of our evaluation, merely a stepping stone to base my future work. This helped me to specify I should add a requirements.txt, install depenencies in the venv with 
```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
```

And specify the requirements with 
```
Flask==3.1.2
PyMySQL
python-dotenv
```

Then, I shoul dinstall the requirements with ```python -m pip install -r backend/requirements.txt```, create an .env file that I created at root instead of in the suggested backend, and generate an .env.example.
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cloud_road_report
DB_USER=road_app
DB_PASSWORD=replace_with_your_local_db_password
```

It also provided the base code for the connection for the database with 
```python
import os
from pathlib import Path

import pymysql
from dotenv import load_dotenv

# Both service folders have backend/ as their parent.
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


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
```
Which I read and modified to instead provide the env at root instead of at the current directory. It also provided a base configuration for the accounts api health check: 
```python
from flask import Flask

app = Flask(__name__)


@app.get("/api/accounts/health")
def health():
    return {
        "service": "accounts",
        "status": "running",
    }
```
And for records a base health check and an example of a get for the region names that I did not ask for, but I did use this previuos version to understand how to structure GET endpoints; note this was heavily modified later on to return actual information, but this was useful just to test connection of frontend with API with database
```python
import pymysql
from flask import Flask, jsonify

from db import get_connection

app = Flask(__name__)


@app.get("/api/records/health")
def health():
    return {
        "service": "records",
        "status": "running",
    }


@app.get("/api/records/regions")
def get_regions():
    try:
        connection = get_connection()

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, name FROM regions ORDER BY name"
                )
                regions = cursor.fetchall()
        finally:
            connection.close()

        return jsonify(regions)

    except pymysql.MySQLError:
        app.logger.exception("Could not retrieve regions")
        return {"error": "Database temporarily unavailable"}, 503
```

For base testing, it suggested commands to run it, which is how I did initial development before my Dockerfiles: 
```
source backend/.venv/bin/activate
cd backend/api-accounts
python -m flask --app app run --debug --port 5001
```

```
source backend/.venv/bin/activate
cd backend/api-records
python -m flask --app app run --debug --port 5002
```

### Dockerfile corrections
Ok wait don't i need to write a dockerfile as well? I created here a base for the dockerfile and docker-compose, idk if instead of testing it in the docker desktop it might be better if i start working through to deploy it on GCE... but I do need it to run locally as well cause I need to test the development on my machine cuase it's easier ot develop in vscode than in vim.&#x20;



I currently have CloudReport as my base, i know i hve to serve server {\
&#x20;   listen       80;\
&#x20;   server_name  localhost;\
&#x20;   location / {\
&#x20;       proxy_pass   http\://backend:8000;\
&#x20;   }\
\
}



Somewhereor smth along those lines idk i found an example repo and kinda remixed a lot of stuff together, but i need help to like actually map ports and get the files to work...the file i am copying has nginx-flask-mysql/proxy/conf with that file, and their dockerfile is just&#x20;

FROM nginx:1.13-alpine\
COPY conf /etc/nginx/conf.d/default.conf



Not sure if i can make my project just use a multistage build or if i am supposed to have many different dockerfiles for each service. My requirements.txt just has Flask==3.1.2\
PyMySQL\
python-dotenv.&#x20;



From what I see, MariaDB is supposed to work natively with Flask so I have commented out al stuff related to it so I just commented all of it out. First lets get thedockerfile working no? Then we can move onto the compose?&#x20;


```
# syntax=docker/dockerfile:1

# Backend with Python
FROM python:3.13.5-alpine AS builder

WORKDIR /CloudRoadReport
# Install requirements to api-accounts and api-reports passing the env files that are in root to backend files
COPY backend/requirements.txt backend/api-accounts/app.py .env .
COPY backend/requirements.txt backend/api-reports/app.py .env .
RUN pip install -r ./requirements.txt
# Idk what the difference between production and development is
ENV FLASK_ENV development

# Extensions for MariaDB, I had done base with php-ext for mysqli, pdo_mysql, pecl igbinary  
#RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
#&& docker-php-ext-install mysqli pdo_mysql \
#&& pecl install igbinary redis \
#&& docker-php-ext-enable igbinary redis \
#&& rm -rf /tmp/pear \
#&& apk del .build-deps
#WORKDIR /var/www/html
# AI suggestion so line corrected from # /var/www/html/vendor because I had not included the --from=builder was missing so that rendered the multi-stage
# approach practically useless, and it also identified that I had to copy the /app/vendor to the current working directory vendor
#COPY --from=builder /app/vendor  ./vendor 

# nginx to serve React
FROM nginx:1.30-alpine
# No idea how to even configure it
COPY conf /etc/nginx/conf.d/default.conf 

EXPOSE 5000
CMD ["flask", "run"]

# Healthcheck 
HEALTHCHECK --start-period=10s --interval=30s --timeout=5s --retries=3 \
    CMD curl --fail http://localhost:5000/health || exit 1
```

#### Application
Fixed the Dockerfile wth suggestions, it letme know I was mixing up frontend and backend that should be decoupled. It suggested a base backend file taht I modified to keep only what was necessary, so I had read about gunicorn but I just left it at a more basic version of this code with what I understood, and added gunicorn to backend. 
```# syntax=docker/dockerfile:1

FROM python:3.13-slim

# Select which API this image will contain.
ARG API_SERVICE=api-reports

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install dependencies before copying application code.
COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --no-cache-dir \
    -r /app/backend/requirements.txt

# Preserve your directory structure so db.py's path logic still works.
WORKDIR /app/backend/${API_SERVICE}

# Copy only the selected API, including app.py and db.py.
COPY backend/${API_SERVICE}/ ./

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
```

It also suggested a root .dockerignore that I did add with the .git, .env, python configurations, nodemodules and dist files. 
The main correction was that I was supposed to be running the backend Dockerfile first instead of mixing both weirdly. It also helped with commands to build and test it locally.

## Basic Frontend Architecture and Nginx
### Basic API to home connection
Vite
```
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

I have a pages file Home where I want to fetch from there all of the regions as a json list with their respective counts, and then a RegionCard.tsx that contains the name of the region and later on I'll link it to the ocmponent RegionTable, but I want to make the query step by step first so that first I just get the RegionCard. I dont really remember how i should work w lists or props, like I know I wil have to recieve the full list because i get this from the endpoint but to then extract individual regions and their reports sounds complicated...&#x20;



Sample:&#x20;

[\
&#x20; {\
&#x20;   "id": 1,\
&#x20;   "name": "South Bank"\
&#x20; },\
&#x20; {\
&#x20;   "id": 2,\
&#x20;   "name": "Kangaroo Point"\
&#x20; }

]



I have build in src another folder Types so I have types, components and pages all within my frontend folder.&#x20;

import RegionCard from '../components/RegionCard.tsx';\
import RegionListProp from  '../types/types.tsx'\
\
function Home() {\
\
&#x20; return (\
&#x20;   \<div className="p-6 px-2">\
&#x20;     \<h1 className="text-2xl font-bold bg-blue">Road Report\</h1>\
&#x20;     \<h2>Find out what the road conditions are like in Brisbane to plan your morning ride!\</h2>\
&#x20;     {/\* Iterate over it to pass the region cards, one row is one region card so it autogenerates them \*/}\
&#x20;     \<RegionCard>\</RegionCard>\
&#x20;   \</div>\
&#x20; )\
}\
\
export default Home



import RegionProp from '../types/types.tsx'\
\
function RegionCard( {id, name}: RegionProp ) {\
&#x20;   return (\
&#x20;       \<div>\
&#x20;           \<h1 className="xl">{id}. {name}\</h1>\
&#x20;       \</div>\
&#x20;   )\
}\
\
export default RegionCard;



types/types.tsx

export default type RegionListProp = {\
&#x20;   id: number;\
&#x20;   name: string;  \
}\
\
export default type RegionProp = {\
&#x20;   id: number;\
&#x20;   name: string;  \
}

#### Application
I do not know how to connect a monorepo to the API, since I learned React with supabase and we just called external RPCs. The output helped me configure the proxy with the api ports to match the API containers so that Nginx could later forward the containers, so I added the following to vite.config.ts

```
server: {
    proxy: {
      '/api/reports': {
        target: 'http://127.0.0.1:5002',
      },
      '/api/accounts': {
        target: 'http://127.0.0.1:5001',
      },
    },
}
```

It also suggested renaming the types folder to types.ts, and it corrected the region props extraction that whould be defined with ```function RegionCard({ id, name }: Region) ```. It also provided the key useEffect funtion that I used in future parts of the assingment to understand how to make requests to the API endpoints and mapping the outputs. 
```
import { useEffect, useState } from 'react';
import RegionCard from '../components/RegionCard';
import type { Region } from '../types/types';

function Home() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadRegions() {
      try {
        const response = await fetch('/api/reports/regions');

        if (!response.ok) {
          throw new Error(`Could not load regions (${response.status})`);
        }

        const data: Region[] = await response.json();

        if (!ignore) {
          setRegions(data);
        }
      } catch (error) {
        if (!ignore) {
          setError(
            error instanceof Error
              ? error.message
              : 'Could not load regions'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="p-6 px-2">
      <h1 className="text-2xl font-bold">Road Report</h1>

      <h2>
        Find out what the road conditions are like in Brisbane
        to plan your morning ride!
      </h2>

      {loading && <p>Loading regions...</p>}
      {error && <p role="alert">{error}</p>}

      {regions.map((region) => (
        <RegionCard
          key={region.id}
          id={region.id}
          name={region.name}
        />
      ))}
    </div>
  );
}

export default Home;
```

### Nginx
Thank you, I love you. It worked. Now here is my attempt to configure nginx and the react in the dockerfile. I am lost, i used a few repos as inspo but i don't know what approach to take, i am scared.&#x20;



Here is my measly attempt&#x20;
```
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
```

#### Application
It let me know I was combining Vite development and serving with Nginx, it told me I should use a node to build react and nginx to serve the frontend, and it provided key suggestions to fix my Dockerfile. I would like to mention I did use sources first to write my Dockerfile attempt and then corrected with AI suggestions
```
# syntax=docker/dockerfile:1

# Stage 1: build React
FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

# Stage 2: serve the generated files
FROM nginx:1.30-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

It also specified I should make a base nginx.conf that I had neglected: 
```
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location /api/accounts/ {
        proxy_pass http://accounts:8000;
    }

    location /api/reports/ {
        proxy_pass http://reports:8000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Base GKE deployment
### Guidance of how to start working on GitHub or Kubernetes
Okay, so... it's sunday now. i need your help w the brainstorm of what i have to do. I install gcloud on my machine, and then i have to navigate away from the vm to the gcloud containers clusters create road-report-cluster --zone=\_\_ --num-nodes=3, then get the cluster credentials... i am seeing that kubernetes cannot build images from local dockerfile directly and needs to pull them, so idk if i can just pull from github the same project or if i have to demonstrate it works solely from my main vm, or if from my vm i can initiate the kubernetes as well. Then configure docker authentication for gcp with gcloud auth configure-docker us-central1-docker.pkg.dev, build my image with docker and push to the repo or something? and then convert or write thee kubernetes manifsts, like a k8s folder for the backend and for the frontend (maybe also for database?) do not proivde the answers for the work though please, i want to just see what i am supposed to do or what direction to take, what to resaerch. and then idk if just run kubectl to deploy to gke.



I had previously worked on a kubernetes file, but we were given a data folder, and then in root a FAISS.ipynb, a commands.sh, and a setup_kupyter_secret.sh.&#x20;



Here is the base kubernetes file I had written
```
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
```

And here is the commands.sh
```
# Task 1: Deploy/update all Kubernetes objects in kubernetes.yaml.
# YOUR COMMAND:
kubectl apply -f kubernetes.yaml

# Task 2: Display the Pods and StatefulSets so you can verify the
# Jupyter Pod and all FAISS shard replicas.
# YOUR COMMAND(S):
# Note, AI correction I had kubectl get pods --watch -l app=jupyter, changed to only get pods
kubectl get pods
kubectl get statefulset

# Task 3: Display PersistentVolumeClaims and show detailed
# information for the faiss-shard StatefulSet.
# YOUR COMMAND(S): 
# Note, I had written kubectl describe pvc jupyter-workspace, statefulset faiss-shard, prompted to AI I was unsure whether to describe both of them so it suggested get pvc and then describe the sts faiss-shard
kubectl get pvc
kubectl describe statefulset faiss-shard
```

#### Application
It suggested I separate GitHub from the image registry, and that I shoudl read through the documentation for the following: "Research creating a Docker-format Artifact Registry repository, authenticating Docker, tagging images with registry paths, and pushing them. Authentication alone does not create the repository. The hostname must match your chosen registry location; us-central1 is an example, not a requirement." It also told me to translatee comose into kubernetes objects with the following structure: 

| Your application needs | Kubernetes concept to research |
|---|---|
| Run frontend, accounts, reports | **Deployment** for each |
| Stable internal addresses between components | **ClusterIP Services** |
| Public entry point for the frontend | **LoadBalancer Service** |
| Database settings without passwords | **ConfigMap** |
| Database passwords | **Secret** |
| One MariaDB instance with persistent storage | **StatefulSet + PersistentVolumeClaim** |
| Initialise database tables and sample regions | Mount your small SQL script through a **ConfigMap** |
| Route traffic only to ready application instances | **Readiness probes** |
| Spread application replicas across machines | **Topology spread constraints or pod anti-affinity** |

It also told me I needed database manifests with PVC, with one database replica. 

### Basic image setup
Erm issue... $ gcloud services enable artifactregistry.googleapis.com \
  --project=project-5472a16f-e6cd-4347-b79
supermoniguz@instance-2:~$ gcloud artifacts repositories list \
  --location=australia-southeast2 \
  --project=project-5472a16f-e6cd-4347-b79
Listing items under project project-5472a16f-e6cd-4347-b79, location australia-southeast2.

Listed 0 items.
supermoniguz@instance-2:~$ gcloud artifacts repositories list
Listing items under project project-5472a16f-e6cd-4347-b79, across all locations.

Listed 0 items.
supermoniguz@instance-2:~$ 

Im creating the image repository

Hm since i got this update: 
supermoniguz@instance-2:~$ gcloud auth configure-docker australia-southeast2-docker.pkg.dev
Adding credentials for: australia-southeast2-docker.pkg.dev
After update, the following will be written to your Docker config file located at [/home/supermoniguz/.docker/config.json]:
 {
  "credHelpers": {
    "australia-southeast2-docker.pkg.dev": "gcloud"
  }
}

Do you want to continue (Y/n)?  y

Docker configuration file updated.

Should i update any code in my config.json, or is it just updating the app image itself without necessairly touching my source code? 

--
I made the tags a bit messed up, but the pushes worked now:
not a valid repository/tag: invalid reference format
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-accounts:local australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v1
"
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports:v1"
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/f^C1"
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v1"
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-reports:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports:v1"
supermoniguz@instance-2:~/CloudRoadReport$ docker tag cloudroad-frontend:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend:v1"
supermoniguz@instance-2:~/CloudRoadReport$ docker push "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v1"

gcloud artifacts docker images list australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report --include-tags
Listing items under project project-5472a16f-e6cd-4347-b79, location australia-southeast2, repository road-report.

IMAGE                                                                                    DIGEST                                                                   TAGS  CREATE_TIME          UPDATE_TIME          SIZE
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts  sha256:0389980d461298140f737768a813c926deb0bb8f02539647dd0aed50874abf93        2026-10-18T09:53:22  2026-10-18T09:53:22  1543
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts  sha256:37ecebc3d9bdf0b30343dc5ff3e81979ddcbba6b9a051459e8f4e816ef8dab2f  v1    2026-10-18T09:53:22  2026-10-18T09:53:22  None
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts  sha256:ecc30bedb067494ec6559edbdf1da0c6a6fd162131595bf686249918765b3591        2026-10-18T09:53:22  2026-10-18T09:53:22  48923300
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend  sha256:30e810d9511a0d1bcac86dcf4ad08a0614f9f85899451eac7fc215b45e6dfb11  v1    2026-10-18T09:54:38  2026-10-18T09:54:38  None
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend  sha256:5e4dac1fab524f611bf9a649321d60df41cf82ac8086e8ede1046628919da6ac        2026-10-18T09:54:38  2026-10-18T09:54:38  1691
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend  sha256:b3714a7acde8842f2aee7e145768b690dd60bda87df5eebb87bac968b6c6526a        2026-10-18T09:54:38  2026-10-18T09:54:38  7987133
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports   sha256:34e34808668e79b92b8b90bbec9efbb7fb0aa37839d7e2564680ed3363c41d2e  v1    2026-10-18T09:54:15  2026-10-18T09:54:15  None
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports   sha256:60fea69a5cda52135445674291387695ffd960b907b3819f365554f65da638c5        2026-10-18T09:54:15  2026-10-18T09:54:15  1542
australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports   sha256:7171a21d7e012d2c33194b2dcf501c68bdc914e14b47be7ce4caa9555908e02b        2026-10-18T09:54:15  2026-10-18T09:54:15  48923526

#### Application
It let me know. I did upload the images, but config.json belongs on Docker on VM not in the project, and it gave me commands to show the authentications that I used with another prompt to enable permissions.
```
gcloud container node-pools describe default-pool \
  --cluster=road-report-cluster \
  --zone=australia-southeast2-b \
  --project=project-5472a16f-e6cd-4347-b79 \
  --format="yaml(config.serviceAccount,config.oauthScopes)"
```

## Working on kubernetes.yaml
### Base kubernetes file
Okay well then, here is my attempt at a kubernetes.yaml and I did a values.yaml but tbh I think its kinda useless because a lot of it is already in my docker-compose no?&#x20;



Here is the base docker-compose:&#x20;
```
services:
  # MariaDB based on assignment previously done 
  db:
    image: mariadb:11.8
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: ${DB_NAME}
      MARIADB_USER: ${DB_USER}
      MARIADB_PASSWORD: ${DB_PASSWORD}
    # Local to database port to 3306 on my computer
    ports:
      - "127.0.0.1:${DB_PORT}:3306"
    # Make data persist
    volumes:
      - mariadb_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: always
    networks: 
      - backend
  
  # Accounts service
  accounts:
    image: cloudroad-accounts:local
    build:
      context: .
      dockerfile: backend/Dockerfile
      args:
        API_SERVICE: api-accounts
    environment:
      DB_HOST: db
      DB_PORT: "3306"
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "127.0.0.1:5001:8000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend

  # Reports service 
  reports:
    image: cloudroad-reports:local
    build:
      context: .
      dockerfile: backend/Dockerfile
      args:
        API_SERVICE: api-reports
    environment:
      DB_HOST: db
      DB_PORT: "3306"
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
    ports:
      - "127.0.0.1:5002:8000"
    # I origianlly had volumes here, AI tool told me to remove them because the reports container runs w python 
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend
  # frontend nginx
  frontend: 
    image: cloudroad-frontend:local
    build: 
      context: .
      dockerfile: frontend/Dockerfile
    # AI fix I originally had 5173 isntead of the APP_PORT
    ports: 
      - "${APP_PORT}:80" 
    # AI correction I only included reports before oops
    depends_on: 
      - accounts
      - reports
    networks: 
      - backend

# Data persistance 
volumes:
  mariadb_data:
    driver: local
  
# Define backend network because all of the containers communicate through backend, so no more frontend needed 
networks: 
  backend:
    driver: bridge
```

Here is what I have for my values.yaml:
```
replicaCount: 3

image: 
  # Base repo but I have /accounts, /reports, /frontend; I have the actual docker image here, idk if it should be the github repo instead
  repository: "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend"
  tag: latest
  pullPolicy: IfNotPresent

accounts: 
  repository: "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts"
  tag: latest

reports: 
  repository: "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports"
  tag: latest
```



Here is for my kubernetes.yaml, i just manually set it to one replica here. it is sunday 11 pm, idk what a good stopping point today would be... i wanted to have the hole app up and running
```
# ConfigMaps for shared configuration
# Not sure if since I have app in my frontend, this is front and back or smth?
apiVersion: v1 
kind: ConfigMap
metadata:
  name: road-config
# 1. Config 
data: 
  REPLICAS: "3"
  NGINX_PORT: "8000"

---
# Databases
apiVersion: v1
kind: PersistentVolumeClaim
metadata: 
  name: db
spec: 
  accessMode: 
    - ReadWriteOnce
  # Not sure how much storage I should allot to it
  resources: 
    requests: 
      storage: 2Gi

---
# Services 
# Depoyment ot manage backend and frontend pods
apiVersion: apps/v1
kind: Deployment
metadata: 
  name: {{ .Release.Name }}-frontend
  labels: 
    app: {{ .Release.Name }}-frontend
  spec: 
    # Setting front to 3 replicas, not sure how many I should set 
    replicas: {{ .values.replicaCount }}
    selector: 
      matchLabels: 
        app {{ .Release.Name }}-frontend
      spec: 
        containers: 
          - name: road-report-app
          image: "{{ .values.image.repository }}: {{ .values.image.tag }}"
          # Not sure if its supposed to be the app 8080 port or the nginx serving 8000 or somthing else, plust APP_PORT is from env
          ports: 
            - containerPort: ${{APP_PORT}}
          volumeMounts: 
            - name: db
            # No idea what to set the path to
            mounthPath: /home/jovyan/work
        # To use PVC
        volumes: 
          - name: maria-db
          # Name that actually matters
          PersistentVolumeClaim: 
            claimName: db

---
# Workloads
apiVersion: v1
kind: Service
metadata: 
  name: road-service
# Async creation of LB
spec: 
  selector: 
    app: road-report-app
  # Use the 8080 port from nginx to the other port, or if I am supposed to be using backend and instaed mapping ports 5001 and 5002 to the nginx 8080? 
  ports: 
    - protocol: HTTP
      port: 8080
      targetPort: 80
  type: LoadBalancer
```

#### Application
It let me know I was mixing up Helm templates from one of the resources I used with kubernetes YAML with the values, so it let me know I should instead use a ConfigMap and provided key sugestions to fix the volumeClaimTemplates, database configurations, among other fixes. It also let me know I needed to create the SQL ConfigMap manually.

```
kubectl create configmap road-db-init \
  --from-file=01-init.sql=database/init.sql \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

And it also let me know I should create database secrets with the env to reference them with 
```
kubectl create secret generic road-db-secret \
  --from-env-file=.env.k8s \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

It also gave me a key command to visualize the database that I used later in the project for debugging, where I needed to enter the DB_PASSWORD
```
kubectl exec -it db-0 -- mariadb -u road_app -p db_road
```
```
SHOW TABLES;
SELECT COUNT(*) FROM regions;
exit;
```

### Base kubernetes frontend configuration
okay here is my draft kubernetes.yaml for the frontend, it would help me to distinguish between service and a stateful set I think and yeah
```
# Frontend connection 
# Uses a load balancer  
apiVersion: apps/v1
kind: Service
metadata:
  name: frontend
spec:
  serviceName: frontend
  replicas: 1

  selector:
    matchLabels:
      app: frontend

  template:
    metadata:
      labels:
        app: frontend
    spec:
      # Not sure if its supposed to be a selector with app: app or something like that, and isntaed for ports establish TCP protocil or HTTP and map poarts 80:80 
      containers:
        - name: frontend
          # Same image as in the docker compose 
          image: cloudroad-frontend:local

          ports:
            - "${APP_PORT}:80" 
          type: LoadBalancers

          # Not sure if I need to add the volumeMounts and the respective volumes section to use db.init with the config map cause it's using db but idk if ithat needs any cofiguration
```

#### Application
Key correction was that I was mixing workload that runs containers, and a Service that routes traffic to them, it suggested that frontend should use a Deployment + Service. 
| Object | Responsibility | Your project |
|---|---|---|
| **Deployment** | Creates/replaces interchangeable Pods and controls their replica count | Frontend, accounts API, reports API |
| **StatefulSet** | Manages Pods with stable identities and associated persistent storage | MariaDB |
| **Service** | Provides a stable network address and routes requests to matching Pods | Frontend’s public address; internal API/database addresses |

It let me know "A Service doesn’t run containers, so it has no container image, Pod template, or replica count. Deployments and StatefulSets manage those. Official workload overview."

And I needed to separate definitions with ---. 

This is what it also suggested
"- Remove serviceName from the Deployment; that field belonged to your StatefulSet.
- Use the Artifact Registry image, because cloudroad-frontend:local only exists on the machine where you built it.
- Remove "${APP_PORT}:80". That’s Compose syntax. Kubernetes uses separate numeric port and targetPort fields; it doesn’t automatically read your .env.
- No database mounts on the frontend. Its React files and Nginx configuration are already inside the image. It communicates with the APIs, which connect to MariaDB.
- One replica is fine for the baseline. Increase it after the full application works.
Before applying the frontend, we need the accounts and reports Services. Your Nginx configuration resolves those names at startup; if they don’t exist, Nginx may fail to start. The next step is to define each API’s Deployment and internal ClusterIP Service, keeping their Service names accounts and reports and their ports 8000."

With that, I had a bit of guidance knowing what else I had to work on after that.

### Base kubernetes accounts configuration
Here is my attempt for the accounts, not sure if I should set the clusterIP: None and make it headless vs adding a  load balancer, cause I don't know if just having a balancer on the frontend is too limited because I need to handle more an insurge of like reports (more important reports than the number of accounts or logins I'd say, but they need to be logged in to make a reprot so yeah)... let me know what you think and provide feedback on accoutns so that I can fix it and then try to implement it on reports.&#x20;


```
# Backend accounts 
# So deplopyment creates pod called app: accounts for that service 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: accounts
spec:
  replicas: 1

  selector:
    matchLabels:
      app: accounts

  # Gets the image itself of the frontend, careful as I modify tags in future updates
  template:
    metadata:
      labels:
        app: accounts
    # Here directly gets the img from the repo
    spec:
      containers:
        - name: frontend
          image: australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports:v1
          # Not sure if it should be the vite port 5001 configured, the nginx.conf at 8000, or 80 for http traffic... I'm setting at 8000 for now
          ports:
            - containerPort: 8000

--- 
# Backend public entrypoint with service defined above 
apiVersion: v1
kind: Service 
metadata: 
  name: accounts
spec: 
  # Adds load balancer to backend accounts 
  type: LoadBalancer

  # Now servie is selecting the previously labelled pod 
  selector:  
    app: accounts
  
  # Requests arrive to service port 80 through pods and go to pods port 8000 to nginx I think, not sure 
  ports: 
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8000
```

#### Application
It told me "Use a normal ClusterIP Service for accounts and reports. It routes internal traffic across their replicas; you don’t need a public load balancer for every API", that I had acidentally reused the frontend image name, and it let me know I had forgotten to add the env values from the configuration map that I should add at port level.

```
envFrom:
  - configMapRef:
      name: road-config

env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: road-db-secret
        key: DB_PASSWORD
```

This is the corrected configuration example it gave me without prompting, which I compared against my original attempts to understand it better
```
apiVersion: v1
kind: Service
metadata:
  name: accounts
spec:
  type: ClusterIP

  selector:
    app: accounts

  ports:
    - name: http
      protocol: TCP
      port: 8000
      targetPort: 8000
```

It also let me know the overall flow for my clarification was Nginx → accounts Service port 8000 → accounts Pod port 8000 → Gunicorn/Flask.

### Base kubernetes reports configuration
what do you think of this now? 
```
# Backend for reports, creating pod and labelling it reports
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reports
spec:
  replicas: 1

  selector:
    matchLabels:
      app: reports

  # Gets the image itself of the frontend, careful as I modify tags in future updates
  template:
    metadata:
      labels:
        app: reports
    # Here directly gets the img from the repo
    spec:
      containers:
        - name: reports
          image: australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports:v1
          # Container port 8000 because Gunicorn listens there 
          ports:
            - containerPort: 8000
          
          # DB specification 
          envFrom: 
            - configMapRef: 
                name: road-config

          # Loads vals from env onto pod
          env: 
            - name: DB_PASSWORD
              valueFrom: 
                secretKeyRef: 
                  name: road-db-secret
                  key: DB_PASSWORD

--- 
# Backend public entrypoint with service defined above for reports
apiVersion: v1
kind: Service 
metadata: 
  name: reports
spec: 
  # Making it a cluster IP instead of load balancer, article amlanscloud.com/reactappdeploy specifies that it serves to expose API endpoint within cluster so frontend can access and request data 
  type: ClusterIP

  # Now servie is selecting the previously labelled pod 
  selector:  
    app: reports
  
  # Requests arrive to service port 8000 (AI correction, I had 80 previously) through pods and go to pods port 8000 to nginx config 
  ports: 
    - name: http
      protocol: TCP
      port: 8000
      targetPort: 8000
```

#### Application
I used the previous accounts section as a base for my reports, it just provided clarifications
"Gets the image itself of the frontend” → reports API image.
“Backend public entrypoint” → internal entry point; ClusterIP doesn’t expose it publicly.
“Loads vals from env” → loads the password from a Kubernetes Secret.
“Go to pods port 8000 to nginx config” → go to the reports Pod’s Gunicorn server on port 8000."

### Accessing the frontend with kubernetes
oops i had forgotten to resize my cluster to start it up again, now they're slowly going back up again. All of the ports have started up:
```
 kubectl get pods,deployments,services
NAME                            READY   STATUS    RESTARTS      AGE
pod/accounts-6cd75cb994-7hvvv   1/1     Running   0             9m48s
pod/db-0                        1/1     Running   0             9m48s
pod/frontend-6cc86bcf58-gfxg4   1/1     Running   2 (91s ago)   9m48s
pod/reports-5b46954c4f-75ps9    1/1     Running   0             9m48s

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/accounts   1/1     1            1           9m48s
deployment.apps/frontend   1/1     1            1           9m48s
deployment.apps/reports    1/1     1            1           9m48s

NAME                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/accounts     ClusterIP      34.118.237.169   <none>        8000/TCP       9m48s
service/db           ClusterIP      None             <none>        3306/TCP       13h
service/frontend     LoadBalancer   34.118.237.26    <pending>     80:32394/TCP   9m48s
service/kubernetes   ClusterIP      34.118.224.1     <none>        443/TCP        18h
service/reports      ClusterIP      34.118.230.219   <none>        8000/TCP       9m48s
```

I then did the docker compose up -d



Going to http\://34.129.49.41/ didn't show the app just hte ubuntu default page, going to 34.118.237.26 says site couldn't be reached, which makes snese cause no extenral ip. And adding the [http://34.129.49.41:8080](http://34.129.49.41:8080) does show up the frontend but idk if it's supposed to work without the external port routing

#### Application
I did not know how to actually access the application generated, turns out I had to wait for the service/frontend LoadBalancer to come up and then access it without the :8000 soecification at all. 

It also suggested testing pod scalings with commands such as 
```
kubectl scale deployment reports --replicas=2
kubectl get pods -l app=reports -o wide
```
It then suggested I start working on "I’d spend the next short block getting two reports replicas, readiness checks, and one replacement test working. Then implement the core website features; use their next image versions to demonstrate rollout/rollback"

### Commands to test pods 
Uh... i dont know if the readiness probs are within the scope of this project or not? I think I already have the kubernetes and scalability I guess with the replicas, not sure if there are certian commands I can run directl on the terminal to check the whole reliability if some of the nodes are down. I don't know if I should set then more replicas like 2 or 4 for reports because a user that is signed in might remain for longer and be posting more reports, and maybe 2 or 4 or 6 for frontend because ppl that are not signed in may still see the reports without making any themselves. But idk how to actually test the kubernetes itself works beyond seeing the pods?

#### Application
Recieved key commands to test pods with the full following output workflow
"
**Readiness probes aren’t explicitly required by your rubric.** They support reliability, but you can begin testing without them. The rubric asks you to demonstrate scaling **without disrupting the running application**, reliability when some containers/nodes are down, load balancing, and rollout/rollback—not just show that Pods exist. Marking Criteria_2026 (1)(1).pdf

**Start with two replicas each for frontend, accounts, and reports; keep one database.** That’s enough to demonstrate redundancy. Six frontend replicas wouldn’t automatically earn more marks.

Also, browsing regional reports calls the **reports API too**. Replica counts should eventually follow measured traffic/resource usage, rather than whether visitors are logged in. A logged-in user doesn’t reserve a Pod.

### 1. Continuously check a real application request

On your management VM, open a terminal and run:

```bash
# Repeatedly query regions through the public frontend and reports API.
while true; do
  curl --max-time 5 -sS -o /dev/null \
    -w "HTTP %{http_code}\n" \
    http://34.129.175.8/api/reports/regions
  sleep 1
done
```

Stop with **Ctrl+C** when finished.

`HTTP 200` means the request succeeded. Other status codes or connection errors are evidence of disruption. This is a basic availability check, **not a capacity/load test**.

### 2. Demonstrate scaling while requests continue

In a second terminal:

```bash
# Increase the number of reports API Pods.
kubectl scale deployment reports --replicas=3

# Watch the new Pod start.
kubectl get pods -l app=reports -o wide --watch
```

Press Ctrl+C to stop watching, then:

```bash
# Reduce the count while keeping two replicas.
kubectl scale deployment reports --replicas=2
```

Watch whether the requests in terminal one continue succeeding. That demonstrates more than a screenshot of three Pods. [Official scaling command](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_scale/). [Kubernetes](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_scale/?utm_source=chatgpt.com)

### 3. Demonstrate Pod replacement

With **two reports Pods running**:

```bash
# Find their actual names and node placement.
kubectl get pods -l app=reports -o wide
```

Copy **one** Pod’s name, then substitute it below:

```bash
# Delete one reports Pod; leave its other replica running.
kubectl delete pod REPORTS_POD_NAME
```

```bash
# Watch the Deployment create a replacement.
kubectl get pods -l app=reports -o wide --watch
```

Your evidence is:

- One reports Pod was removed.
- Another replica continued serving requests.
- Kubernetes created a replacement automatically.

**Call this a controlled Pod-removal/recovery test**, not proof of surviving every possible crash. If requests fail, record that and investigate; don’t assume replica counts guarantee uninterrupted service.

### 4. A node-maintenance test comes next

First ensure frontend and accounts also have redundancy:

```bash
kubectl scale deployment frontend accounts --replicas=2
kubectl get pods -o wide
```

**Different Pod IPs do not prove different nodes. Compare the `NODE` column.**

For a controlled node test, choose a node **without `db-0`**, and ensure another frontend/API replica remains elsewhere. Then:

```bash
# Prevent new scheduling there and evict its eligible workloads.
kubectl drain NODE_NAME --ignore-daemonsets --timeout=120s
```

Keep the request loop running and inspect replacement Pods. Afterwards:

```bash
# Allow scheduling on that node again.
kubectl uncordon NODE_NAME
```

If drain reports a blocker, don’t add force flags blindly. This simulates **planned node maintenance**, not an abrupt VM failure. [Official drain documentation](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/). [Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/?utm_source=chatgpt.com)

Your **single database remains a failure point**: taking down its node can interrupt database requests while storage and the Pod recover.

For load balancing, multiple ready Service endpoints show the routing setup; demonstrating actual traffic distribution needs something observable, such as returning the responding Pod’s hostname from a health endpoint.

**Do the scaling and single-Pod replacement tests first.** They’re small, meaningful checks you can complete now. Then add readiness probes before rehearsing rolling updates, and retain your final replica counts in the YAML so the next apply doesn’t reset them.
"

### Readiness probes
I tried to add for mariadb and saw that "By default, (since 2023-06-27), official images will create healthcheck@localhost, healthcheck@127.0.0.1, healthcheck@::1 users with a random password and USAGE privileges. "  Anyway, do you suggest I add a readiness probe to the frontend or smth, i think that's the one with the load balancer that took the longest last time. I saw "If a container fails its liveness probe more times than the configured tolerance, the kubelet restarts that container. Liveness probes do not wait for readiness probes to succeed. If you want to wait before executing a liveness probe, you can either define initialDelaySeconds or use a startup probe."&#x20;

I added both readiness and liveliness ports in the file to the DB, accounts, reports, frontend

At env/port level for the accounts reports I did&#x20;
\# Probing readiness w initial delay to let db star*t up first*\
&#x20;         readinessProbe:\
&#x20;           httpGet:\
&#x20;             path: /api/reports/health\
&#x20;             port: 8000\
&#x20;           initialDelaySeconds: 10\
&#x20;           periodSeconds: 5\
&#x20;           timeoutSeconds: 2 \
&#x20;           failureThreshold: 3\
\
&#x20;         \# Probe liveness on nginx port\
&#x20;         \# Checks ready every five seconds w 2 second timeout, and max fails 3 times before getting purged and having a new one in its place\
&#x20;         livenessProbe:\
&#x20;           httpGet:\
&#x20;             path: /api/reports/health\
&#x20;             port: 8000\
&#x20;           periodSeconds: 5\
&#x20;           timeoutSeconds: 2 \
&#x20;           failureThreshold: 3

At the frontend I just made it with less intial time cause better to have something up first even if its emtpy right cause of the others still being down? added&#x20;
added to kind: Deployment
\# Probing readiness w initial delay to let db start up first\
&#x20;         readinessProbe:\
&#x20;           httpGet:\
&#x20;             path: /\
&#x20;             port: 80\
&#x20;           initialDelaySeconds: 5\
&#x20;           periodSeconds: 5\
&#x20;           timeoutSeconds: 2 \
&#x20;           failureThreshold: 3\
\
&#x20;         \# Probe liveness on nginx port\
&#x20;         \# Checks ready every five seconds w 2 second timeout, and max fails 3 times before getting purged and having a new one in its place\
&#x20;         livenessProbe:\
&#x20;           httpGet:\
&#x20;             path: /\
&#x20;             port: 80\
&#x20;           periodSeconds: 5\
&#x20;           timeoutSeconds: 2 \
&#x20;           failureThreshold: 3

For the db, I did at StatefulSet level with more delay because it might take up longer for the db to start:&#x20;
\# Checking readiness with a probe \
&#x20;         \## First run startup (makes sure app succeeds, useful if app starts slow), readiness (eval app can accept traffic before routing), liveness (checks if app is deadlocked/unhealthy and restarts if fail)\
&#x20;         readinessProbe:\
&#x20;           exec: \
&#x20;             command: \
&#x20;               \- /healthcheck.sh\
&#x20;               \- --readiness\
&#x20;             initialDelaySeconds: 60\
&#x20;             periodSeconds: 5\
&#x20;         livenessProbe: \
&#x20;           exec: \
&#x20;             command: \
&#x20;               \- //healthcheck.sh\
&#x20;               \- --readiness\
&#x20;             initialDelaySeconds: 60\
&#x20;             periodSeconds: 5

#### Application
I read documentation regarding readiness probes, it corrected that probe delays don't establish startup orders, liveness restarts container not the whole pod. It also let me know I was doing my healthcheck wrong that I had found online to use instead ```healthcheck.sh --connect --innodb_initialized```, and it suggested readiness probe modifications
```
startupProbe:
  exec:
    command:
      - healthcheck.sh
      - --connect
      - --innodb_initialized
  periodSeconds: 5
  timeoutSeconds: 5
  failureThreshold: 60

readinessProbe:
  exec:
    command:
      - healthcheck.sh
      - --connect
      - --innodb_initialized
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Rolling updates
I tried this for the rolling updates
# Added for rolling updates 
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0 # All originals stay up until a new one is ready to take its place 
      maxSurge: 1 # One max extra pod created while prepping to replace old pod

#### Application
It let me know I should add it to the frontend, accounts and reprots deployments under specs at the same level as replicas and selector, and the following commands are useful to inspect rollout history.

```
# Wait for a frontend update to complete.
kubectl rollout status deployment/frontend

# Inspect its retained revisions.
kubectl rollout history deployment/frontend

# Restore the previous Pod-template revision.
kubectl rollout undo deployment/frontend

# Verify that restoration completes.
kubectl rollout status deployment/frontend
```

## Website functionalities
### Login
Okay my time to give up and ask you... I found a base for a making user registration with hashes and stuff, not sure how to do it though.&#x20;
```
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS 

app = Flask(__name__)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), unique=True, nullable=False)
    # created_at = db.Column(db.String(128), nullable=False)

# Basic health check
@app.get("/api/accounts/health")
def health():
    return {
        "service": "accounts",
        "status": "running",
    }

# Create account
@app.get("/api/accounts/register", methods=["POST"])
def signup():
    # Paramters recieved through the post
    username = request.json["username"]
    password = request.json["password"]
 
    # Check if this person is already registered
    user_exists = User.query.filter_by(username=username).first() is not None
 
    # Protection against repeated people
    if user_exists:
        return jsonify({"error": "This user already exists"}), 409
     
    # Hash the password from the posted one
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password, ) # Make it register people 
    db.session.add(new_user) # Should add the created_at automatically when inserting it
    db.session.commit()
 
    # Sets session to the user id that was generated, see how I can reuse it across the app
    session["user_id"] = new_user.id
 
    # Returns the id and username that was added
    return jsonify({
        "id": new_user.id,
        "username": new_user.username
    })
    
```

Now i wanna make the create account, but im confused as to how I can do the post for the login stuff:&#x20;
```
import { useState } from 'react'
import {useNavigate} from "react-router-dom";
import axios from 'axios';


function CreateAccount() {
    // const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    //const [error, setError] = useState('');
    //const navigate = useNavigate();
    //const [user, setUser] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState(''); //, setErrorMessage] = useState('');
    const navigate = useNavigate();

    async function registerUser() {
          try {
            const response = await fetch('/api/accounts/register');
    
            // Error loadign region
            if (!response.ok) {
              throw new Error(`Could not reports (${response.status})`);
            }
    
            // Posts the info
            // const data: Region[] = await response.json();
    
            if (!ignore) {
              // Tries to establish the regions that should have been obtained 
              setRegions(data);
            }
          } catch (error) {
            if (!ignore) {
              // So it did get the request but could not set them 
              setError(error instanceof Error ? error.message : 'Could not reports');
            }
          } finally {
            // Did work, so finished loading 
            if (!ignore) {
              setLoading(false);
            }
          }
        }
    
        // Calll funct to load regions 
        loadRegions();
    
        return () => {
          ignore = true;
        };
      }, []);
     
    // Register a user 
    const handleCLick = () => {
        axios.post('http://127.0.0.1:5000/signup', {
            email: email,
            password: password
        })
        .then(function (response) {
             console.log(response);
            navigate("/");
        })
        .catch(function (error) {
            console.log(error, 'error');
            if (error.response.status === 401) {
                alert("Invalid credentials");
            }
        });
    };

    // Functions
    const handleClick = () => {
        console.log('User trying to register');
    };

    return (
        <div className="flex items-center justify-center overflow-hidden">
            {/* Centered login card */}
            <div className="relative flex flex-col items-center w-full max-w-sm px-8 py-10">

                <h1 className="text-2xl font-bold text-center mb-1">Register</h1>
                <p className="text-gray-600 text-center mb-6">Join and help submit reports for your fellow riders!</p>

                {/* Capture data, first email/username */}
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <label>Username</label>
                        <input
                            type="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-11 px-4 bg-gray-100 rounded-2xl text-zinc-600 focus:outline-2"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Create new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 px-4 bg-gray-100 rounded-2xl text-zinc-600 focus:outline-2"
                        />
                    </div>

                    <button
                        onClick={handleClick}
                        className="text-white font-bold bg-blue-400 hover:bg-blue-700 py-2 px-4 rounded-2xl"
                    >Create Account</button>
                </div>

                {/* Error display or go login or home */}
                {errorMessage && <p className="text-center rounded-lg bg-red-100 text-red-800 outline-2 outline-red-800 mt-5 mb-1 px-2 py-3">{errorMessage}</p>}
                <div className="flex flex-col text-center items-center gap-2.5 mt-15 col-1">
                    <p className="text-black font-semibold">Already have an account?</p>
                    <a href="/login" className="text-blue-400 hover:text-blue-700 font-semibold underline">Log in</a>
                    <a href="/" className="text-zinc-600 underline hover:text-blue-700 mt-5">Return Home</a>
                </div>
            </div>
        </div>
    )
}

export default CreateAccount
```

#### Application
It told me to "Replace the SQLAlchemy model and registration attempt with this in backend/api-accounts/app.py. Keep your health route."
and suggested the following file that I then compared against mine
```python
import pymysql
from flask import Flask, request
from werkzeug.security import generate_password_hash

from db import get_connection

app = Flask(__name__)


@app.get("/api/accounts/health")
def health():
    return {"service": "accounts", "status": "running"}


@app.post("/api/accounts/register")
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return {"error": "Expected username and password as JSON"}, 400

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return {"error": "Username and password are required"}, 400

    username = username.strip()

    if not username or len(username) > 50:
        return {"error": "Username must contain 1–50 characters"}, 400

    if not password or len(password) > 256:
        return {"error": "Password must contain 1–256 characters"}, 400

    password_hash = generate_password_hash(password)
    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (username, password_hash)
                VALUES (%s, %s)
                """,
                (username, password_hash),
            )
            user_id = cursor.lastrowid

        connection.commit()

        return {"id": user_id, "username": username}, 201

    except pymysql.IntegrityError as error:
        if connection is not None:
            connection.rollback()

        if error.args[0] == 1062:
            return {"error": "This username already exists"}, 409

        app.logger.exception("Registration failed")
        return {"error": "Could not create account"}, 500

    except pymysql.MySQLError:
        if connection is not None:
            connection.rollback()

        app.logger.exception("Registration database error")
        return {"error": "Database temporarily unavailable"}, 503

    finally:
        if connection is not None:
            connection.close()
```
It also gave me a base for the post endoint, which I had not used before
```jsx
async function handleClick() {
    setErrorMessage('');
    setLoading(true);

    try {
        const response = await fetch('/api/accounts/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Could not create account');
        }

        navigate('/login');
    } catch (error) {
        setErrorMessage(
            error instanceof Error
                ? error.message
                : 'Could not create account'
        );
    } finally {
        setLoading(false);
    }
}
```

It told me to "Delete the Axios code, registerUser, loadRegions, ignore, and the duplicate click handlers. Registration happens on a button click, not inside a mounting effect" and also suggested changing the input field type="username" to type="text".

It told me to test it with command ```docker compose up -d --build accounts reports db``` and then ```npm run dev``` for the frontend. 

#### Session
Okay, now I tried to add login stuff, I need help because it is not currently letting me access the database neither at home or login:&#x20;

frontend % npm run dev\
\
\> frontend@0.0.0 dev\
\> vite\
\
\
&#x20; VITE v8.3.4  ready in 311 ms\
\
&#x20; ➜  Local:   http\://localhost:5173/\
&#x20; ➜  Network: use --host to expose\
&#x20; ➜  press h + enter to show help\
10:44:00 AM [vite] http proxy error: /api/reports/regions\
Error: connect ECONNREFUSED 127.0.0.1:5002\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)\
10:44:00 AM [vite] http proxy error: /api/reports/regions\
Error: connect ECONNREFUSED 127.0.0.1:5002\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16) (x2)\
10:44:08 AM [vite] http proxy error: /api/accounts/login\
Error: connect ECONNREFUSED 127.0.0.1:5001\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)\
10:44:40 AM [vite] http proxy error: /api/accounts/login\
Error: connect ECONNREFUSED 127.0.0.1:5001\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16) (x2)\
10:44:58 AM [vite] http proxy error: /api/reports/regions\
Error: connect ECONNREFUSED 127.0.0.1:5002\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16)\
10:44:58 AM [vite] http proxy error: /api/reports/regions\
Error: connect ECONNREFUSED 127.0.0.1:5002\
&#x20;   at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1637:16) (x2)



Also, I know a post is more safe, so I want your feeddback on the routes and login, and I would like to know how to implement a simple session with this work:&#x20;
```
# Login as a post to protect security
@app.post("/api/accounts/login")
def login():
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
        return {"error": "Password must be between 1–256 characters"}, 400

    # Create a hash from the password
    password_hash = generate_password_hash(password)
    connection = None

    # Establish connection 
    try:
        connection = get_connection()
        
        # SQL query to execute, and extract id that was just generated with %s to pass the strings, sets as dictionary to extract rows more easily
        with connection.cursor() as cursor(dictionary=True):
            cursor.execute(
                """
                SELECT id, password_hash FROM users WHERE username = %s
                """,
                (username),
            )
            user = cursor.fetchone() # Extracts the id

        # Close cursor
        cursor.close()
        
        # Verify the user and password matches
        if user and check_password_hash(user['password_hash'], password): 
            # Pwd match, log the user in
            return {"id": user_id, "username": username}, 201

        else: 
            return {"error": "Incorrect credentials"}, 400

    # Something failed
    except pymysql.MySQLError:
        if connection is not None:
            connection.rollback()

        app.logger.exception("Registration database error")
        return {"error": "Database temporarily unavailable, please try again later"}, 503

    # Once done, closes the connection
    finally:
        if connection is not None:
            connection.close()
```



Function to log in:&#x20;
```
async function handleLogin() {
        // Base field checks
        console.log("Handle the click");
        setErrorMessage('');

        if(username.length === 0 && password.length === 0) {
            setErrorMessage("Please enter a username and password")
        }
        else if(username.length === 0) {
          setErrorMessage("Please enter a username");
        }
        else if(password.length === 0) {
          setErrorMessage("Please enter a password");
        }
        else {
            // Shows that it is going to load
            setLoading(true);

            // Sends the query 
            try {
                const response = await fetch('/api/accounts/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                });

                // Waits to see what endpoint says
                const data = await response.json();

                // Something died
                if (!response.ok) {
                    throw new Error(data.error || 'Could not log in');
                }

                console.log('Logged in user');
                navigate('/'); // Successful, takes them home with session
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : 'Could not log user in'
                );
            } finally {
                setLoading(false);
            }
        }
    }
```

#### Application
It helped implement sessions with command ```bash python3 -c "import secrets; print(secrets.token_hex(32))"``` that I shoud establish in SECRET_KEY=paste_the_generated_value_here, and add to the compose enviornment ``` SECRET_KEY: ${SECRET_KEY}```, and corrections to API call. 

Since I was adding sessions, it told me to add the following block
```python
app.config.update(
    SECRET_KEY=os.environ["SECRET_KEY"],
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
)
```
And key corrections to my function that I compared agaisnt the helper it gave me–but did not replace it with the one they gave me so that I read and understood what was happening. 

```python
@app.post("/api/accounts/login")
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return {"error": "Expected username and password as JSON"}, 400

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return {"error": "Username and password are required"}, 400

    username = username.strip()

    if not username or not password:
        return {"error": "Please enter a username and password"}, 400

    if len(username) > 50 or len(password) > 256:
        return {"error": "Invalid username or password length"}, 400

    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, username, password_hash
                FROM users
                WHERE username = %s
                """,
                (username,),
            )
            user = cursor.fetchone()

        if user is None or not check_password_hash(
            user["password_hash"], password
        ):
            return {"error": "Incorrect username or password"}, 401

        # Replace any previous session after successful authentication.
        session.clear()
        session.permanent = True
        session["user_id"] = user["id"]
        session["username"] = user["username"]

        return {
            "id": user["id"],
            "username": user["username"],
        }, 200

    except pymysql.MySQLError:
        app.logger.exception("Login database error")
        return {"error": "Database temporarily unavailable"}, 503

    finally:
        if connection is not None:
            connection.close()
```

It also provided a base endpoint to check if the user has an active session, which I later reflected in the frontend by retrieving the username via the established session or did not show their name if they had no session. 
```python
@app.get("/api/accounts/me")
def current_user():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401

    return {
        "id": session["user_id"],
        "username": session["username"],
    }, 200
```
### Correcting make reports login based on session
Modified now to get the user session so that I can block or unblick the make a report if they are not logged in: 
// When page loads, it should get all of the reports
  useEffect(() => {
    // Checks if user is logged in to see if lets them access stuff or not
    useEffect(() => {
      async function getSession() {
        try {
          const response = await fetch('/api/accounts/session');

          if (!response.ok) {
            throw new Error(`Could not fetch session (${response.status})`);
          }

          // Gets result of session
          const checkSession = await response.json();

          // There is something defined
          if (checkSession["username"]) {
            // Checks the results of the session
            setUsername(checkSession["username"]);
            setLoggedIn(true);
          } else {
            setUsername('');
            setLoggedIn(false);
          }
        }
        catch (error) {
          if (!ignore) {
            // So it did get the request but could not set them 
            setError(error instanceof Error ? error.message : 'Could not check if user is logged in');
          }
        } 
      }
    })

    let ignore = false;

    // Uses here the flask api route to fetch the region reports
    async function loadRegions() {
      try {
        const response = await fetch('/api/reports/regions');

        // Error loadign region
        if (!response.ok) {
          throw new Error(`Could not load reports (${response.status})`);
        }

        // Recieves data 
        const data: Region[] = await response.json();

        if (!ignore) {
          // Tries to establish the regions that should have been obtained 
          setRegions(data);
        }
      } catch (error) {
        if (!ignore) {
          // So it did get the request but could not set them 
          setError(error instanceof Error ? error.message : 'Could not reports');
        }
      } finally {
        // Did work, so finished loading 
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    // Call to get login status
    getSession();

    // Calll funct to load regions 
    loadRegions();

    return () => {
      ignore = true;
    };
  }, []);

And right now just showing a small p under the title of the page that just says {loggedIn ? <p>Welcome back {username}!</p> : <p>Log in to make reports!</p>}

#### Application
It said that my nested useEffect was not working, so I should keep it as a separate function and it added the disabling as just disabled={!loggedIn}

### Providing secret key to kubernetes 1
Wait the secret key I only added it to the root .env, and then updated the docker-compose to include it. I did not modify the kubernetes.yaml

# Accounts service
  accounts:
    image: cloudroad-accounts:local
    build:
      context: .
      dockerfile: backend/Dockerfile
      args:
        API_SERVICE: api-accounts
    environment:
      # Database 
      DB_HOST: db
      DB_PORT: "3306"
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      # Password hash with Flask built-in session
      SECRET_KEY: ${SECRET_KEY}

I just pulled the github, and added the SECRET_KEY generated on my mac to the .env in root directory. kubernetes.yaml I already changed it (currently v1, I want v2 to be the new login stuff I added just in frontend and accounts) and it is reflected on my github on my computer

### Providing key to kubernetes 2
Is there a way I can create the secret more persistent, like a .sh file I can run like in the cca2 example: 
```
#!/usr/bin/env bash
# PROVIDED helper - not assessed and should not be submitted.
set -euo pipefail

TOKEN="${1:-$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(24))
PY
)}"

kubectl create secret generic jupyter-secret \
  --from-literal=JUPYTER_TOKEN="$TOKEN" \
  --dry-run=client -o yaml | kubectl apply -f -

echo
echo "Jupyter token created. Keep this token private while your cluster is running:"
echo "$TOKEN"
echo
echo "After jupyter-service receives an EXTERNAL-IP, browse to:"
echo "  http://EXTERNAL_IP:8080/lab?token=$TOKEN"
```
Or yeah just to generate it and then i can set it manually in the env even if its different from local develoopment?

#### Application
It did provide a template that I read but did copy-paste to save time investigating the commands, 
```
#!/usr/bin/env bash
set -euo pipefail

# Check whether the Secret already exists in the default namespace.
EXISTING_SECRET=$(kubectl get secret road-session-secret \
  --namespace=default \
  --ignore-not-found \
  -o name)

# Preserve the existing key when rerunning this script.
if [[ -n "$EXISTING_SECRET" ]]; then
  echo "Session Secret already exists; keeping its current key."
  exit 0
fi

# Generate a cloud-specific signing key.
SESSION_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

# Create the Kubernetes Secret without printing its value.
kubectl create secret generic road-session-secret \
  --namespace=default \
  --from-literal=SECRET_KEY="$SESSION_KEY"

unset SESSION_KEY

echo "Session Secret created."
```

This one I just modified it to change the echos a bit. 

It specified that I should run it with ```bash k8s/setup_session_secret.sh``` and I should add a block to the yaml specifying 
```
- name: SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: road-session-secret
      key: SECRET_KEY
```

## Working with navigation bar to change based on user being logged in or out
my navbar isnt working now: 
//import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";

function Navbar() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

    // Checks if user is logged in to see if lets them access stuff or not
    useEffect(() => {
        let ignore = false;

        async function getSession() {
            try {
                const response = await fetch('/api/accounts/session');
                
                // Gets result of session
                const checkSession = await response.json();

                // Not logged in might be normal, just checks and exits
                if (response.status === 401) {
                    if (!ignore) {
                        setLoggedIn(false);
                    }
                    return;
                }

                if (!ignore) {
                    setLoggedIn(Boolean(checkSession.username));
                }

                if (!response.ok) {
                    throw new Error(Could not log out (${response.status}));
                }

                // There is something defined
                setLoggedIn(false);
                setLoggingOut(false);
            }
            catch (error) {
                if (!ignore) {
                    // So it did get the request but could not set them 
                    console.log("Navbar could not establish session");
                }
            }
        }

        // Call function itself
        getSession();

        return () => {
            ignore = true;
        };
    }, [])

    async function logOut() {
        setLoggingOut(true);

        try {
            // AI suggestion include the credentials to check the session
            const response = await fetch('/logout', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Could not log out');
            }

            setLoggedIn(false);
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div>
            <nav className="flex justify-between items-center h-16 font-semibold bg-blue-200 p-6 px-10">

                <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
                {!loggedIn ?
                    <div className="flex justify-right">
                        <a href="/login" className="mr-6">Login</a>
                        <a href="/register">Register</a>
                    </div>
                    :
                    <div>
                        <button
                            type="button"
                            onClick={logOut}
                            disabled={loggingOut}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {loggingOut ? 'Logging Out...' : 'Log Out'}
                        </button>
                    </div>
                }
            </nav>

        </div>
    )
}

export default Navbar

#### Application
It provided the following insights, which I read and modified accordingly: 
"
**Three things are causing this:**

1. After detecting a valid session, you immediately call **`setLoggedIn(false)`** again.
2. Your logout request uses **`GET /logout`**, but our Flask route was **`POST /api/accounts/logout`**.
3. The navbar stays mounted during navigation, so an effect with `[]` won’t recheck after logging in.

Use `useLocation` to recheck when the page changes:

```tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
```

Inside `Navbar`, add:

```tsx
const location = useLocation();
```

Replace your effect with:

```tsx
useEffect(() => {
    let ignore = false;

    async function getSession() {
        try {
            const response = await fetch('/api/accounts/session');

            if (response.status === 401) {
                if (!ignore) setLoggedIn(false);
                return;
            }

            if (!response.ok) {
                throw new Error(`Could not check session (${response.status})`);
            }

            const data = await response.json();

            if (!ignore) {
                setLoggedIn(Boolean(data.username));
            }
        } catch (error) {
            if (!ignore) {
                setLoggedIn(false);
                console.error('Navbar could not establish session:', error);
            }
        }
    }

    getSession();

    return () => {
        ignore = true;
    };
}, [location.pathname]);
```

Then replace `logOut` with:

```tsx
async function logOut() {
    setLoggingOut(true);

    try {
        const response = await fetch('/api/accounts/logout', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Could not log out (${response.status})`);
        }

        setLoggedIn(false);
        navigate('/');
    } catch (error) {
        console.error('Error logging out:', error);
    } finally {
        setLoggingOut(false);
    }
}
```

**Keep your existing JSX.** These changes assume Flask defines:

```python
@app.get("/api/accounts/session")
```

and:

```python
@app.post("/api/accounts/logout")
```

If your backend uses different paths, match those exactly. Since these are same-origin requests through Vite/Nginx, cookies are sent by default; `credentials: 'include'` isn’t necessary here.
"

### Re-rendering home with logout
the issue now is that it doesn't refresh the page, like the sign out button does change back to navbar statusbut home stays displaying the persons name and enabled button

#### Application
It suggested to useLocation and change navigate to 
```jsx
setLoggedIn(false);
window.location.replace('/');
```
that way, it would detect when the rendeing was changed to home from the navbar and regenerate the window.

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