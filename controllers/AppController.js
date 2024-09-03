import dbClient from '../utils/db';
import redisClient from '../utils/redis';

function getStatus(req, res) {
  const data = { redis: true, db: true };

  data.redis = redisClient.isAlive();
  data.db = dbClient.isAlive();

  res.statusCode = 200;
  res.send(JSON.stringify(data));
}

async function getStats(req, res) {
  res.statusCode = 200;
  const respData = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };

  res.send(JSON.stringify(respData));
}

export { getStats };
export { getStatus };
