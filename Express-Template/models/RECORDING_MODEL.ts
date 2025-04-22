import mongoose from "mongoose";

interface IRecording {
  userId: string;
  roomId: string;
  fileName: string;
  fileData: Buffer;
  mimeType: string;
  duration: number;
  createdAt: Date;
}

const recordingSchema = new mongoose.Schema<IRecording>(
  {
    userId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Recording = mongoose.model<IRecording>("Recording", recordingSchema);

export default Recording;
