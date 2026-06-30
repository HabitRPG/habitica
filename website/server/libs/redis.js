import IORedis from 'ioredis';

export default function setupRedis (connectionOptions, config) {
  const redisConfig = { ...config };
  if (connectionOptions.username) {
    redisConfig.username = connectionOptions.username;
  }
  if (connectionOptions.password) {
    redisConfig.password = connectionOptions.password;
  }
  if (connectionOptions.db) {
    redisConfig.db = connectionOptions.db;
  }
  let connection;
  const redisUrl = connectionOptions.url;
  if (redisUrl) {
    connection = new IORedis(redisUrl, redisConfig);
  } else {
    connection = new IORedis(connectionOptions.port, connectionOptions.host, redisConfig);
  }
  return connection;
}
