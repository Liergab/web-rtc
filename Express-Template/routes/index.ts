import express from "express";
import userRouter from "./userRoutes";
import webrtcRouter from "./webrtc";
import recordingRouter from "./recording.routes";

const router = express.Router();

router.use(userRouter);
router.use("/webrtc", webrtcRouter);
router.use("/recordings", recordingRouter);

export default router;
