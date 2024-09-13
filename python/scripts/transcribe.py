# scripts/transcribe.py
import whisper
import sys
import json

def transcribe(audio_path, model="base"):
    print("Progress: Loading model: " + model)
    model = whisper.load_model(model)

    print("Progress: Transcribing audio: " + audio_path)
    result = model.transcribe(audio_path, language="zh", fp16=False, verbose=False)

    print("Progress: Transcription complete")
    print(json.dumps(result['segments']))  # Print the result segments as a JSON string

if __name__ == "__main__":
    audio_path = sys.argv[1]
    model = sys.argv[2]
    transcribe(audio_path, model)
