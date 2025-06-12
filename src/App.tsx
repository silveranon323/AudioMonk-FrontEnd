import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  AudioWaveform,
  Music2,
  Volume2,
  RefreshCw,
  Trash2,
  Play,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Navbar from './components/Navbar';
import ShazamRecommend from './components/shazamrecommend';
const SPOTIFY_CLIENT_ID = "Add your own client id";
const SPOTIFY_CLIENT_SECRET = "Add your own client secret";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    message: string;
    filename: string;
    duration: number;
    predicted_genre: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [accessToken, setAccessToken] = useState<string>("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showAnalysisAnimation, setShowAnalysisAnimation] = useState(false);

  useEffect(() => {
    // Page load animation
    setPageLoaded(true);

    const getSpotifyToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
          },
          body: "grant_type=client_credentials",
        });

        const data = await response.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
        }
      } catch (error) {
        console.error("Error fetching Spotify token:", error);
      }
    };

    getSpotifyToken();
  }, []);

  const fetchSpotifyRecommendations = async (genre: string) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=genre:"${genre}"&type=track&limit=40`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.tracks?.items) {
        setSpotifyTracks(data.tracks.items);
      }
    } catch (error) {
      console.error("Error fetching Spotify recommendations:", error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "audio/wav") {
      setFile(droppedFile);
      setError("");
      setAnalysisResult(null);
      setSpotifyTracks([]);
    } else {
      setError("Please select a WAV file");
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "audio/wav") {
        setError("Please select a WAV file");
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
      setAnalysisResult(null);
      setSpotifyTracks([]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAnalysisResult(null);
    setError("");
    setUploadProgress(0);
    setSpotifyTracks([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setUploadProgress(0);
    setIsAnalyzing(true);
    setSpotifyTracks([]);
    setShowAnalysisAnimation(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio file");
      }

      const duration = 2000;
      const interval = 100;
      const steps = duration / interval;
      let progress = 0;

      const progressInterval = setInterval(() => {
        progress += 100 / steps;
        if (progress >= 100) {
          clearInterval(progressInterval);
          progress = 100;
        }
        setUploadProgress(Math.min(progress, 100));
      }, interval);

      const data = await response.json();
      setAnalysisResult(data);
      await fetchSpotifyRecommendations(data.predicted_genre);
    } catch (error) {
      setError("Error processing the audio file. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
      setTimeout(() => setShowAnalysisAnimation(false), 1000);
    }
  };

  const handlePlayPreview = (previewUrl: string | null, trackId: string) => {
    if (currentlyPlaying === trackId) {
      const audioElements = document.getElementsByTagName("audio");
      for (const audio of audioElements) {
        audio.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      const audioElements = document.getElementsByTagName("audio");
      for (const audio of audioElements) {
        audio.pause();
      }
      if (previewUrl) {
        const audio = new Audio(previewUrl);
        audio.play();
        setCurrentlyPlaying(trackId);
        audio.onended = () => setCurrentlyPlaying(null);
      }
    }
  };

  // Generate audio wave animation
  const generateWaveElements = () => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push(
        <div
          key={i}
          className="w-1 mx-px rounded-full bg-indigo-500"
          style={{
            height: `${Math.random() * 24 + 8}px`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
          }}
        ></div>
      );
    }
    return elements;
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-fuchsia-100 flex items-center justify-center p-4 transition-opacity duration-1000 ${
        pageLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-30"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div
        className={`bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-5xl w-full border border-white/40 transition-all duration-700 ${
          pageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
             <Navbar />
        {/* Header with animated gradient */}
        <div className="flex items-center justify-center mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-gradient"></div>
          <div className="relative flex items-center">
            <div className="relative transition-transform duration-700 hover:scale-110">
              <Music2 className="w-14 h-14 text-indigo-600" />
              <div className="absolute -right-1 -bottom-1 flex justify-center items-center h-6 w-6 rounded-full bg-indigo-100">
                <AudioWaveform className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 tracking-tight">
                AudioMonk
              </h1>
              <p className="text-gray-600 text-sm">
                Intelligent Song Genre Classificaton & Recommendation
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* File upload area with animations */}
          <div
            className={`relative transition-all duration-300 ${
              isDragging ? "transform scale-102" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label
              htmlFor="file-upload"
              className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/70 scale-102"
                  : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-indigo-400"
              }`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/30 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {file ? (
                <div className="flex flex-col items-center justify-center relative w-full h-full group z-10">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Volume2 className="w-16 h-16 text-indigo-500 transition-transform group-hover:scale-110" />
                      <div className="absolute -right-2 -bottom-2">
                        <span className="flex h-6 w-6 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-500 items-center justify-center">
                            <AudioWaveform className="w-3 h-3 text-white" />
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="text-base font-medium text-gray-800">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="p-2 rounded-full hover:bg-gray-200/70 transition-colors group"
                    >
                      <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 group">
                  <div className="relative mb-4">
                    <Upload className="w-16 h-16 text-indigo-400 transition-transform group-hover:scale-110 group-hover:text-indigo-500" />
                    <div className="absolute right-0 bottom-0">
                      <AudioWaveform className="w-6 h-6 text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <p className="text-base font-medium text-gray-600 group-hover:text-indigo-600 transition-colors mb-1">
                    Drop your audio file here
                  </p>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2 bg-gray-100/70 px-3 py-1 rounded-full">
                    WAV files only
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".wav"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-100 animate-fade-in">
              {error}
            </div>
          )}

          {/* Animated progress bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="h-full w-full bg-white/20 animate-pulse-fast"></div>
                </div>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="h-full w-20 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          )}

          {/* Analyze button with enhanced styling and animations */}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-medium flex items-center justify-center space-x-3 transition-all duration-300 relative overflow-hidden ${
              !file || isLoading
                ? "bg-gray-400 cursor-not-allowed opacity-75"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 transform hover:-translate-y-1 hover:shadow-lg"
            }`}
          >
            {/* Button background animation */}
            {!isLoading && file && (
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/3 -skew-x-12 animate-shimmer"></div>
              </div>
            )}

            <div className="relative flex items-center justify-center space-x-3">
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <AudioWaveform className="w-5 h-5" />
                  <span>Analyze Audio</span>
                </>
              )}
            </div>
          </button>

          {/* Analysis animation */}
          {showAnalysisAnimation && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full flex flex-col items-center">
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse-slow"></div>
                    <div className="relative flex justify-center items-center">
                      <div className="flex space-x-1 h-16">
                        {generateWaveElements().map((element, index) => (
                          <div key={index} className="animate-audio-wave">
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6">
                    Analyzing Audio
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Using Machine-Learning to identify the genre.
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-4">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 h-full rounded-full animate-progress"></div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis result with enhanced styling and animations */}
          {analysisResult && (
            <div className="mt-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 animate-gradient-slow rounded-2xl"></div>
              <div className="p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-indigo-100/50 transform transition-all duration-700 animate-fade-in relative z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-fuchsia-500/5 rounded-2xl"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                      <h3 className="text-2xl font-bold text-center text-gray-800 ml-2">
                        Analysis Result
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-100/50">
                      <p className="text-sm text-gray-600">
                        {analysisResult.message}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-indigo-50/70 p-3 rounded-lg">
                          <p className="text-xs text-indigo-500 font-medium">
                            File
                          </p>
                          <p className="text-sm text-gray-800 font-medium truncate">
                            {analysisResult.filename}
                          </p>
                        </div>
                        <div className="bg-purple-50/70 p-3 rounded-lg">
                          <p className="text-xs text-purple-500 font-medium">
                            Duration
                          </p>
                          <p className="text-sm text-gray-800 font-medium">
                            {analysisResult?.duration?.toFixed(2) ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 blur-lg animate-pulse-slow"></div>
                      <div className="relative py-6 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100/50 flex items-center justify-center">
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 animate-gradient">
                          {analysisResult.predicted_genre}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
            
          </div>
        </div>

          {/* Spotify recommendations with enhanced styling and animations */}
          {spotifyTracks.length > 0 && (
            <div className="mt-12 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
                <h3 className="text-2xl font-bold px-4 text-gray-800">
                 Spotify Recommended Tracks
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spotifyTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-white/60 flex items-center space-x-4 group"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      animation: "fade-in-up 0.6s ease-out forwards",
                    }}
                  >
                    <div className="relative">
                      <img
                        src={track.album.images[0]?.url}
                        alt={track.album.name}
                        className="w-16 h-16 rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        {track.preview_url && (
                          <button
                            onClick={() =>
                              handlePlayPreview(track.preview_url, track.id)
                            }
                            className="text-white transition-transform duration-300 transform group-hover:scale-110"
                          >
                            <Play
                              className={`w-8 h-8 ${
                                currentlyPlaying === track.id
                                  ? "text-indigo-300"
                                  : "text-white"
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-300">
                        {track.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors flex items-center space-x-1 bg-indigo-50 px-2 py-1 rounded-full"
                        >
                          <span>Open in Spotify</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
          <ShazamRecommend />

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              AudioMonk
            </span>{" "}
            • AI-Powered Audio Genre Classification & Recommendation
          </p>
          <p>Made with &#10084; By Group F5</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-fast {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes progress {
          0% {
            min-width: 5%;
          }
          50% {
            min-width: 70%;
          }
          100% {
            min-width: 100%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes audio-wave {
          0%,
          100% {
            transform: scaleY(0.6);
          }
          50% {
            transform: scaleY(1);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .animate-audio-wave {
          animation: audio-wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
