# Vagrant #

Vagrant is a system to create reproducible and portable development
environments. Because of the variety of systems used for HabitRPG
development and the various issues developers may encounter setting up
HabitRPG on them, vagrant provides a single development enviroment with
minimal dependencies on the developer's local platform.

To use Vagrant, go to [their downloads
page](http://www.vagrantup.com/downloads.html) and download and install
the software appropriate for your system. Using HabitRPG's vagrant image
requires a minimum of Vagrant version 1.5.

Once Vagrant has been installed, issue the following commands to get the
environment up and running:

1. Fork and Clone the HabitRPG git repository
2. Create a config file from the sample config:

   `cp config.json.example config.json`

3. Edit the `ADMIN_EMAIL`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_SERVICE` values in config.json.

4. Boot up the box:

   `vagrant up`

This step may take a while, and you may see various warnings scroll up
your screen. If you encounter failures at step 6 or 7, make a note of
any failures, and submit them as a bug (see below)

5. Login to the environment:

   `vagrant ssh`

6. Once you're on the vagrant machine, start the system:

   `npm start`

7. Open a browser to `http://localhost:3000`

If you encounter any difficulties getting your Vagrant environment up
and running, [file a bug on
Github](https://github.com/HabitRPG/habitrpg/issues/new) and mention
'@thepeopleseason' in the body of your bug report.

## Automatic Startup ##

You can opt to have the initial `vagrant up` command start the entire
system. If you choose to do so, edit the file Vagrantfile in your
HabitRPG directory, and remove the '#' in front of the line

> # autostart_habitrpg

Once the system is up and running, you will need to open another shell
to run `vagrant ssh`, and you won't be able to interactively reload the
server. Because of these deficiencies, you should only autostart the
server if you know what you're doing.

## Notes ##

By default, running the HabitRPG server will show up on your local
machine on port 3000. If you already have port 3000 mapped to another
service, however, vagrant will use another port between 3000 and 3050 to
forward traffic to the virtual machine.

In creating the vagrant environment, a configuration option
automatically changes the working directory to /vagrant (the location of
the HabitRPG source) on login. If you do not wish to login to vagrant
with that default directory, edit /home/vagrant/.bashrc to remove the
final line ('cd /vagrant').
