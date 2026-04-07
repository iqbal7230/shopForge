
import { Router } from "express";
import { login, signin } from "../controller/auth.controller.js";

const router = Router();

router.post('/register', signin);
router.post('/login', login);


export default router;