# KEDA External Scaler Node

This is an example of a external scaler written using Node JS.

# Steps

Deploy the scaler in the keda namespace

```sh
kubectl apply -f k8s/
```

The scaler uses mongodb and therefore we will deploy an instance of MongoDB to a new namespace

```sh
kubectl create ns keda-external-scaler-test

helm install stable/mongodb --name keda-mongo --namespace keda-external-scaler-test
```

We will deploy a test application that we'll use to test the scaler
```sh

export MONGODB_ROOT_PASSWORD=$(kubectl get secret \
    --namespace keda-external-scaler-test keda-mongo-mongodb \
    -o jsonpath="{.data.mongodb-root-password}" | base64 --decode)

export MONGO_URL="mongodb://root:${MONGODB_ROOT_PASSWORD}@keda-mongo-mongodb.keda-external-scaler-test.svc.cluster.local"

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-consumer
  namespace: keda-external-scaler-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sample-consumer
  template:
    metadata:
      labels:
        app: sample-consumer
    spec:
      containers:
      - name: sample-consumer
        image: nginx
        env:
        - name: MONGO_CONNECTION_STRING
          value: ${MONGO_URL}
EOF
```

We will now create the scaled object that will use the external scaler

```sh
cat <<EOF | kubectl apply -f -
apiVersion: keda.k8s.io/v1alpha1
kind: ScaledObject
metadata:
  name: external-scaler-scaledobject
  namespace: keda-external-scaler-test
  labels:
    deploymentName: sample-consumer
spec:
  scaleTargetRef:
    deploymentName: sample-consumer
  triggers:
  - type: external
    metadata:
      # Required
      serviceURI: keda-external-scaler-nodejs:50051
      # Optional
      connectionString: MONGO_CONNECTION_STRING
      db: sample
      collectionName: customers
      length: "3"
EOF
```

Login into MongoDB using the credentials and insert a few records

```sh

```