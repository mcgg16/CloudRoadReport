# Project Installation
Open virtual machine 

Pull repository from GitHub: ```bash git pull ```

Type cd/CloudRoadReport

For local testing, ```docker compose build``` to build the services, then ```docker compose up -d``` and access via http:<EXTERNAL_IP>:8080. 

To test with kubernetes, ```cd k8s``` and generate session secret token with ```script for secret.sh```, then ```kubectl apply -f kubernetes.yaml``` to initiate the service. Type ```kubectl get services``` and check the external IP address assigned to LOAD BALANCER pod, and access the website with http:<LOAD_BALANCER_EXTERNAL> to interact with the website. 

# AI Declaration
## TODO 

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

https://bytebytego.com/guides/what-does-a-typical-microservice-architecture-look-like/ Diagram
https://www.geeksforgeeks.org/system-design/microservices/ Diagram 