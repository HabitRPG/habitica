## Vagrant ##

Vagrant is a system to create reproducible and portable development
environments. Because of the variety of systems used for HabitRPG
development and the various issues developers may encounter setting up
HabitRPG on them, vagrant provides a single development enviroment with
minimal dependencies on the developer's local platform.

To use Vagrant, go to [their downloads
page](http://www.vagrantup.com/downloads.html) and download and install
the software appropriate for your system.

Once Vagrant has been installed, issue the following commands to get the
environment up and running:

1. Fork and Clone the HabitRPG git repository
2. Boot up the box:

   `vagrant up`

3. Login to the environment:

   `vagrant ssh`

4. Once you're on the vagrant machine, change to your working directory:

   `cd /vagrant`

   You should see all the files from the git repository here.

5. Start the system:

   `npm start`

## Automatic Startup ##

You can opt to have the initial `vagrant up` command start the entire
system. If you choose to do so, edit the file Vagrantfile in your
HabitRPG directory, and remove the '#' in front of the

> `#config.vm.provision :shell, :path => "vagrant.sh"`

Once the system is up and running, you will need to open another shell to run
`vagrant ssh`
