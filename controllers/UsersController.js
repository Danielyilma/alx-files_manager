import dbClient from "../utils/db";
import sha1 from "sha1";

async function postNew(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    res.statusCode = 400;
    res.send({ error: "Missing email" });
    return;
  } else if (!password) {
    res.statusCode = 400;
    res.send({ error: "Missing password" });
    return;
  }

  const user = await dbClient.db
    .collection("users")
    .find({ email: email })
    .toArray();

  if (user[0]) {
    res.statusCode = 400;
    res.send({ error: "Already exist" });
    return;
  }

  const data = await dbClient.db.collection("users").insertOne({
    email: email,
    password: sha1(password),
  });
  res.statusCode = 201;
  res.send(JSON.stringify({ id: data.ops[0]._id, email: email }));
}

export { postNew };
