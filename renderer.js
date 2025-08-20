let mediaRecorder;
let audioChunks = [];
let isInterviewing = false;
let isRecording = false;
let whisperTranscribing = false;
let lastTranscript = '';
let stream = null;

const startBtn = document.getElementById('start-interview');
const stopBtn = document.getElementById('stop-interview');
const answerContainer = document.getElementById('answer-container');
const apiKeyInput = document.getElementById('api-key');
const resumeInput = document.getElementById('resume-text');
const statusIndicator = document.getElementById('status-indicator');
const closeBtn = document.getElementById('close-overlay');
const overlayContainer = document.getElementById('overlay-container');
const controlsSection = document.getElementById('controls');
const micToggleBtn = document.getElementById('mic-toggle');
const micIcon = document.getElementById('mic-icon');
const answerOuter = document.getElementById('answer-outer');
const dragHandle = document.getElementById('drag-handle');
const providerSelect = document.getElementById('provider-select');

// Drag functionality
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

dragHandle.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragOffset.x = e.clientX;
  dragOffset.y = e.clientY;
  dragHandle.style.background = 'rgba(60,60,60,0.8)';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const deltaX = e.clientX - dragOffset.x;
  const deltaY = e.clientY - dragOffset.y;
  
  // Send drag message to main process
  if (window.electronAPI && window.electronAPI.dragWindow) {
    window.electronAPI.dragWindow(deltaX, deltaY);
  }
  
  dragOffset.x = e.clientX;
  dragOffset.y = e.clientY;
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    dragHandle.style.background = 'rgba(30,30,30,0.7)';
  }
});

function setStatus(text, highlight) {
  statusIndicator.innerText = text;
  if (highlight === 'recording') {
    statusIndicator.style.color = '#00ff99';
    answerContainer.style.boxShadow = '0 0 0 4px #00ff9955';
  } else if (highlight === 'error') {
    statusIndicator.style.color = '#ff4d4f';
    answerContainer.style.boxShadow = 'none';
  } else {
    statusIndicator.style.color = '#b0b0b0';
    answerContainer.style.boxShadow = 'none';
  }
}

function setMicActive(active) {
  if (active) {
    micToggleBtn.style.background = '#00ff99';
    micIcon.style.color = '#222';
    micIcon.style.opacity = '1';
    micIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="#222" width="18" height="18"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-2.08A7 7 0 0 0 19 12z"></path></svg>`;
  } else {
    micToggleBtn.style.background = 'rgba(30,30,30,0.7)';
    micIcon.style.color = '#fff';
    micIcon.style.opacity = '0.7';
    micIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="#fff" width="18" height="18"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 1 0 2 0v-2.08A7 7 0 0 0 19 12z"></path></svg>`;
  }
}

function showAnswerContainer(show) {
  answerOuter.style.display = show ? 'flex' : 'none';
}

async function sendToWhisper(blob, apiKey) {
  setStatus('Transcribing...', '');
  const formData = new FormData();
  formData.append('file', blob, 'audio.webm');
  formData.append('model', 'whisper-1');
  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Whisper API error');
    const data = await response.json();
    return data.text;
  } catch (err) {
    setStatus('Whisper error: ' + err.message, 'error');
    return '';
  }
}

async function sendToGPT(question, resume, apiKey) {
  setStatus('Getting answer...', '');
  const systemPrompt = `You are helping in a live interview. Use the following resume to answer as if you are the candidate. Ignore any unrelated speech or background talk. Focus on the actual interview question and answer smartly as per the resume.\n\nResume:\n${resume}`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ]
      })
    });
    if (!response.ok) throw new Error('OpenAI GPT error');
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    setStatus('GPT error: ' + err.message, 'error');
    return '';
  }
}

async function processAudioChunk(blob) {
  if (whisperTranscribing) return; // avoid overlapping
  whisperTranscribing = true;
  const apiKey = apiKeyInput.value.trim();
  const resume = resumeInput.value.trim();
  const provider = providerSelect.value;
  
  if (!apiKey || !resume) {
    const providerName = provider === 'openai' ? 'OpenAI' : 'Gemini';
    setStatus(`Please enter your ${providerName} API key and paste your resume.`, 'error');
    whisperTranscribing = false;
    return;
  }
  
  let transcript = '';
  if (provider === 'openai') {
    transcript = await sendToWhisper(blob, apiKey);
  } else if (provider === 'gemini') {
    transcript = await sendToGeminiSpeech(blob, apiKey);
  }
  
  if (transcript && transcript !== lastTranscript) {
    lastTranscript = transcript;
    let answer = '';
    if (provider === 'openai') {
      answer = await sendToGPT(transcript, resume, apiKey);
    } else if (provider === 'gemini') {
      answer = await sendToGeminiChat(transcript, resume, apiKey);
    }
    
    if (answer) answerContainer.innerText = answer;
    else answerContainer.innerText = 'No answer.';
    setStatus('Ready. Press spacebar to record.', '');
  } else if (!transcript) {
    answerContainer.innerText = 'No speech detected.';
    setStatus('Ready. Press spacebar to record.', '');
  }
  whisperTranscribing = false;
}

function startRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    audioChunks = [];
    mediaRecorder.start();
    isRecording = true;
    setStatus('Recording... Click mic or press spacebar to stop.', 'recording');
    setMicActive(true);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    isRecording = false;
    setStatus('Processing...', '');
    setMicActive(false);
  }
}

function handleSpacebar(e) {
  if (!isInterviewing) return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }
}

// Global keyboard listener that works even when window is not focusable
function handleGlobalKeydown(e) {
  if (!isInterviewing) return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }
}

// Add global keyboard listener
document.addEventListener('keydown', handleGlobalKeydown);

micToggleBtn.onclick = () => {
  if (!isInterviewing) return;
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
};

startBtn.onclick = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus('Microphone access not supported.', 'error');
    return;
  }
  const apiKey = apiKeyInput.value.trim();
  const resume = resumeInput.value.trim();
  const provider = providerSelect.value;
  
  if (!apiKey || !resume) {
    const providerName = provider === 'openai' ? 'OpenAI' : 'Gemini';
    setStatus(`Please enter your ${providerName} API key and paste your resume.`, 'error');
    return;
  }
  if (window.electronAPI && window.electronAPI.setOverlayMode) {
    window.electronAPI.setOverlayMode(true);
  }
  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  setStatus('Ready. Press spacebar to record.', '');
  answerContainer.innerText = 'Ask a question...';
  isInterviewing = true;
  lastTranscript = '';
  controlsSection.style.display = 'none';
  showAnswerContainer(true);
  answerContainer.style.maxHeight = '80vh';
  answerContainer.style.minHeight = '80px';
  setMicActive(false);

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      if (audioChunks.length > 0 && isInterviewing) {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = [];
        await processAudioChunk(blob);
      }
    };
    // Remove the old window event listener since we're using document
    // window.addEventListener('keydown', handleSpacebar);
  } catch (err) {
    setStatus('Mic error: ' + err.message, 'error');
    isInterviewing = false;
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    if (window.electronAPI && window.electronAPI.setOverlayMode) {
      window.electronAPI.setOverlayMode(false);
    }
  }
};

stopBtn.onclick = () => {
  isInterviewing = false;
  isRecording = false;
  setStatus('Interview stopped.', '');
  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  // Remove the old window event listener since we're using document
  // window.removeEventListener('keydown', handleSpacebar);
  answerContainer.innerText = 'Interview stopped.';
  controlsSection.style.display = 'flex';
  showAnswerContainer(false);
  setMicActive(false);
  if (window.electronAPI && window.electronAPI.setOverlayMode) {
    window.electronAPI.setOverlayMode(false);
  }
};

closeBtn.onclick = () => {
  overlayContainer.style.display = 'none';
  setMicActive(false);
};

// Provider selection handling
providerSelect.addEventListener('change', (e) => {
  const provider = e.target.value;
  if (provider === 'openai') {
    apiKeyInput.placeholder = 'OpenAI API Key';
  } else if (provider === 'gemini') {
    apiKeyInput.placeholder = 'Gemini API Key';
  }
});

// Gemini API functions
async function sendToGeminiSpeech(blob, apiKey) {
  setStatus('Transcribing...', '');
  
  // Convert blob to base64 for Gemini API
  const arrayBuffer = await blob.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  try {
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US'
        },
        audio: {
          content: base64Audio
        }
      })
    });
    
    if (!response.ok) throw new Error('Gemini Speech API error');
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].alternatives[0].transcript;
    }
    return '';
  } catch (err) {
    setStatus('Gemini Speech error: ' + err.message, 'error');
    return '';
  }
}

async function sendToGeminiChat(question, resume, apiKey) {
  setStatus('Getting answer...', '');
  const systemPrompt = `You are helping in a live interview. Use the following resume to answer as if you are the candidate. Ignore any unrelated speech or background talk. Focus on the actual interview question and answer smartly as per the resume.\n\nResume:\n${resume}`;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nQuestion: ${question}`
          }]
        }]
      })
    });
    
    if (!response.ok) throw new Error('Gemini Chat API error');
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    return '';
  } catch (err) {
    setStatus('Gemini Chat error: ' + err.message, 'error');
    return '';
  }
}

// On load, hide answer container
showAnswerContainer(false);
