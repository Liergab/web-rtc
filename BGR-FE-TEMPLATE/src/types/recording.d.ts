declare interface RecordingItem {
  _id: string;
  userId: string;
  roomId: string;
  fileName: string;
  mimeType: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

declare interface RecordingUploadResponse {
  success: boolean;
  message: string;
  recordingId?: string;
}

declare interface RecordingsListResponse {
  success: boolean;
  count: number;
  recordings: RecordingItem[];
}
