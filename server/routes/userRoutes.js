import express from "express"
import { checkAuth, login, signup, updateProfile, getLastSeen } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import updateLastSeen from "../middleware/updateLastSeen.js";

const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/update-profile", protectRoute, updateLastSeen, updateProfile);
userRouter.get("/check", protectRoute, updateLastSeen, checkAuth);
userRouter.get("/:userId/lastseen", protectRoute, updateLastSeen, getLastSeen);


export default userRouter;
