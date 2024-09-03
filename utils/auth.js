import sha1 from "sha1";
import dbClient from "./db";
import redisClient from "./redis";
import { ObjectId } from "mongodb";

class Authenticate {
  getAuthHeader(request) {
    const authKey = request.headers.authorization.split(" ")[1];
    const buf = Buffer.from(authKey, "base64");
    const authHeader = buf.toString().split(":");

    return {
      email: authHeader[0],
      password: authHeader[1],
    };
  }

  checkPassword(password, hashed_password) {
    const new_hash = sha1(password);

    return new_hash === hashed_password;
  }

  async authenticate(request) {
    const data = this.getAuthHeader(request);
    const user = await dbClient.db
      .collection("users")
      .find({ email: data.email })
      .toArray();

    if (this.checkPassword(data.password, user[0].password)) {
      return user[0];
    }

    return null;
  }

  async isAuthenticated(req, res, next) {
    const X_token = "auth_" + req.headers["x-token"];
    const user_id = await redisClient.get(X_token);
    const user = await dbClient.db
      .collection("users")
      .find({ _id: ObjectId(user_id) })
      .toArray();

    if (!user[0]) {
      res.statusCode = 401;
      res.send(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    req.user = user[0];

    next();
  }
}

const Authenticator = new Authenticate();

export default Authenticator;
