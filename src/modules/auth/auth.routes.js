import { Router } from "express";
import { register, login, listUsers } from "./auth.controller.js";
import validate from "../../shared/middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get('/getAllUsers',listUsers)

export default router;
