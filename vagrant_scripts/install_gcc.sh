echo Adding PPA repository for gcc...
add-apt-repository ppa:ubuntu-toolchain-r/test
apt-get update -qq

echo Installing gcc 4.8...
apt-get install -qq gcc-4.8 g++-4.8

update-alternatives --remove-all gcc
update-alternatives --remove-all g++
update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 20
update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 20
update-alternatives --config gcc
update-alternatives --config g++
