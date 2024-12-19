from flask import Flask, request, jsonify
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask_cors import CORS

app = Flask(__name__)

app = Flask(__name__)
CORS(app)

tokenizer = AutoTokenizer.from_pretrained(r"C:\Users\ammar\OneDrive - Indian Institute of Technology Patna\Desktop\CRISIL-20241218T195735Z-001\CRISIL")
model = AutoModelForSequenceClassification.from_pretrained(r"C:\Users\ammar\OneDrive - Indian Institute of Technology Patna\Desktop\CRISIL-20241218T195735Z-001\CRISIL")
model.eval()

def preprocess_url(url):
    return tokenizer(url, return_tensors="pt", truncation=True, padding=True, max_length=512)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    inputs = preprocess_url(url)

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    probabilities = torch.nn.functional.softmax(logits, dim=-1)
    id2label = {0: "Safe", 1: "Not Safe"}
    predicted_label_id = torch.argmax(probabilities, dim=1).item()
    predicted_label = id2label[predicted_label_id]

    return jsonify({
        "url": url,
        "prediction": predicted_label,
        "confidence": float(probabilities[0][predicted_label_id])
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)