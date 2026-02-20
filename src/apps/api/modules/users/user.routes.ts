import { Router } from "express";
import { registerUserHandler } from "./handlers/register.handler";
import { loginUserHandler } from "./handlers/login.handler";
import { logoutUserHandler } from "./handlers/logout.handler";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getMeHandler } from "./handlers/me.handler";
import { updateProfileHandler } from "./handlers/update-profile.handler";
import { isActiveUserHandler } from "./handlers/active.handler";
import { registerPushTokenHandler } from "./handlers/register-push-token.handler";
import { unregisterPushTokenHandler } from "./handlers/unregister-push-token.handler";
import { dashboardHandler } from "./handlers/dashboard.handler";

const router = Router();

router.post("/register", registerUserHandler);
router.post("/login", loginUserHandler);
router.post("/logout", logoutUserHandler);

router.put("/active", authMiddleware, isActiveUserHandler);

router.get("/me", authMiddleware, getMeHandler);
router.get("/dashboard", authMiddleware, dashboardHandler);

router.put("/update", authMiddleware, updateProfileHandler);

router.post("/push-token", authMiddleware, registerPushTokenHandler);
router.delete("/push-token", authMiddleware, unregisterPushTokenHandler);

export default router;