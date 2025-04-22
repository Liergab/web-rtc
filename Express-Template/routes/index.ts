import express from "express";
import userRouter from "./userRoutes";
import webrtcRouter from "./webrtc";
// Temporarily comment out the problematic import
// import recordingRouter from "./recording.routes";

const router = express.Router();

router.use(userRouter);
router.use("/webrtc", webrtcRouter);
// Temporarily comment out the problematic route
// router.use("/recordings", recordingRouter);

export default router;
