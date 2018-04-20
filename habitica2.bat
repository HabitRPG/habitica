@ECHO OFF

start cmd /k " cd C:\Program Files\MongoDB\Server\3.4\bin\ & mongod"

start cmd /k " cd C:\habitica2\ & npm run client:dev"

start cmd /k " cd C:\habitica2\ & npm start"