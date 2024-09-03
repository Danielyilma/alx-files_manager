import dbClient from "../utils/db";

async function postUpload(req, res) {
  const file = req.file;
  if (file.type === "folder") {
    const resData = await dbClient.db.collection("files").insertOne(file);
    res.statusCode = 201;
    res.send(JSON.stringify(resData.ops[0]));
    return;
  }

  const resData = await dbClient.db.collection("files").insertOne(file);

  console.log();
}

export { postUpload };
