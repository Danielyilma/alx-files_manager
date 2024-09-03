import { Router } from "express";
import { getStats, getStatus } from "../controllers/AppController";
import { postNew } from "../controllers/UsersController";
import {
  getConnect,
  getDisconnect,
  getMe,
} from "../controllers/AuthController";
import Authenticator from "../utils/auth";
import { postUpload } from "../controllers/FilesController";
import { validateFileForm } from "../utils/fileUpload";

const router = Router();

router.get("/status", getStatus);

router.get("/stats", getStats);

router.get("/connect", getConnect);

router.get("/disconnect", Authenticator.isAuthenticated, getDisconnect);

router.get("/users/me", Authenticator.isAuthenticated, getMe);

router.post("/users", postNew);

router.post(
  "/files",
  Authenticator.isAuthenticated,
  validateFileForm,
  postUpload
);

export default router;
