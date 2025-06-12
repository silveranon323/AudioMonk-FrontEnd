import React, { useState, useEffect } from "react";
import { Music, Loader2, Sparkles, Play, TrendingUp, Volume2, Heart, Share2 } from "lucide-react";

type Recommendation = {
  artist: string;
  name: string;
  similarity: number;
};

type ApiResponse = {
  predicted_genre: string;
  recommendations: Recommendation[];
};

const ShazamRecommend: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedBars, setAnimatedBars] = useState<boolean[]>([]);

  const fetchRecommendations = () => {
    setLoading(true);
    setError(null);
    setData(null);
    setAnimatedBars([]);

    fetch("http://127.0.0.1:5000/api/recommend")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((newData) => {
        setData(newData);
        // Trigger bar animations after data loads
        setTimeout(() => {
          setAnimatedBars(new Array(newData.recommendations.length).fill(true));
        }, 300);
      })
      .catch(() => setError("Failed to fetch recommendations"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-30 animate-pulse-glow"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-full shadow-2xl flex items-center justify-center animate-bounce-gentle">
              <Music className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-800 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-text-shimmer">
            Shazam Discover
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Unlock your musical DNA with AI-powered recommendations that feel like magic
          </p>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-float"></div>
          <div className="absolute top-32 right-16 w-3 h-3 bg-pink-400 rounded-full opacity-40 animate-float-delayed"></div>
          <div className="absolute top-48 left-1/3 w-2 h-2 bg-indigo-400 rounded-full opacity-50 animate-float"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 mb-8 transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 animate-gradient-shift"></div>
          
          {/* Action Button */}
          <div className="text-center mb-10 relative z-10">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="group relative px-16 py-8 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white rounded-3xl font-bold text-xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              {/* Button background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              
              <div className="relative flex items-center gap-4">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span>Weaving Musical Magic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Discover My Sound</span>
                  </>
                )}
              </div>
              
              {/* Shimmer effect */}
              {!loading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              )}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl animate-shake-enhanced">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-4 animate-pulse-fast"></div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Results Section */}
          {data && (
            <div className="animate-slide-up-enhanced">
              {/* Genre Header */}
              <div className="text-center mb-12">
                <div className="relative inline-flex items-center gap-4 bg-gradient-to-r from-purple-100 via-white to-pink-100 px-10 py-6 rounded-full border border-purple-200 shadow-xl backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-full animate-pulse-slow"></div>
                  <TrendingUp className="w-8 h-8 text-purple-600 relative z-10 animate-bounce-gentle" />
                  <span className="text-xl font-bold text-gray-800 relative z-10">
                    Your Musical DNA: 
                  </span>
                  <span className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-black text-lg uppercase tracking-wider shadow-lg relative z-10 animate-pulse-glow">
                    {data.predicted_genre}
                  </span>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-gray-800 mb-8 text-center flex items-center justify-center gap-4">
                  <Volume2 className="w-10 h-10 text-purple-600 animate-pulse" />
                  Your Sonic Journey
                </h3>
                
                {data.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white/90 backdrop-blur-lg border border-white/30 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-[1.03] hover:-translate-y-2 transition-all duration-500 animate-fade-in-up overflow-hidden"
                    style={{ animationDelay: `${idx * 150}ms` }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                            <Play className="w-8 h-8 text-white ml-1 group-hover:scale-125 transition-transform duration-300" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-black text-2xl text-gray-800 mb-2 group-hover:text-purple-700 transition-colors duration-300">
                            {rec.name}
                          </h4>
                          <p className="text-gray-600 font-semibold text-lg">
                            by {rec.artist}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {/* Action buttons */}
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <button className="p-3 bg-white/80 rounded-full shadow-lg hover:shadow-xl hover:bg-purple-50 transition-all duration-200">
                            <Heart className="w-5 h-5 text-purple-600" />
                          </button>
                          <button className="p-3 bg-white/80 rounded-full shadow-lg hover:shadow-xl hover:bg-purple-50 transition-all duration-200">
                            <Share2 className="w-5 h-5 text-purple-600" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-1">
                            {rec.similarity.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500 uppercase tracking-wider font-bold">
                            Match Score
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Horizontal Similarity Bar */}
                    <div className="mt-6 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">Similarity Match</span>
                        <span className="text-sm font-bold text-purple-600">{rec.similarity.toFixed(1)}%</span>
                      </div>
                      
                      <div className="relative h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-pink-200/50 animate-pulse-slow"></div>
                        
                        {/* Progress bar */}
                        <div 
                          className={`h-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ease-out ${
                            animatedBars[idx] ? 'animate-shimmer' : ''
                          }`}
                          style={{ 
                            width: animatedBars[idx] ? `${rec.similarity}%` : '0%',
                            transitionDelay: `${idx * 200}ms`
                          }}
                        >
                          {/* Shimmer effect on bar */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer-move"></div>
                          
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 blur-sm"></div>
                        </div>
                        
                        {/* Animated dots */}
                        <div className="absolute top-1/2 transform -translate-y-1/2 right-2">
                          <div className={`w-2 h-2 bg-white rounded-full ${hoveredIndex === idx ? 'animate-ping' : ''}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="text-center text-gray-500 text-lg font-medium">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <p>Powered by quantum-enhanced AI algorithms</p>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-enhanced {
          from { opacity: 0; transform: translateY(60px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes shake-enhanced {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-8px) rotate(-1deg); }
          75% { transform: translateX(8px) rotate(1deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.8); }
        }
        
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer-move {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up-enhanced {
          animation: slide-up-enhanced 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shake-enhanced {
          animation: shake-enhanced 0.6s ease-in-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        
        .animate-shimmer-move {
          animation: shimmer-move 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ShazamRecommend;