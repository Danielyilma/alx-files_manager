import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

class Authenticator {
  static getAuthHeader(request) {
    const authKey = request.headers.authorization.split(' ')[1];
    const buf = Buffer.from(authKey, 'base64');
    const authHeader = buf.toString().split(':');

    return {
      email: authHeader[0],
      password: authHeader[1],
    };
  }

  static checkPassword(password, hashedPassword) {
    const newHash = sha1(password);

    return newHash === hashedPassword;
  }

  static async authenticate(request) {
    const data = this.getAuthHeader(request);
    const user = await dbClient.db
      .collection('users')
      .find({ email: data.email })
      .toArray();

    if (!user[0]) {
      return null;
    }

    if (this.checkPassword(data.password, user[0].password)) {
      return user[0];
    }

    return null;
  }

  static async isAuthenticated(req, res, next) {
    const XToken = `auth_${req.headers['x-token']}`;
    const userId = await redisClient.get(XToken);
    const user = (
      await dbClient.db
        .collection('users')
        .find({ _id: ObjectId(userId) })
        .toArray()
    )[0];

    if (!user) {
      res.statusCode = 401;
      res.send(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    req.user = user;

    next();
  }
}

export default Authenticator;
