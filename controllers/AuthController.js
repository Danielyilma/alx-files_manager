import { v4 as uuidv4 } from 'uuid';
import Authenticator from '../utils/auth';
import redisClient from '../utils/redis';

async function getConnect(req, res) {
  let user = null;

  try {
    user = await Authenticator.authenticate(req);
  } catch (error) {
    res.statusCode = 401;
    res.json({ error: 'Unauthorized' });
    return;
  }

  if (!user) {
    res.statusCode = 401;
    res.json({ error: 'Unauthorized' });
    return;
  }

  const token = uuidv4();
  const key = `auth_${token}`;
  const HOUR_24 = 3600 * 24;
  redisClient.set(key, user._id.toString(), HOUR_24);

  res.statusCode = 200;
  res.json({ token });
}

async function getDisconnect(req, res) {
  const XToken = `auth_${req.headers['x-token']}`;

  await redisClient.del(XToken);
  res.statusCode = 204;
  res.json();
}

async function getMe(req, res) {
  res.statusCode = 200;
  res.json({ email: req.user.email, id: req.user._id });
}

export { getConnect, getDisconnect, getMe };
