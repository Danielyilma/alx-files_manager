import dbClient from "./db";
import { v4 as uuidv4 } from "uuid";

const FOLDER_PATH = process.env.FOLDER_PATH ?? "/tmp/file_manager";

async function validateFileForm(req, res, next) {
  const FILETYPE = ["folder", "file", "image"];
  const name = req.body.name;
  const type = req.body.type;
  const parentId = req.body.parentId ?? 0;
  const isPublic = req.body.isPublic ?? false;
  const data = req.body.data;

  if (!name) {
    req.statusCode = 400;
    req.send(JSON.stringify({ error: "Missing name" }));
    return;
  }

  if (!(type || FILETYPE.includes(type))) {
    req.statusCode = 400;
    req.send(JSON.stringify({ error: "Missing type" }));
    return;
  }

  if (type !== "folder" && !data) {
    req.statusCode = 400;
    req.send(JSON.stringify({ error: "Missing data" }));
    return;
  }

  if (parentId != 0) {
    const pFile = await dbClient.db
      .collection("files")
      .find({ parentId })
      .toArray();

    if (!pFile) {
      req.statusCode = 400;
      req.send(JSON.stringify({ error: "Parent not found" }));
      return;
    }

    if (pFile.type !== "folder") {
      req.statusCode = 400;
      req.send(JSON.stringify({ error: "Parent is not a folder" }));
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

  if (type !== "folder") {
    file["localPath"] = FOLDER_PATH + "/" + uuidv4();
  }

  next();
}

async function CreateFileAndSave(path, data) {}

export { validateFileForm, CreateFileAndSave };
