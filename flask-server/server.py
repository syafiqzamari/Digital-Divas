from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import whisper
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from gtts import gTTS

app = Flask(__name__)
CORS(app)

# Load Whisper API
whisper_model = whisper.load_model("base")

# Load Hugging Face API
model_name = "t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Define routes
@app.route("/transcribe", methods=["POST"])
def transcribe():
    audio_file = request.files["audio"]
    audio_file.save("audio.wav")
    transcription = whisper_model.transcribe("audio.wav")
    return jsonify({"transcription": transcription["text"]})

@app.route("/summarize", methods=["POST"])
def summarize():
    text = request.json["text"]
    input_ids = tokenizer.encode(text, return_tensors="pt")
    output = model.generate(input_ids, max_length=100)
    summary = tokenizer.decode(output[0], skip_special_tokens=True)
    return jsonify({"summary": summary})

@app.route("/generate-video", methods=["POST"])
def generate_video():
    summary = request.json["summary"]
    audio = gTTS(text=summary, lang="en")
    audio.save("summary.mp3")
    return jsonify({"video": "summary.mp3"})

if __name__ == "__main__":
    app.run(debug=True)