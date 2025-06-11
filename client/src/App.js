import React, { useState } from "react";
import axios from "axios";
import './App.css';


function App() {
 const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [video, setVideo] = useState(null);
  const [selectedNoteType, setSelectedNoteType] = useState('summary');
  const [bulletPoints, setBulletPoints] = useState('');
  const [flashcards, setFlashcards] = useState('');
  const [mindMap, setMindMap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("Page1 component rendered");

  const handleAudioChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleTranscribe = () => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    axios.post("http://127.0.0.1:5000/transcribe", formData)
   .then((response) => {
        setTranscription(response.data.transcription);
        console.log("Transcription received");
      })
   .catch((error) => {
        console.error(error);
      });
  };

  const handleGenerateNotes = () => {
    setIsLoading(true);
    setError(null);

    const text = transcription || summary || '';
    const endpoint = `/generate-${selectedNoteType}`;

    axios.post(`http://127.0.0.1:5000${endpoint}`, { text })
        .then((response) => {
            switch (selectedNoteType) {
                case 'bullets':
                    setBulletPoints(response.data.bullet_points);
                    break;
                case 'flashcards':
                    setFlashcards(response.data.flashcards);
                    break;
                case 'summarize':
                    setSummary(response.data.summary)
                    break;
                case 'mindmap':
                    setMindMap(response.data.mind_map);
                    break;
                default:
                    setSummary(response.data.summary);
            }
            setIsLoading(false);
        })
        .catch((error) => {
            setError(error.message);
            setIsLoading(false);
        });
};

  const handleGenerateVideo = () => {
    axios.post("http://127.0.0.1:5000/generate-video", { summary: summary })
   .then((response) => {
        setVideo(response.data.video);
        console.log("Video received");
      })
   .catch((error) => {
        console.error(error);
      });
  };

  return (
   <div className="app">
      {/* Hero Section */}
      <div className="hero-heading">
        <h1 className="main-title">EchoNote.</h1>
        <p className="main-subtext">Turn your voice into polished notes using AI.</p>
      </div>

      {/* Card Section */}
      <div className="card">
        <h2 className="title">Voice-to-Content AI</h2>
        <p className="subtitle">Upload, transcribe, summarize voice recordings with ease.</p>

        {/* File Input Section */}
        <div className="file-input-section">
          <input
            type="file"
            onChange={handleAudioChange}
            className="file-input"
            accept="audio/*"
          />
          <button onClick={handleTranscribe} className="btn">
            Transcribe
          </button>
        </div>

        {/* Transcription Panel */}
        {transcription && (
          <div className="panel">
            <h3>Transcription:</h3>
            <p className="output">{transcription}</p>
            <div className="note-type-selector">
              <label htmlFor="noteType">Select Note Type:</label>
              <select
                id="noteType"
                value={selectedNoteType}
                onChange={(e) => setSelectedNoteType(e.target.value)}
              >
                <option value="summarize">Summary</option>
                <option value="bullets">Bullet Points</option>
                <option value="flashcards">Flashcards</option>
                <option value="mindmap">Mind Map</option>
              </select>
              <button onClick={handleGenerateNotes} className="btn">
                Generate Notes
              </button>
            </div>
          </div>
        )}

        {summary && (
          <div className="panel">
            <h3>Summary:</h3>
            <p className="output">{summary}</p>
          </div>

        )}

        {/* Display Sections */}
        {bulletPoints && (
          <div className="panel">
            <h3>Bullet Points:</h3>
            <ul className="bullet-list">
              {bulletPoints.split('\n').map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {flashcards && (
          <div className="panel">
            <h3>Flashcards:</h3>
            <div className="flashcard-container">
              {flashcards.split('\n\n').map((card, index) => (
                <div key={index} className="flashcard">
                  <div className="question">{card.split('\n')[1]}</div>
                  <div className="answer">{card.split('\n')[2]}</div>
                </div>
              ))}
            </div>
          </div>
        )}



        {mindMap && (
          <div className="panel">
            <h3>Mind Map:</h3>
            <div className="mindmap-display">
              {mindMap}
            </div>
          </div>
        )}

        {video && (
          <div className="panel">
            <h3>Generated Video:</h3>
            <video src={video} controls className="video-output" />
          </div>
        )}

        {/* Loading and Error States */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Generating notes...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;