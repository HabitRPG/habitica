Vagrant
===============

Vagrant is a system to create reproducible and portable development
environments. Because of the variety of systems used for HabitRPG
development and the various issues developers may encounter setting up
HabitRPG on them, vagrant can provide a single development environment
no matter the developer's platform.

To use Vagrant, go to [their downloads
page](http://www.vagrantup.com/downloads.html) and download and install
the software appropriate for your system.

Once Vagrant has been installed, issue the following commands to get the
environment up and running:

1. Download the vagrant box:
`vagrant box add habitrpg http://dl.dropboxusercontent.com/u/4309797/devel/habitrpg/package.box`
2. Initialize the vagrant box:
`vagrant init`
3. Boot up and provision the software on the box:
`vagrant up`
4. Login to the environment:
`vagrant ssh`

The HabitRPG files will be located under `/vagrant' on the filesystem.
