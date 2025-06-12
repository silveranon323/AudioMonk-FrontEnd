# Audio Monk - Music Genre Classification Setup Guide

## Project Description

**Audio Monk** is an advanced music genre classification system that leverages deep learning techniques and the Spotify Web API to provide intelligent music discovery and recommendation services.

### Overview
Genre classification is crucial for simplifying music discovery, organizing digital music libraries, and customizing streaming services. With the exponential growth of available music data, there's an increasing demand for automated systems that can classify songs by genre through audio characteristics analysis.

### Technical Approach
This project utilizes cutting-edge deep learning techniques, specifically Convolutional Neural Networks (CNNs), to extract spatial features directly from audio signals. The system employs sophisticated audio preprocessing techniques including:

- **Spectrogram Creation**: Converting raw audio files into time-frequency representations
- **Short-Time Fourier Transform (STFT)**: Transforming audio signals for CNN processing
- **Pattern Recognition**: Identifying complex audio patterns that traditional feature-based methods cannot capture

### Key Features
- **Real-time Genre Classification**: Instant audio analysis and genre prediction
- **Spotify Integration**: Automatic recommendations based on classified genres
- **User-Friendly Interface**: Upload audio files and receive immediate feedback
- **Dynamic Music Discovery**: Enhanced user engagement through intelligent recommendations

### Problem Statement
The music streaming industry faces significant challenges with existing classification systems that rely on manual tagging and metadata-based approaches. These methods often fail to capture the true essence of musical content, leading to poor recommendation accuracy. Audio Monk addresses these limitations by analyzing actual audio patterns and characteristics.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Spotify Developer Account** (for API credentials)

---

## Step-by-Step Setup Instructions

### 1. Initialize React Project

```bash
# Create a new React application
npx create-react-app audio-monk
cd audio-monk

# Install additional dependencies
npm install axios react-router-dom styled-components
npm install @tensorflow/tfjs @tensorflow/tfjs-node
npm install web-audio-api wavefile
npm install react-dropzone react-player
npm install chart.js react-chartjs-2
npm install @material-ui/core @material-ui/icons
npm install dotenv
```

### 2. Project Structure Setup

```bash
# Create directory structure
mkdir src/components
mkdir src/pages
mkdir src/services
mkdir src/utils
mkdir src/hooks
mkdir src/models
mkdir src/assets
mkdir src/styles
mkdir public/models
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Create environment file
touch .env
```

Add the following content to `.env`:

```env
# Spotify API Credentials
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Shazam API (Optional)
REACT_APP_SHAZAM_API_KEY=your_shazam_api_key_here

# Application Settings
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
```

### 4. Spotify Developer Setup

1. **Create Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App"
   - Fill in app details:
     - App Name: "Audio Monk"
     - App Description: "Music Genre Classification System"
     - Redirect URI: `http://localhost:3000/callback`

2. **Get Credentials**:
   - Copy Client ID and Client Secret
   - Replace placeholders in `.env` file

### 5. Install Additional ML Dependencies

```bash
# TensorFlow.js for machine learning
npm install @tensorflow/tfjs-react-native
npm install @tensorflow/tfjs-platform-react-native

# Audio processing libraries
npm install tone
npm install audiomotion-analyzer
npm install meyda

# UI and styling
npm install @emotion/react @emotion/styled
npm install @mui/material @mui/icons-material
npm install framer-motion
```

### 6. Development Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "npm start",
    "build:prod": "NODE_ENV=production npm run build",
    "serve": "serve -s build -l 5000",
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

### 7. Git Repository Setup

```bash
# Initialize Git repository
git init

# Create .gitignore
echo "node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
build/
dist/
*.log" > .gitignore

# Initial commit
git add .
git commit -m "Initial commit: Audio Monk setup"
```

### 8. Environment Variables Template

Create `.env.example` for team collaboration:

```bash
# Spotify API Credentials (Required)
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Optional APIs
REACT_APP_SHAZAM_API_KEY=your_shazam_api_key_here

# Application Configuration
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
```

### 9. Start Development Server

```bash
# Start the development server
npm start

# The application will open at http://localhost:3000
```

### 10. Testing Spotify Integration

Create a simple test component to verify Spotify API connection:

```bash
# Create test file
touch src/components/SpotifyTest.js
```

### 11. Build and Deployment Preparation

```bash
# Create production build
npm run build

# Test production build locally
npm install -g serve
serve -s build -l 5000
```

---

## Important Configuration Notes

### Spotify API Credentials Setup

**Important**: Replace the placeholder values in your `.env` file with your actual Spotify credentials:

```env
# Replace these with your actual Spotify app credentials
REACT_APP_SPOTIFY_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
REACT_APP_SPOTIFY_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Security Considerations

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper CORS** configuration
4. **Use HTTPS** in production
5. **Validate all API inputs**

---

## Next Steps

After completing the setup:

1. **Implement Core Components**:
   - Audio upload interface
   - Genre classification engine
   - Spotify integration service
   - Results dashboard

2. **Train ML Model**:
   - Prepare audio dataset
   - Train CNN model
   - Convert to TensorFlow.js format

3. **Integration Testing**:
   - Test Spotify API endpoints
   - Validate audio processing pipeline
   - Test recommendation system

4. **UI/UX Development**:
   - Design responsive interface
   - Implement audio visualization
   - Create user dashboard

5. **Deployment**:
   - Configure production environment
   - Set up CI/CD pipeline
   - Deploy to cloud platform

---

## Troubleshooting

### Common Issues

1. **Spotify API 401 Error**: Check client credentials
2. **CORS Issues**: Configure proxy in package.json
3. **Audio Processing**: Ensure browser supports Web Audio API
4. **Build Errors**: Check Node.js version compatibility

### Support

For technical support or questions:
- Check Spotify Web API documentation
- Review TensorFlow.js guides
- Consult React.js documentation

---

## Project Timeline

- **Week 1-2**: Setup and basic React implementation
- **Week 3-4**: Spotify API integration
- **Week 5-6**: ML model development and integration
- **Week 7-8**: UI/UX refinement and testing
- **Week 9-10**: Deployment and optimization

---

**Ready to build the future of music discovery! 🎵🤖**
