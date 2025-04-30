import { Request, Response, NextFunction, RequestHandler } from "express";
import Recording from "../models/RECORDING_MODEL";

export const uploadRecording: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roomId, fileName, mimeType, duration } = req.body;
    const fileData = req.body.fileData; // Base64 encoded file data

    // Validate required fields
    if (!userId || !roomId || !fileName || !fileData) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
      return;
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

    res.status(201).json({
      success: true,
      message: "Recording uploaded successfully",
      recordingId: newRecording._id,
    });
  } catch (error) {
    console.error("Error uploading recording:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload recording",
    });
  }
};

export const getRecordings: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roomId } = req.query;

    let query: any = {};

    if (userId) query.userId = userId;
    if (roomId) query.roomId = roomId;

    // Find recordings without the fileData to reduce response size
    const recordings = await Recording.find(query)
      .select("-fileData")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recordings.length,
      recordings,
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recordings",
    });
  }
};

export const getRecording: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findById(id);

    if (!recording) {
      res.status(404).json({
        success: false,
        message: "Recording not found",
      });
      return;
    }

    // Set appropriate headers
    res.setHeader("Content-Type", recording.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${recording.fileName}"`
    );

    // Send the file data
    res.send(recording.fileData);
  } catch (error) {
    console.error("Error fetching recording:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recording",
    });
  }
};

export const deleteRecording: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findByIdAndDelete(id);

    if (!recording) {
      res.status(404).json({
        success: false,
        message: "Recording not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Recording deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recording:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete recording",
    });
  }
};
