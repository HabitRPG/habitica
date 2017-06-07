# HabitaRPG in Kubernetes
This is a set of sample kubernetes configuration files to launch
habitica under aws, both as a single-node web frontent as well as
multi-node web frontend.

## Prerequisites
* An AWS account
* A working kubernetes installation.
* A basic understanding of how to use kubernetes.
* A persistant volume for Mongo DB data.
* Docker images of habitica.
  + You can use your own, or use mine as specified in the yaml files.
  + If you use your own, you'll need a fork of the habitrpg github
    repo and your own dockerhub repo, both of which are free.


## Before you begin
1. Set up Kubernetes.
2. Create an EBS volume for MongoDB data.
   + Make a note of the name, you'll need it later.

## Starting MongoDB
1. Edit mongo.yaml
  1. Find the volumeID line.
  2. Change the volume to the one created in the section above.
2. Run the following commands :
  - kubectl.sh create -f mongo.yaml
  - kubectl.sh create -f mongo-service.yaml
3. Grab some coffee and wait for the mongodb pod to start up. Don't
   worry, it's fast. 

## Starting a Single Web Frontend

1. Run the following commands :
  + kubectl.sh create -f habitica.yaml
  + kubectl.sh create -f habitica-service.yaml
2. Grab more coffee while the web front end starts up.
  
## Starting Multi-node Web Frontend
1. Run the following commands :
  + kubectl.sh create -f habitica-rc.yaml
  + kubectl.sh create -f habitica-service.yaml
2. Grab even **more** more coffee while the web front end starts up.

## Accessing Your Habitica web interface
Using "kubectl describe svc habiticaweb" get the hostname generated
for the habitica service. Open a browser and go to *hostname:3000* to
access the web front-end for the installations above.

## Shutting down
Shutting down is basically done by reversing the steps above:
+ kubectl.sh delete -f habitica-service.yaml
+ kubectl.sh delete -f habitica.yaml (or habitica-rc.yaml)
+ kubectl.sh delete -f mongo-service.yaml
+ kubectl.sh delete -f mongo.yaml

You can also just shut down all of kubernetes as well.

## Notes
+ MongoDB data will be persistant! If you need to start with a fresh
  database, you'll need to remove the volume and re-create it.
+ You probably want to use at least t2.medium minion nodes for
  kubernetes. The default t2.small is too small for more than 2
  habitica nodes.

## Future Plans
+ Multi-node mongodb.
+ Monitoring
+ Instructions for a better hostname. The default generated ones
  stink. 
+ More to come....
