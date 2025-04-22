import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useTheme } from './context/ThemeContext';
import VideoChatPage from './pages/VideoChat/VideoChatPage';

function Home() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-vulcan-50)]">
      {/* Header with logo and theme toggle */}
      <header className="border-b border-[var(--color-vulcan-200)] py-4">
        <div className="container-custom flex-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-[var(--color-vulcan-500)] flex-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                <path d="M2 2l7.586 7.586"></path>
                <circle cx="11" cy="11" r="2"></circle>
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--color-vulcan-900)]">
              WebRTC Video Chat App
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-[var(--color-vulcan-100)]"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-vulcan-600)]"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--color-vulcan-600)]"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-vulcan-900)]">
              WebRTC Video Chat
            </h1>
            <p className="text-xl text-[var(--color-vulcan-600)] mb-8">
              Connect with others in real-time using peer-to-peer video calling.
              No third-party services required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/video-chat" className="btn-primary px-6 py-3">
                Start Video Chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/video-chat" element={<VideoChatPage />} />
    </Routes>
  );
}

export default App;
