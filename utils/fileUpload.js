import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { promisify } from 'util';
import dbClient from './db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function validateFileForm(req, res, next) {
  const FILETYPE = ['folder', 'file', 'image'];
  const {
    name, type, parentId = 0, isPublic = false, data,
  } = req.body;

  if (!name) {
    res.statusCode = 400;
    res.send(JSON.stringify({ error: 'Missing name' }));
    return;
  }

  if (!(type || FILETYPE.includes(type))) {
    res.statusCode = 400;
    res.send(JSON.stringify({ error: 'Missing type' }));
    return;
  }

  if (type !== 'folder' && !data) {
    res.statusCode = 400;
    res.send(JSON.stringify({ error: 'Missing data' }));
    return;
  }

  if (parentId !== 0) {
    const pFile = (
      await dbClient.db
        .collection('files')
        .find({ _id: ObjectId(parentId) })
        .toArray()
    )[0];

    if (!pFile) {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Parent not found' }));
      return;
    }

    if (pFile.type !== 'folder') {
      res.statusCode = 400;
      res.send(JSON.stringify({ error: 'Parent is not a folder' }));
      return;
    }
  }

  req.file = {
    userId: req.user._id,
    name,
    type,
    isPublic,
    parentId,
  };

  if (type !== 'folder') {
    req.file.localPath = `${FOLDER_PATH}/${uuidv4()}`;
  }

  next();
}

function CreateFileAndSave(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

async function readFileData(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const readFile = promisify(fs.readFile);
    return readFile(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}
export { validateFileForm, CreateFileAndSave, readFileData };
