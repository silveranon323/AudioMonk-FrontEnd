import React, { useState, useEffect } from 'react';
import { Music, Search, User, Play, Pause, Volume2, Heart, Shuffle, SkipForward, Headphones, Mic, Radio, TrendingUp, Zap } from 'lucide-react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  preview_url: string | null;
  external_urls: { spotify: string };
  album: {
    images: { url: string }[];
    name: string;
  };
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Spotify credentials
  const CLIENT_ID = "4d6cc08e0cca4364b2a03c72d54e7143";
  const CLIENT_SECRET = "a74fbe2e08524d469703a05868fead0e";

  // Get Spotify access token
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
          },
          body: 'grant_type=client_credentials'
        });
        
        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Error getting access token:', error);
      }
    };

    getAccessToken();
  }, []);

  // Search Spotify tracks
  const searchTracks = async (query: string) => {
    if (!accessToken || !query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const data = await response.json();
      setSearchResults(data.tracks?.items || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Play/Pause functionality
  const togglePlay = (track: SpotifyTrack) => {
    if (currentTrack?.id === track.id && audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      if (audio) {
        audio.pause();
      }
      
      if (track.preview_url) {
        const newAudio = new Audio(track.preview_url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.play();
        setAudio(newAudio);
        setCurrentTrack(track);
        setIsPlaying(true);
        setShowPlayer(true);
      }
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        searchTracks(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, accessToken]);

  const menuItems = [
    { name: 'Discover', icon: TrendingUp, active: true },
    { name: 'Genres', icon: Music },
    { name: 'Live Radio', icon: Radio },
    { name: 'AI Classify', icon: Zap },
    { name: 'Studio', icon: Mic }
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white shadow-2xl border-b border-purple-700/50">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
          <div className="absolute w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ top: '60%', left: '80%', animationDelay: '2s' }}></div>
          <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ top: '40%', left: '30%', animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-300">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Audio Monk
                </h1>
                <p className="text-xs text-purple-300">AI Music Intelligence</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={`#${item.name.toLowerCase()}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${
                    item.active 
                      ? 'bg-white/20 text-white shadow-lg' 
                      : 'hover:bg-white/10 text-purple-200 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:block relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300 group-focus-within:text-white transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search tracks, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-200 overflow-hidden z-50">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-3 p-3 hover:bg-purple-50 transition-colors duration-200 cursor-pointer group"
                      onClick={() => togglePlay(track)}
                    >
                      <div className="relative">
                        <img
                          src={track.album.images[2]?.url || '/api/placeholder/40/40'}
                          alt={track.album.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">{track.name}</p>
                        <p className="text-gray-600 text-sm truncate">{track.artists[0]?.name}</p>
                      </div>
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors duration-200" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="w-6 h-6 relative">
                <span className={`absolute w-full h-0.5 bg-white transform transition-all duration-300 ${isOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
                <span className={`absolute w-full h-0.5 bg-white transform transition-all duration-300 ${isOpen ? 'opacity-0' : 'top-3'}`}></span>
                <span className={`absolute w-full h-0.5 bg-white transform transition-all duration-300 ${isOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden mt-4 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-2 pb-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={`#${item.name.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              ))}
              <div className="border-t border-purple-700 mt-4 pt-4">
                <input
                  type="text"
                  placeholder="Search music..."
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mini Player */}
      {showPlayer && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 shadow-2xl z-50 border-t border-purple-700/50">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <img
                src={currentTrack.album.images[2]?.url || '/api/placeholder/50/50'}
                alt={currentTrack.album.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium">{currentTrack.name}</p>
                <p className="text-purple-300 text-sm">{currentTrack.artists[0]?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                onClick={() => togglePlay(currentTrack)}
                className="p-3 bg-white text-purple-900 rounded-full hover:scale-110 transition-transform duration-200"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200">
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPlayer(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;