
# Habitica
[Habitica](https://habitica.com) is an open source habit building program which treats your life like a Role Playing Game. Level up as you succeed, lose HP as you fail, earn money to buy weapons and armor.

We need more programmers! Your assistance will be greatly appreciated.

For an introduction to the technologies used and how the software is organized, refer to [Guidance for Blacksmiths](http://habitica.fandom.com/wiki/Guidance_for_Blacksmiths).

To set up a local install of Habitica for development and testing on various platforms, see [Setting up Habitica Locally](http://habitica.fandom.com/wiki/Setting_up_Habitica_Locally).

## TL;DR;
```bash
$ helm install --name habitica --namespace habitica .
```

> **Tip**: List all releases using `helm list`
## Introduction
This chart bootstraps [Habitica](https://github.com/HabitRPG/habitica) deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.4+ with Beta APIs enabled
- PV provisioner support in the underlying infrastructure

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```bash
$ helm delete my-release
```

## Configure Ingress
Habitica can exposed externally using the [NGINX Ingress Controller](https://github.com/kubernetes/ingress-nginx). To do so, it's necessary to:

- Install the Habitica chart setting the parameter `habitica.ingress.enabled=true`.

