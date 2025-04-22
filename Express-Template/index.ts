import express from "express";
import env from "./util/validate";
import db from "./config/db";
import index from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import signalingService from "./services/webrtc/SignalingService";
import { errorValidation, NotFoundEndpoint } from "./middleware/error";

const app = express();
const server = http.createServer(app);

const PORT = env.PORT;

// Increase payload size limit for video uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(cors());

app.use("/v1/api", index);
app.use(NotFoundEndpoint);
app.use(errorValidation);

// Initialize WebRTC signaling service
signalingService.initialize(server);

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`WebRTC signaling server running on ws://localhost:${PORT}`);
  db();
});
