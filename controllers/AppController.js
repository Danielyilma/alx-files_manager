import dbClient from "../utils/db";
import redisClient from "../utils/redis";

function getStatus(req, resp) {
  const data = { redis: true, db: true };

  data.redis = redisClient.isAlive();
  data.db = dbClient.isAlive();

  resp.statusCode = 200;
  resp.send(JSON.stringify(data));
}

async function getStats(req, resp) {
  resp.statusCode = 200;
  const respData = {
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  };

  resp.send(JSON.stringify(respData));
}

export { getStats };
export { getStatus };
