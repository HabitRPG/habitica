# -*- mode: ruby -*-
# vi: set ft=ruby :

# The vagrant config for HabitRPG. Requires vagrant on your local machine.
# The box fetched will be precise64 located:
#    http://files.vagrantup.com/precise64.box

Vagrant.configure("2") do |config|
  config.vm.box = "habitrpg"
  config.vm.network "forwarded_port", guest: 3000, host: 3000
end
