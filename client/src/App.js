import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [video, setVideo] = useState(null);

  const handleAudioChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleTranscribe = () => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    axios.post("http://127.0.0.1:5000/transcribe", formData)
     .then((response) => {
        setTranscription(response.data.transcription);
      })
     .catch((error) => {
        console.error(error);
      });
  };

  const handleSummarize = () => {
    axios.post("http://127.0.0.1:5000/summarize", { text: transcription })
     .then((response) => {
        setSummary(response.data.summary);
      })
     .catch((error) => {
        console.error(error);
      });
  };

  const handleGenerateVideo = () => {
    axios.post("http://127.0.0.1:5000/generate-video", { summary: summary })
     .then((response) => {
        setVideo(response.data.video);
      })
     .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Voice-to-Content AI</h1>
      <input type="file" onChange={handleAudioChange} />
      <button onClick={handleTranscribe}>Transcribe</button>
      <p>Transcription: {transcription}</p>
      <button onClick={handleSummarize}>Summarize</button>
      <p>Summary: {summary}</p>
      <button onClick={handleGenerateVideo}>Generate Video</button>
      <video src={video} controls />
    </div>
  );
}

export default App;