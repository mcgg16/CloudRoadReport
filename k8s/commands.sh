# Deploy/updates kubernetes objects
kubectl apply -f kubernetes.yaml

# Display pods and stateful sets 
kubectl get pods
kubectl get statefulSet

# Display PVC
kubectl get pvc