// import { Router } from "express";
// import { register, login, listUsers } from "./auth.controller.js";
// import validate from "../../shared/middleware/validate.js";
// import { registerSchema, loginSchema } from "./auth.validation.js";
// import { refresh } from "./auth.service.js";

// const router = Router();

// router.post("/register", validate(registerSchema), register);
// router.post("/login", validate(loginSchema), login);
// router.post("/refresh", refresh);

// router.get("/getAllUsers", listUsers);

// export default router;

import { Router } from "express";
import { register, login, refresh, listUsers, verifyLoginOtp } from "./auth.controller.js";
import validate from "../../shared/middleware/validate.js";
import { registerSchema, loginSchema, verifyLoginOtpSchema, refreshSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",  login);
router.post("/login/verify-otp", validate(verifyLoginOtpSchema), verifyLoginOtp);
router.post("/refresh", validate(refreshSchema), refresh);
router.get("/getAllUsers", listUsers);

export default router;
