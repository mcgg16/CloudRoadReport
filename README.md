# Project Installation
## Previous requirements 
This specification assumes that Google's Cloud Engine is being used and a VM and kubernetes cluster are already configured. Additionally, gcloud, kubectl, docker, vim and GKE authentication plugins are installed. Not only that, but the firewall allows HTTP traffic from ports 80, 8080, and 8000.

## Set up
Pull repository from GitHub: ```git clone https://github.com/mcgg16/CloudRoadReport && cd CloudRoadReport/```

Copy the .env.example file values by navigating to ```vim .env.example``` and then typing ```vim .env```; the env that was used for this submission will be attached in blackboard. Then, run the following command to create the database configuration map:
```
kubectl create configmap road-db-init \
  --from-file=01-init.sql=database/init.sql \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

Afterwards, run ```bash k8s/setup_session_secret.sh```, which is used by the web application to maintain user sessions. 

## Microservice architecture and containerization
For local testing, ```docker compose build``` to build the services, then ```docker compose up -d``` to start the web application containers on the VM. This should generate the following ouptut: 
```bash
[+] Running 4/4
 ✔ Container cloudroadreport-db-1        Healthy                                                          1.1s 
 ✔ Container cloudroadreport-accounts-1  Started                                                          1.6s 
 ✔ Container cloudroadreport-reports-1   Started                                                          1.5s 
 ✔ Container cloudroadreport-frontend-1  Started  
```

This depicts the main four containers invovled in the project, such as database db as database, accounts for backend logic, reports for backend logic and frontend that shows the website and uses nginx to use the accounts and reports endpoints. 

Once it is done loading, you can access the web application with http:<EXTERNAL_IP>:8080, which may be subject to firewall rules.

Additionally, one can verify the accounts health with ```http://<EXTERNAL_IP>:8080/api/accounts/health``` and reports with ```http://<EXTERNAL_IP>:8080/api/reports/health```

In order to visualize specific container information, type ```docker ps``` from the root directory to show the listing of active containers, which looks like such: 
```bash
CONTAINER ID   IMAGE                      COMMAND                  CREATED         STATUS                 PORTS                                     NAMES
cee6784b9e49   cloudroad-frontend:local   "nginx -g 'daemon of…"   5 minutes ago   Up 5 minutes           0.0.0.0:8080->80/tcp, [::]:8080->80/tcp   cloudroadreport-frontend-1
92eeae3cb481   cloudroad-accounts:local   "gunicorn --bind 0.0…"   5 minutes ago   Up 5 minutes           127.0.0.1:5001->8000/tcp                  cloudroadreport-accounts-1
87c988e398b7   cloudroad-reports:local    "gunicorn --bind 0.0…"   5 minutes ago   Up 5 minutes           127.0.0.1:5002->8000/tcp                  cloudroadreport-reports-1
855578bc5a4a   mariadb:11.8               "docker-entrypoint.s…"   21 hours ago    Up 4 hours (healthy)   127.0.0.1:3307->3306/tcp                  cloudroadreport-db-1
```

## Orchestration - Kubernetes
The web application is orchestrated with Kubernetes.

To test with kubernetes, check which project is being used with ```gcloud config get-value project```, and, if necessary, create a cluster that can be utilized for testing this project. Then, scale the nodes using the following command, modifying zone with respect to the clusters' zone and the previuos project id as necessary:
```bash
gcloud container clusters resize road-report-cluster \
  --node-pool=default-pool \
  --num-nodes=3 \
  --zone=ZONE \
  --project=ID
```

Then, . Then, run ```kubectl apply -f kubernetes.yaml``` and wait for the configuration to be applied. Afterwards, type ```kubectl get services``` and wait for the service named frontend of type LoadBalancer to come online. It will generate an EXTERNAL-IP, type http://<EXTERNAL_IP> in the browser. 

## Scalability

## Repliability

## Load balancing

## Rollout and rollback
### Rollout

### Rollback

## Interacting with application
Once installed, there will be no reports already in the database–only configured regions showing that no reports have been made as indicated by the 0s. Since there are no users configured, it is necessary to click on "Register" in the navigation bar with the desired credentials, which will enable the report button "+ Make report". Once clicked, a pop-up opens, allowing the user to choose a suburb, road condition, and time of observation. Once done, click "Submit" and, if the report time was set within the last 12 hours, watch how the suburb table is modified accordingly. Once you are done, click on "Sign Out". If you wish to log in again, use the same credentials to start your session. Please note the session has a duration of six hours, after which signing in again will be necessary to log in again.

Please note: The AI declaration can be found in AI_DECLARATION.md, which was divided to maintain installation simplicity. 