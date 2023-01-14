# Passo a passo para rodar

## Ambiente de desenvolvimento

1. sudo service mongod stop
2. echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
3. sudo sysctl -p
4. npm run mongo:dev
5. npm start
6. npm run client:dev 

## Testes

* unitarios: npm run test:api:unit