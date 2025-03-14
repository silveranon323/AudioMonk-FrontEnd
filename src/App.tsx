import { useState, useCallback, useEffect } from 'react';
import { Upload, AudioWaveform, Music2, Volume2, AudioWaveform as Waveform, RefreshCw, Trash2, Play, ExternalLink } from 'lucide-react';

const SPOTIFY_CLIENT_ID = 'f6895e095bec4d6fbee479768bc48e39';
const SPOTIFY_CLIENT_SECRET = '53ac05daf02942d08cdaac68cc0ed838';

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
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [accessToken, setAccessToken] = useState<string>('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    const getSpotifyToken = async () => {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
          },
          body: 'grant_type=client_credentials',
        });

        const data = await response.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
        }
      } catch (error) {
        console.error('Error fetching Spotify token:', error);
      }
    };

    getSpotifyToken();
  }, []);

  const fetchSpotifyRecommendations = async (genre: string) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=genre:"${genre}"&type=track&limit=10`,
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
      console.error('Error fetching Spotify recommendations:', error);
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
    if (droppedFile?.type === 'audio/wav') {
      setFile(droppedFile);
      setError('');
      setAnalysisResult(null);
      setSpotifyTracks([]);
    } else {
      setError('Please select a WAV file');
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'audio/wav') {
        setError('Please select a WAV file');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
      setAnalysisResult(null);
      setSpotifyTracks([]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAnalysisResult(null);
    setError('');
    setUploadProgress(0);
    setSpotifyTracks([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress(0);
    setIsAnalyzing(true);
    setSpotifyTracks([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio file');
      }

      const duration = 2000;
      const interval = 100;
      const steps = duration / interval;
      let progress = 0;

      const progressInterval = setInterval(() => {
        progress += (100 / steps);
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
      setError('Error processing the audio file. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handlePlayPreview = (previewUrl: string | null, trackId: string) => {
    if (currentlyPlaying === trackId) {
      const audioElements = document.getElementsByTagName('audio');
      for (const audio of audioElements) {
        audio.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      const audioElements = document.getElementsByTagName('audio');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl w-full border border-white/20">
        <div className="flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl"></div>
          <div className="relative flex items-center">
            <div className="relative">
              <Music2 className="w-12 h-12 text-indigo-600" />
              <AudioWaveform className="w-4 h-4 text-indigo-400 absolute -right-1 -bottom-1 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 ml-4 tracking-tight">
              Audio Classifier
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`relative transition-all duration-300 ${isDragging ? 'transform scale-102' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-102'
                  : 'border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-indigo-400'
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center relative w-full h-full group">
                  <Volume2 className="w-12 h-12 text-indigo-500 mb-2 transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        clearFile();
                      }}
                      className="p-2 rounded-full hover:bg-gray-200/70 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 group">
                  <Upload className="w-12 h-12 text-gray-400 mb-3 transition-transform group-hover:scale-110 group-hover:text-indigo-500" />
                  <p className="text-sm text-gray-600 font-medium group-hover:text-indigo-600">
                    Drop your audio file here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">WAV files only</p>
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

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-medium flex items-center justify-center space-x-2 transition-all duration-300 ${
              !file || isLoading
                ? 'bg-gray-400 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Waveform className="w-5 h-5" />
                <span>Analyze Audio</span>
              </>
            )}
          </button>

          {analysisResult && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100/50 transform transition-all duration-500 animate-fade-in backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur"></div>
                <div className="relative space-y-4">
                  <h3 className="text-xl font-semibold text-center text-indigo-900">
                    Analysis Result
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{analysisResult.message}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">File:</span> {analysisResult.filename}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {analysisResult.duration.toFixed(2)}s
                    </p>
                    <div className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-4">
                      {analysisResult.predicted_genre}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {spotifyTracks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Recommended Songs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spotifyTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex items-center space-x-4"
                  >
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-lg shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {track.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {track.artists.map((artist) => artist.name).join(', ')}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {track.preview_url && (
                          <button
                            onClick={() => handlePlayPreview(track.preview_url, track.id)}
                            className="text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <Play className={`w-5 h-5 ${currentlyPlaying === track.id ? 'text-purple-600' : ''}`} />
                          </button>
                        )}
                        <a
                          href={track.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;