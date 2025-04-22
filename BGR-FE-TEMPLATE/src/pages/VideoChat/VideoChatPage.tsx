import VideoChat from '../../features/VideoChat/VideoChat';

function VideoChatPage() {
  return (
    <div className="min-h-screen bg-[var(--color-vulcan-50)] py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-vulcan-900)]">
            Video Chat
          </h1>
          <p className="text-[var(--color-vulcan-600)]">
            Connect with others using peer-to-peer video calling
          </p>
        </div>
        
        <div className="bg-white dark:bg-[var(--color-vulcan-100)] rounded-lg shadow-lg p-6">
          <VideoChat />
        </div>
      </div>
    </div>
  );
}

export default VideoChatPage; 