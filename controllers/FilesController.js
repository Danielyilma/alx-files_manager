import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import dbClient from '../utils/db';
import { CreateFileAndSave, readFileData } from '../utils/fileUpload';
import abort from '../utils/abort';
import redisClient from '../utils/redis';

async function postUpload(req, res) {
  const { file } = req;
  if (file.type === 'folder') {
    let resData = (await dbClient.db.collection('files').insertOne(file))
      .ops[0];
    resData = { id: resData._id, ...resData };
    delete resData._id;
    res.statusCode = 201;
    res.json(resData);
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
  let resData = (await dbClient.db.collection('files').insertOne(file)).ops[0];

  resData = { id: resData._id, ...resData };
  delete resData.localPath;
  delete resData._id;
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
    abort(res, 404, 'Not found');
    return;
  }

  res.statusCode = 200;
  res.json(file);
}

async function getIndex(req, res) {
  const parentId = req.query.parentId || 0;
  const page = parseInt(req.query.page, 10) || 0;
  const limit = 20;
  let files = await dbClient.db
    .collection('files')
    .find({ userId: req.user._id, parentId: String(parentId) }, { projection: { localPath: 0 } })
    .skip(page * limit)
    .limit(limit)
    .toArray();

  files = files.map((item) => {
    const { _id, ...rest } = item;
    return { id: _id, ...rest };
  });

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

  if (!updatedFile.value) {
    abort(res, 404, 'Not found');
  }

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

  if (!updatedFile.value) {
    abort(res, 404, 'Not found');
  }

  res.statusCode = 200;
  res.json(updatedFile.value || {});
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
    abort(res, 404, 'Not found');
    return;
  }

  if (file.type === 'folder') {
    abort(res, 400, "A folder doesn't have content");
    return;
  }

  if (file.isPublic === true) {
    const data = await readFileData(file.localPath);

    if (!data) {
      abort(res, 404, 'Not found');
      return;
    }

    res.set('content-type', mime.lookup(file.name));
    res.send(data);
    return;
  }

  const XToken = `auth_${req.headers['x-token']}`;
  const userId = await redisClient.get(XToken);

  if (!userId || userId !== file.userId.toString()) {
    abort(res, 404, 'Not found');
    return;
  }

  const data = await readFileData(file.localPath);

  if (!data) {
    abort(res, 404, 'Not found');
    return;
  }

  const contentType = mime.lookup(file.name) || 'application/octet-stream';
  res.set('content-type', contentType);
  res.send(data);
}

export {
  postUpload, getIndex, getShow, putPublish, putUnPublish, getFile,
};
