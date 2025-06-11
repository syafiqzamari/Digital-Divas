from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import shutil
from pathlib import Path
import whisper
from transformers import pipeline
from gtts import gTTS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

# Load Whisper model
whisper_model = whisper.load_model("base")

# Load Hugging Face summarization pipeline
summarizer = pipeline(
    "text2text-generation",
    model="google/flan-t5-large",
    max_length=1000,
    min_length=100,
    do_sample=False,
)

# Create temporary directory for file storage
temp_dir = tempfile.mkdtemp()
os.makedirs(temp_dir, exist_ok=True)

def cleanup_temp_files():
    """Clean up temporary files created during processing."""
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            if not file_path.endswith("notes.txt"):
                os.remove(file_path)

@app.route("/transcribe", methods=["POST"])
def transcribe():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files["audio"]
        if audio_file.filename == "":
            return jsonify({"error": "No audio file selected"}), 400

        audio_path = Path(temp_dir) / "audio.wav"
        audio_file.save(audio_path)

        transcription = whisper_model.transcribe(str(audio_path))
        text = transcription["text"]

        cleanup_temp_files()

        return jsonify({"transcription": text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/summarize", methods=["POST"])
def summarize():
    try:
        if not request.json or "text" not in request.json:
            return jsonify({"error": "No text provided"}), 400

        text = request.json["text"]
        if not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({"error": "Invalid text provided"}), 400

        # Generate summary using the Hugging Face pipeline
        summary = summarizer(text)
        summary_text = summary[0]["generated_text"]

        # Save summary to a local file
        file_path = os.path.join(os.path.expanduser("~"), "Documents", "notes.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(summary_text)

        return jsonify({"message": "Summary saved to local file successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate-video", methods=["POST"])
def generate_video():
    try:
        if not request.json or "summary" not in request.json:
            return jsonify({"error": "No summary provided"}), 400

        summary = request.json["summary"]
        if not isinstance(summary, str) or len(summary.strip()) == 0:
            return jsonify({"error": "Invalid summary provided"}), 400

        # Generate audio from summary
        audio = gTTS(text=summary, lang="en", slow=False)
        audio_path = Path(temp_dir) / "summary.mp3"
        audio.save(audio_path)

        return jsonify({"message": "Video generation initiated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    try:
        app.run(debug=True)
    finally:
        cleanup_temp_files()