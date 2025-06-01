import express from 'express';
import {getUser} from "../controllers/userController";

const router = express.Router();

// GET /api/users
router.get('/', getUser);

export default router;
