# Cluely-Clone: AI-Powered Interview Assistant

## Project Overview

**Cluely-Clone** is a transparent overlay Electron application designed to provide real-time AI assistance during live interviews. The application creates an always-on-top, transparent window that can capture audio questions and provide intelligent answers based on your resume, helping candidates during technical interviews or job interviews.

## Key Features

### 🎯 Core Functionality
- **Transparent Overlay Interface**: Creates a see-through window that stays on top of all applications
- **Voice-to-Text Transcription**: Captures interviewer questions using microphone input
- **AI-Powered Responses**: Generates contextual answers based on your resume using AI models
- **Dual AI Provider Support**: Supports both OpenAI and Google Gemini APIs
- **Real-time Processing**: Instant transcription and response generation
- **Stealth Mode**: Hidden from dock and screen sharing for discretion

### 🎮 User Interface Features
- **Draggable Window**: Move the overlay anywhere on screen using drag handle
- **Overlay Mode Toggle**: Switch between interactive and pass-through modes
- **Visual Feedback**: Status indicators and microphone activity visualization
- **Responsive Design**: Clean, modern UI with backdrop blur effects
- **Keyboard Shortcuts**: Global hotkey (Ctrl/Cmd+Shift+O) to show/hide

### 🔧 Technical Features
- **Cross-Platform**: Supports macOS, Windows, and Linux
- **Secure API Integration**: Encrypted API key handling
- **Audio Processing**: WebM audio format with MediaRecorder API
- **IPC Communication**: Secure renderer-main process communication
- **Content Protection**: Screen recording protection enabled

## How It Works

### 1. Setup Phase
1. **Launch Application**: Start the Cluely-Clone application
2. **Configure Settings**: 
   - Select AI provider (OpenAI or Gemini)
   - Enter your API key
   - Paste your resume text
3. **Position Overlay**: Drag the window to desired screen location

### 2. Interview Mode
1. **Start Interview**: Click "Start Interview" button
2. **Overlay Activation**: Window becomes transparent and stays on top
3. **Voice Capture**: Press spacebar or click microphone to record questions
4. **AI Processing**: 
   - Audio is transcribed using Whisper (OpenAI) or Speech-to-Text (Gemini)
   - Question is analyzed with your resume context
   - AI generates appropriate response
5. **Answer Display**: Response appears in the overlay window

### 3. Interaction Flow
```
Question Asked → Audio Capture → Transcription → AI Analysis → Answer Display
```

## Technical Architecture

### Frontend (Renderer Process)
- **HTML/CSS**: Modern UI with glassmorphism design
- **JavaScript**: Event handling, API calls, audio processing
- **MediaRecorder API**: Audio capture and processing
- **Fetch API**: HTTP requests to AI services

### Backend (Main Process)
- **Electron Main**: Window management and system integration
- **IPC Handlers**: Secure communication between processes
- **Global Shortcuts**: System-wide keyboard shortcuts
- **Window Controls**: Transparency, overlay modes, positioning

### API Integrations
- **OpenAI Whisper**: Speech-to-text transcription
- **OpenAI GPT-3.5**: Chat completion for answer generation
- **Google Speech-to-Text**: Alternative transcription service
- **Google Gemini Pro**: Alternative chat completion service

## File Structure

```
cluely-clone/
├── main.js              # Electron main process
├── renderer.js          # Frontend logic and API calls
├── preload.js           # Secure IPC bridge
├── index.html           # User interface
├── package.json         # Project configuration
├── build.sh             # Build script for all platforms
├── TODO.md              # Development progress tracker
├── icon.icns            # macOS app icon
├── icon.ico             # Windows app icon
└── favicon.png          # Web favicon
```

## Current Capabilities

### ✅ Implemented Features
- Dual AI provider support (OpenAI + Gemini)
- Real-time voice transcription
- Context-aware answer generation
- Transparent overlay interface
- Cross-platform compatibility
- Drag and drop window positioning
- Global keyboard shortcuts
- Microphone activity indicators
- Error handling and status feedback
- Screen recording protection

### 🔄 Provider-Specific Features

#### OpenAI Integration
- **Whisper API**: High-quality speech transcription
- **GPT-3.5 Turbo**: Intelligent response generation
- **Robust Error Handling**: Detailed error messages

#### Gemini Integration
- **Speech-to-Text API**: Google's transcription service
- **Gemini Pro**: Advanced language model responses
- **Base64 Audio Processing**: Optimized for Gemini format

## Enhancement Opportunities

### 🚀 Immediate Improvements

#### 1. User Experience Enhancements
- **Resume Templates**: Pre-built resume formats for different roles
- **Answer Customization**: Tone and style preferences (formal, casual, technical)
- **Multi-language Support**: Support for non-English interviews
- **Voice Activity Detection**: Automatic recording start/stop
- **Answer History**: Save and review previous responses

#### 2. Technical Improvements
- **Local AI Models**: Offline processing using local LLMs
- **Better Audio Processing**: Noise cancellation and audio enhancement
- **Streaming Responses**: Real-time answer generation
- **Caching System**: Store common Q&A pairs for faster responses
- **Configuration Profiles**: Save different setups for different interview types

#### 3. Advanced Features
- **Screen Analysis**: OCR to read questions from screen
- **Interview Analytics**: Track question types and performance
- **Practice Mode**: Mock interview simulation
- **Team Collaboration**: Share resume profiles and responses
- **Integration APIs**: Connect with job boards and ATS systems

### 🎯 Strategic Enhancements

#### 1. AI Model Improvements
- **Fine-tuned Models**: Custom models trained on interview data
- **Multi-modal Input**: Process both audio and visual cues
- **Context Memory**: Remember conversation history
- **Personality Matching**: Adapt responses to company culture

#### 2. Security & Privacy
- **End-to-End Encryption**: Secure all data transmission
- **Local Processing**: Reduce dependency on external APIs
- **Data Anonymization**: Remove PII from API calls
- **Audit Logging**: Track all system activities

#### 3. Platform Extensions
- **Browser Extension**: Web-based version for online interviews
- **Mobile App**: Smartphone companion app
- **Cloud Sync**: Synchronize settings across devices
- **API Marketplace**: Third-party integrations

#### 4. Enterprise Features
- **Admin Dashboard**: Manage multiple user accounts
- **Usage Analytics**: Track system performance and usage
- **Custom Branding**: White-label solutions
- **Compliance Tools**: Meet enterprise security requirements

### 🔧 Technical Debt & Optimizations

#### 1. Code Quality
- **TypeScript Migration**: Add type safety
- **Unit Testing**: Comprehensive test coverage
- **Code Documentation**: Detailed API documentation
- **Performance Monitoring**: Real-time performance metrics

#### 2. Architecture Improvements
- **Modular Design**: Plugin-based architecture
- **State Management**: Centralized application state
- **Error Recovery**: Automatic error recovery mechanisms
- **Resource Optimization**: Memory and CPU usage optimization

#### 3. DevOps & Deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Auto-Updates**: Seamless application updates
- **Crash Reporting**: Automatic error reporting
- **Usage Telemetry**: Anonymous usage statistics

## Installation & Usage

### Prerequisites
- Node.js 16+ and npm
- Microphone access permissions
- API keys for OpenAI or Gemini

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd cluely-clone

# Install dependencies
npm install

# Run application
npm start

# Build for distribution
./build.sh
```

### Configuration
1. Launch the application
2. Select your preferred AI provider
3. Enter your API key
4. Paste your resume content
5. Click "Start Interview" to begin

## Security Considerations

- **API Key Protection**: Keys are stored in memory only
- **Screen Recording Protection**: Prevents unauthorized recording
- **Process Isolation**: Secure IPC communication
- **No Data Persistence**: No local storage of sensitive data

## Future Roadmap

### Phase 1: Core Improvements (Next 3 months)
- Enhanced UI/UX with better visual feedback
- Improved error handling and recovery
- Performance optimizations
- Additional AI provider integrations

### Phase 2: Advanced Features (3-6 months)
- Local AI model support
- Screen analysis capabilities
- Interview analytics and insights
- Mobile companion app

### Phase 3: Enterprise Ready (6-12 months)
- Multi-user support
- Cloud synchronization
- Advanced security features
- API marketplace and integrations

## Contributing

This project welcomes contributions in areas such as:
- UI/UX improvements
- Additional AI provider integrations
- Performance optimizations
- Security enhancements
- Documentation improvements

## License & Disclaimer

This tool is designed for educational and practice purposes. Users should ensure compliance with interview policies and ethical guidelines when using AI assistance tools.
