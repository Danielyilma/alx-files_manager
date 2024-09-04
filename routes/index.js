import { Router } from 'express';
import { getStats, getStatus } from '../controllers/AppController';
import postNew from '../controllers/UsersController';
import {
  getConnect,
  getDisconnect,
  getMe,
} from '../controllers/AuthController';
import Authenticator from '../utils/auth';
import {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnPublish,
  getFile,
} from '../controllers/FilesController';
import { validateFileForm } from '../utils/fileUpload';

const router = Router();

router.get('/status', getStatus);

router.get('/stats', getStats);

router.get('/connect', getConnect);

router.get('/disconnect', Authenticator.isAuthenticated, getDisconnect);

router.get('/users/me', Authenticator.isAuthenticated, getMe);

router.get('/files/:id', Authenticator.isAuthenticated, getShow);

router.get('/files', Authenticator.isAuthenticated, getIndex);

router.get('/files/:id/data', getFile);

router.post('/users', postNew);

router.post(
  '/files',
  Authenticator.isAuthenticated,
  validateFileForm,
  postUpload,
);

router.put('/files/:id/publish', Authenticator.isAuthenticated, putPublish);

router.put('/files/:id/unpublish', Authenticator.isAuthenticated, putUnPublish);

export default router;
