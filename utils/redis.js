import { createClient } from "redis";
import { promisify } from "util";

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on("error", () => {
      console.log("redis client is not connected");
      this.client.connected = false;
    });

    this.client.on("connect", () => {
      this.client.connected = true;
    });
  }

  isAlive() {
    if (this.client.connected) {
      return true;
    } else {
      return false;
    }
  }

  async get(key) {
    return await promisify(this.client.get).bind(this.client)(key);
  }

  async set(key, value, duration) {
    await promisify(this.client.setex).bind(this.client)(key, duration, value);
  }

  async del(key) {
    await promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
