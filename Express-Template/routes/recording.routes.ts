import express, { Router } from "express";
import * as controller from "../controllers/recording.controller";

const router: Router = express.Router();

// POST /recordings - Upload a new recording
router.post("/", controller.uploadRecording);

// GET /recordings - Get all recordings with optional filters
router.get("/", controller.getRecordings);

// GET /recordings/:id - Get a specific recording by ID
router.get("/:id", controller.getRecording);

// DELETE /recordings/:id - Delete a recording
router.delete("/:id", controller.deleteRecording);

export default router;
