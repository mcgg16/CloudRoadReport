# CloudRoadReport
Project for INFS3208 class

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
https://amlanscloud.com/reactappdeploy/ MORE DEPLOYMENTS kubernetes im tired
https://kubernetes.io/docs/concepts/workloads/controllers/statefulset Stateful set