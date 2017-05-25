# Habitica in Kubernetes
This is a set of sample Kubernetes configuration files to launch Habitica under AWS, both as a single-node web frontend as well as a multi-node web frontend.

## Prerequisites
* An AWS account.
* A working Kubernetes installation.
* A basic understanding of how to use Kubernetes. https://kubernetes.io/
* A persistent volume for MongoDB data.
* Docker images of Habitica.
  + You can use your own, or use the one included in the YAML files.
  + If you use your own, you'll need a fork of the Habitica GitHub repo and your own Docker Hub repo, both of which are free.

## Before you begin
1. Set up Kubernetes.
2. Create an EBS volume for MongoDB data.
   + Make a note of the name, you'll need it later.

## Starting MongoDB
1. Edit mongo.yaml
  + Find the volumeID line.
  + Change the volume to the one created in the section above.
2. Run the following commands:
  + `kubectl.sh create -f mongo.yaml`
  + `kubectl.sh create -f mongo-service.yaml`
3. Wait for the MongoDB pod to start up.

## Starting a Single Web Frontend

1. Run the following commands:
  + `kubectl.sh create -f habitica.yaml`
  + `kubectl.sh create -f habitica-service.yaml`
2. Wait for the frontend to start up.

## Starting Multi-node Web Frontend
1. Run the following commands :
  + `kubectl.sh create -f habitica-rc.yaml`
  + `kubectl.sh create -f habitica-service.yaml`
2. Wait for the frontend to start up.

## Accessing Your Habitica web interface
Using `kubectl describe svc habiticaweb` get the hostname generated for the Habitica service. Open a browser and go to http://hostname:3000 to access the web front-end for the installations above.

## Shutting down
Shutting down is basically done by reversing the steps above:
+ `kubectl.sh delete -f habitica-service.yaml`
+ `kubectl.sh delete -f habitica.yaml (or habitica-rc.yaml)`
+ `kubectl.sh delete -f mongo-service.yaml`
+ `kubectl.sh delete -f mongo.yaml`

You can also just shut down all of Kubernetes as well.

## Notes
+ MongoDB data will be persistent! If you need to start with a fresh database, you'll need to remove the volume and re-create it.
+ On AWS, you probably want to use at least t2.medium minion nodes for Kubernetes. The default t2.small is too small for more than two Habitica nodes.

## Future Plans
+ Multi-node MongoDB.
+ Monitoring
+ Instructions for a better hostname. The default generated ones stink.
+ More to come....
