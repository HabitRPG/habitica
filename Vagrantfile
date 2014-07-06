# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "habitrpg"
  config.ssh.forward_agent = true

  config.vm.hostname = "habitrpg"
  config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
  config.vm.usable_port_range = (3000..3050)
  config.vm.provision :shell, :path => "vagrant.sh"

  # http://www.stefanwrobel.com/how-to-make-vagrant-performance-not-suck
  # also http://docs.vagrantup.com/v2/synced-folders/nfs.html
  # Required for NFS to work, pick any local IP
  config.vm.network :private_network, ip: '192.168.50.50'
  # Use NFS for shared folders for better performance
  config.vm.synced_folder '.', '/vagrant', nfs: true

  # http://www.stefanwrobel.com/how-to-make-vagrant-performance-not-suck
  # Use all CPU cores and 1/4 system memory
  config.vm.provider "virtualbox" do |v|
    host = RbConfig::CONFIG['host_os']
    # Give VM 1/4 system memory & access to all cpu cores on the host
    if host =~ /darwin/
      cpus = `sysctl -n hw.ncpu`.to_i
      # sysctl returns Bytes and we need to convert to MB
      mem = `sysctl -n hw.memsize`.to_i / 1024 / 1024 / 4
    elsif host =~ /linux/
      cpus = `nproc`.to_i
      # meminfo shows KB and we need to convert to MB
      mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i / 1024 / 4
    else # sorry Windows folks, I can't help you
      cpus = 2
      mem = 1024
    end
    v.customize ["modifyvm", :id, "--memory", mem]
    v.customize ["modifyvm", :id, "--cpus", cpus]
  end

end
