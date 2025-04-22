import express from "express";
import Recording from "../models/RECORDING_MODEL";

const router = express.Router();

// POST /recordings - Upload a new recording
router.post("/", async (req, res) => {
  try {
    const { userId, roomId, fileName, mimeType, duration } = req.body;
    const fileData = req.body.fileData; // Base64 encoded file data

    // Validate required fields
    if (!userId || !roomId || !fileName || !fileData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Convert base64 string to Buffer
    const fileBuffer = Buffer.from(fileData.split(",")[1], "base64");

    // Create new recording
    const newRecording = new Recording({
      userId,
      roomId,
      fileName,
      fileData: fileBuffer,
      mimeType: mimeType || "video/webm",
      duration: duration || 0,
    });

    // Save recording to database
    await newRecording.save();

    return res.status(201).json({
      success: true,
      message: "Recording uploaded successfully",
      recordingId: newRecording._id,
    });
  } catch (error) {
    console.error("Error uploading recording:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload recording",
    });
  }
});

// GET /recordings - Get all recordings with optional filters
router.get("/", async (req, res) => {
  try {
    const { userId, roomId } = req.query;

    let query = {};

    if (userId) query["userId"] = userId;
    if (roomId) query["roomId"] = roomId;

    // Find recordings without the fileData to reduce response size
    const recordings = await Recording.find(query)
      .select("-fileData")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recordings.length,
      recordings,
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recordings",
    });
  }
});

// GET /recordings/:id - Get a specific recording by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findById(id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", recording.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${recording.fileName}"`
    );

    // Send the file data
    return res.send(recording.fileData);
  } catch (error) {
    console.error("Error fetching recording:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recording",
    });
  }
});

// DELETE /recordings/:id - Delete a recording
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findByIdAndDelete(id);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: "Recording not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recording deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete recording",
    });
  }
});

export default router;
