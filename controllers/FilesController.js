import dbClient from "../utils/db";
import { ObjectId } from "mongodb";
import { CreateFileAndSave } from "../utils/fileUpload";

async function postUpload(req, res) {
  const file = req.file;
  if (file.type === "folder") {
    const resData = await dbClient.db.collection("files").insertOne(file);
    res.statusCode = 201;
    res.send(JSON.stringify(resData.ops[0]));
    return;
  }

  const buffer = Buffer.from(req.body.data, "base64");
  let data = null;
  if (file.type === "image") {
    data = buffer;
    console.log(data);
  } else {
    data = buffer.toString();
    console.log(data);
  }

  CreateFileAndSave(file.localPath, data);
  const resData = (await dbClient.db.collection("files").insertOne(file))
    .ops[0];

  delete resData.localPath;
  res.statusCode = 201;
  res.send(JSON.stringify(resData));
}

async function getShow(req, res) {
  const fileId = req.params.id;

  const file = (
    await dbClient.db
      .collection("files")
      .find(
        { userId: req.user._id, _id: ObjectId(fileId) },
        { projection: { localPath: 0 } }
      )
      .toArray()
  )[0];

  if (!file) {
    res.statusCode = 404;
    res.send({ error: "Not found" });
  }

  res.statusCode = 200;
  res.send(JSON.stringify(file));
}

async function getIndex(req, res) {
  const parentId = req.query.parentId ?? 0;
  const page = req.query.page ?? 0;
  const limit = 20;
  const files = await dbClient.db
    .collection("files")
    .find({ userId: req.user._id, parentId }, { projection: { localPath: 0 } })
    .skip(page * limit)
    .limit(limit)
    .toArray();

  res.statusCode = 200;
  res.send(JSON.stringify(files));
}

async function putPublish(req, res) {
  const fileId = req.params.id;

  const updatedFile = await dbClient.db
    .collection("files")
    .updateOne(
      { userId: req.user._id, _id: ObjectId(fileId) },
      { $set: { isPublic: true } },
      { projection: { localPath: 0 } }
    );

  res.statusCode = 200;
  res.send(JSON.stringify({}));
}

async function putUnPublish(req, res) {
  const fileId = req.params.id;

  const updatedFile = await dbClient.db
    .collection("files")
    .updateOne(
      { userId: req.user._id, _id: ObjectId(fileId) },
      { $set: { isPublic: false } },
      { projection: { localPath: 0 } }
    );

  res.statusCode = 200;
  res.send(JSON.stringify({}));
}
export { postUpload, getIndex, getShow, putPublish, putUnPublish };
