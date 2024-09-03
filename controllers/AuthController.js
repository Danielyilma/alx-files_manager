import Authenticator from "../utils/auth";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import { v4 as uuidv4 } from "uuid";

async function getConnect(req, res) {
  const user = await Authenticator.authenticate(req);

  if (!user) {
    res.statusCode = 401;
    res.send(JSON.stringify({ error: "Unauthorized" }));
  }

  const token = uuidv4();
  const key = "auth_" + token;
  const HOUR_24 = 3600 * 24;
  redisClient.set(key, user._id.toString(), HOUR_24);

  res.statusCode = 200;
  res.send(JSON.stringify({ token: token }));
}

async function getDisconnect(req, res) {
  const X_token = "auth_" + req.headers["x-token"];

  await redisClient.del(X_token);
  res.statusCode = 204;
  res.send();
}

async function getMe(req, res) {
  res.statusCode = 200;
  res.send(JSON.stringify({ email: req.user.email, id: req.user._id }));
}

export { getConnect, getDisconnect, getMe };
