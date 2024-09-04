import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import dbClient from '../utils/db';
import { CreateFileAndSave, readFileData } from '../utils/fileUpload';
import Authenticator from '../utils/auth';

async function postUpload(req, res) {
  const { file } = req;
  if (file.type === 'folder') {
    const resData = await dbClient.db.collection('files').insertOne(file);
    res.statusCode = 201;
    res.json(resData.ops[0]);
    return;
  }

  const buffer = Buffer.from(req.body.data, 'base64');
  let data = null;
  if (file.type === 'image') {
    data = buffer;
    console.log(data);
  } else {
    data = buffer.toString();
    console.log(data);
  }

  CreateFileAndSave(file.localPath, data);
  const resData = (await dbClient.db.collection('files').insertOne(file))
    .ops[0];

  delete resData.localPath;
  res.statusCode = 201;
  res.json(resData);
}

async function getShow(req, res) {
  const fileId = req.params.id;

  const file = (
    await dbClient.db
      .collection('files')
      .find(
        { userId: req.user._id, _id: ObjectId(fileId) },
        { projection: { localPath: 0 } },
      )
      .toArray()
  )[0];

  if (!file) {
    res.statusCode = 404;
    res.json({ error: 'Not found' });
  }

  res.statusCode = 200;
  res.json(file);
}

async function getIndex(req, res) {
  const { parentId = 0, page = 0 } = req.query;
  const limit = 20;
  const files = await dbClient.db
    .collection('files')
    .find({ userId: req.user._id, parentId }, { projection: { localPath: 0 } })
    .skip(page * limit)
    .limit(limit)
    .toArray();

  res.statusCode = 200;
  res.json(files);
}

async function putPublish(req, res) {
  const fileId = req.params.id;

  const updatedFile = await dbClient.db.collection('files').findOneAndUpdate(
    { userId: req.user._id, _id: ObjectId(fileId) },
    { $set: { isPublic: true } },
    {
      projection: { localPath: 0 },
      returnDocument: 'after',
    },
  );

  res.statusCode = 200;
  res.json(updatedFile.value || {});
}

async function putUnPublish(req, res) {
  const fileId = req.params.id;

  const updatedFile = await dbClient.db.collection('files').findOneAndUpdate(
    { userId: req.user._id, _id: ObjectId(fileId) },
    { $set: { isPublic: false } },
    {
      projection: { localPath: 0 },
      returnDocument: 'after',
    },
  );

  res.statusCode = 200;
  res.send(JSON.stringify(updatedFile.value || {}));
}

async function getFile(req, res) {
  const fileId = req.params.id;
  const file = (
    await dbClient.db
      .collection('files')
      .find({ _id: ObjectId(fileId) })
      .toArray()
  )[0];

  if (!file) {
    res.statusCode = 404;
    res.json({ error: 'Not found' });
    return;
  }

  if (file.type === 'folder') {
    res.statusCode = 400;
    res.json({ error: "A folder doesn't have content" });
    return;
  }

  if (file.isPublic === true) {
    const data = await readFileData(file.localPath);
    res.set('content-type', mime.lookup(file.name));
    res.send(data);
    return;
  }

  const user = await Authenticator.authenticate(req);

  if (!user) {
    res.statusCode = 404;
    res.json({ error: 'Not found' });
    return;
  }

  if (user._id.toString() === file.userId) {
    res.statusCode = 404;
    res.json({ error: 'Not found' });
    return;
  }

  const data = await readFileData(file.localPath);
  res.set('content-type', mime.lookup(file.name));
  res.send(data);
}

export {
  postUpload, getIndex, getShow, putPublish, putUnPublish, getFile,
};
