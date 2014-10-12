# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "thepeopleseason/habitrpg"
  config.ssh.forward_agent = true

  config.vm.hostname = "habitrpg"
  config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
  config.vm.usable_port_range = (3000..3050)
  config.vm.provision :shell, :path => "vagrant.sh"
end
