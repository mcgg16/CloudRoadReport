# Project Installation
## Previous requirements 
This specification assumes that Google's Cloud Engine is being used and a VM and kubernetes cluster are already configured. Additionally, gcloud, kubectl, docker, vim and GKE authentication plugins are installed. Not only that, but the firewall allows HTTP traffic from ports 80 for Kubernetes and 8080 for Compose.

## Set up
Pull repository from GitHub: ```git clone https://github.com/mcgg16/CloudRoadReport && cd CloudRoadReport/```

From the root directory, copy the .env.example file structure to an .env file witb ```cp .env.example .env```, and then type ```vim .env``` to fill in the missing passwords. I will be attaching the .env I used with the Blackboard submission, but will exclude it from this public repo. 

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
The web application is orchestrated with Kubernetes, which orchestrates many containers across the different application hosts.

To test with kubernetes, check which project is being used with ```gcloud config get-value project```, and, if necessary, create a cluster that can be utilized for testing this project–ideally with three initial worker nodes. Otherwise, the existing cluster can be scaled with the following command, where mine is called road-report-cluster and uses default-pool. The cluster is set to three nodes, and the zone is currently configured for Australia with the project ID obtained previously. 
```bash
gcloud container clusters resize road-report-cluster \
  --node-pool=default-pool \
  --num-nodes=3 \
  --zone=australia-southeast2-b \
  --project=project-5472a16f-e6cd-4347-b79
```

Afterwards, connect kubectl to the cluster 
```bash
gcloud container clusters get-credentials road-report-cluster \
  --zone=australia-southeast2-b \
  --project=project-5472a16f-e6cd-4347-b79
```

Then, run the following command to create the database configuration map from CloudRoadReport to use the correct ports and passwords:
```bash
kubectl create configmap road-db-init \
  --from-file=01-init.sql=database/init.sql \
  --dry-run=client -o yaml \
  | kubectl apply -f -
```

Afterwards, run ```bash k8s/setup_session_secret.sh```, which is used by the accounts microservice to store users' session after logging in and creating an account, enabling or disabling the report button and deciding whether to show the "Log in" and "Register" redirections or a "Log Out" for those with an active session. The session is also used by the reports microservice to ensure that only users with an active session can generate a road report. 

To set up the DB_PASSWORD and DB_ROOT_PASSWORD in the cluster, type 
```
kubectl create secret generic road-db-secret \
  --from-literal=DB_PASSWORD='road_local_password' \
  --from-literal=DB_ROOT_PASSWORD='root_local_password'
```

### Note: Images in registry
Please note, the images may need to be part of the artifact registry to be used by the kubernetes.yaml file. If there is an error, rebuild the images, tag them, and push with the following commands from the root project directory: s

#### Accounts
```docker compose build accounts``` to build the accounts image
```docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v5"``` to tag the image as version 5, note that I am usng my project id for this. 
```docker push "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v5"``` to push the tagged image to the artifact registry. 

#### Reports
```docker compose build reports``` to build the reports image
```docker tag cloudroad-reports:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/reports:v3"``` to tag the image as version 3, note that I am usng my project id for this. 
```docker push "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/accounts:v5"``` to push the tagged image to the artifact registry. 

#### Frontend
```docker compose build frontend``` to build the accounts image
```docker tag cloudroad-accounts:local "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend:v5"``` to tag the image as version 5, note that I am usng my project id for this. 
```docker push "australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend:v5"``` to push the tagged image to the artifact registry. 

### Applying configuration 
Then, run from the project root directory```kubectl apply -f "k8s/kubernetes.yaml"``` and wait for the configuration to be applied. 

Afterwards, type ```kubectl get services``` and wait for the service named frontend of type LoadBalancer to come online. It will generate an EXTERNAL-IP, type http://<EXTERNAL_IP> in the browrser. For example, I can access the application with ```http://34.129.175.8```
```bash 
NAME         TYPE           CLUSTER-IP       EXTERNAL-IP    PORT(S)        AGE
accounts     ClusterIP      34.118.237.169   <none>         8000/TCP       2d1h
db           ClusterIP      None             <none>         3306/TCP       2d14h
frontend     LoadBalancer   34.118.237.26    34.129.175.8   80:32394/TCP   2d1h
kubernetes   ClusterIP      34.118.224.1     <none>         443/TCP        2d19h
reports      ClusterIP      34.118.230.219   <none>         8000/TCP       2d1h
```

Get the pods with ```kubectl get pods```, which should show one replica for the db, and two for accounts, frontend and reports.  
```bash
kubectl get pods
NAME                        READY   STATUS    RESTARTS        AGE
accounts-6987dd94d5-7t92n   1/1     Running   0               4h35m
accounts-6987dd94d5-gb9q2   1/1     Running   0               4h35m
db-0                        1/1     Running   0               4h35m
frontend-56b66b5ff9-mlcmp   1/1     Running   1 (4m29s ago)   4h35m
frontend-56b66b5ff9-sn8jf   1/1     Running   1 (4m29s ago)   4h35m
reports-69c85dcc4c-r8mx8    1/1     Running   0               4h35m
reports-69c85dcc4c-vttmw    1/1     Running   0               4h35m
```

## Scalability
The kubernetes.yaml is currently configured to two replicas, but they can be manually scaled with the following command to test that functionality. Type ```kubectl scale deployment reports --replicas=3``` to set to only three replicas, and ```kubectl get pods``` should show how there are now three pods that start with reports in their name; it may be necessary to wait a bit for it to come online, in this case it is the pod ```reports-69c85dcc4c-c9qjz```. 
```bash 
NAME                        READY   STATUS    RESTARTS        AGE
accounts-6987dd94d5-7t92n   1/1     Running   0               4h38m
accounts-6987dd94d5-gb9q2   1/1     Running   0               4h39m
db-0                        1/1     Running   0               4h38m
frontend-56b66b5ff9-mlcmp   1/1     Running   1 (7m49s ago)   4h39m
frontend-56b66b5ff9-sn8jf   1/1     Running   1 (7m49s ago)   4h38m
reports-69c85dcc4c-c9qjz    1/1     Running   0               57s
reports-69c85dcc4c-r8mx8    1/1     Running   0               4h38m
reports-69c85dcc4c-vttmw    1/1     Running   0               4h38m
```

Then, restore the previous configuration with ```kubectl scale deployment reports --replicas=2``` to see how manual scaling takes place. 

## Reliability
View the accounts pods that are currently listed with ```kubectl get pods -l app=accounts```: 
```bash
NAME                        READY   STATUS    RESTARTS   AGE
accounts-6987dd94d5-7t92n   1/1     Running   0          4h40m
accounts-6987dd94d5-gb9q2   1/1     Running   0          4h40m
```

Then, copy one of the names and delete it with ```kubectl delete pod accounts-6987dd94d5-gb9q2```, and then run ```kubectl get pods -l app=accounts``` again to see how a new pod was created replacing the second one, demonstrating reliability when a node goes down. 
```bash
NAME                        READY   STATUS    RESTARTS   AGE
accounts-6987dd94d5-7t92n   1/1     Running   0          4h41m
accounts-6987dd94d5-cct5n   1/1     Running   0          36s
``` 

## Load balancing
Load balancing is visible by typing ```kubectl get service frontend``` to isolate only the frontend service, which also shows its external IP that can be used to access the web application frontend, and the internal services defined distribute the connections between the service and account replicas. 
```bash
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)        AGE
frontend   LoadBalancer   34.118.237.26   34.129.175.8   80:32394/TCP   2d1h
```

## Rollout and rollback
View the past rollouts with ```kubectl rollout history deployment/frontend```
```bash
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
3         <none>
4         <none>
7         <none>
9         <none>
10        <none>
11        <none>
```

I will restore to the first version with ```kubectl set image deployment/frontend frontend=australia-southeast2-docker.pkg.dev/project-5472a16f-e6cd-4347-b79/road-report/frontend:v1``` and manually refresh the window on the LoadBalancer external IP. This will take it back to the first verion that does not show table reports, nor does it have any functionalities besides basic navigation between the login, create account, and home page. 

To return it to the previuos version, type ```kubectl rollout undo deployment/frontend --to-revision=11``` with my last revision beign the 11th. 

The kubernetes.yaml is configured to always pull the most recent images for frontend, accounts, and services. When the code is changed, it is necessary to rebuild, retag, and push the new images with a version that matches one established in the kubernetes.yaml images specified. 

## Interacting with application
Once installed, there will be no reports already in the database–only configured regions showing that no reports have been made as indicated by the 0s. Since there are no users configured, it is necessary to click on "Register" in the navigation bar with the desired credentials, which will enable the report button "+ Make report". Once clicked, a pop-up opens, allowing the user to choose a suburb, road condition, and time of observation. Once done, click "Submit" and, if the report time was set within the last 12 hours, watch how the suburb table is modified accordingly. Once you are done, click on "Sign Out". If you wish to log in again, use the same credentials to start your session. Please note the session has a duration of six hours, after which signing in again will be necessary to log in again.

Please note: The AI declaration can be found in AI_DECLARATION.md, which was divided to maintain installation simplicity. 