# Malicious URL Detection

## Project Overview
This project was developed as part of the **CRISIL Hackathon** by team members **S Akash** and **Ammar Ahmad**. It is designed to detect malicious URLs to safeguard users from phishing attacks. The system leverages **BERT** and **MLP-based** models for URL classification and integrates with a browser extension to provide real-time protection.

---

## Models Used

### 1. BERT-based Model
- **Architecture**: Pre-trained BERT model fine-tuned for binary classification.
- **Purpose**: Leverages contextual understanding of text to identify patterns associated with phishing links.
- **Dataset**: Trained on a comprehensive dataset of URLs, including malicious and legitimate samples.
- **Key Features**:
  - Analyzes text patterns within URLs.
  - Captures semantic features for better accuracy.
  - Robust against obfuscation techniques commonly used in phishing attacks.

### 2. MLP-based Model
- **Architecture**: Multi-Layer Perceptron (MLP) model with dense layers and ReLU activation.
- **Purpose**: Evaluates numerical and structural features of URLs, such as length, presence of special characters, and domain patterns.
- **Dataset**: Utilizes feature-engineered input based on URL properties.
- **Key Features**:
  - Faster computation and lightweight.
  - Suitable for quick predictions in environments with resource constraints.
  - Complements BERT by identifying structural anomalies.

---

## Browser Extension

### Features
1. **Real-Time URL Classification**
   - Analyzes the URL of the current webpage and classifies it as **Safe** or **Malicious**.
2. **Popup Warnings**
   - Displays warnings for suspicious or malicious links when users click on them.
3. **User-Friendly Dashboard**
   - Tracks history of scanned URLs and their classifications.
4. **Custom Scan Feature**
   - Allows users to manually input and scan any URL.
5. **Secure Communication**
   - Ensures encrypted communication with the classification server to protect user data.
6. **Lightweight and Fast**
   - Optimized for minimal performance overhead.

### Workflow
1. User navigates to a webpage.
2. The extension fetches the URL and sends it to the backend.
3. The backend utilizes either the BERT or MLP model to analyze the URL.
4. Results are displayed via a popup or notification.
5. Additional actions (reporting or blacklisting) can be taken based on user input.

---

## Installation
1. Clone this repository.
2. Navigate to the `browser_extension` folder.
3. Open Chrome or any Chromium-based browser.
4. Go to `chrome://extensions/`.
5. Enable **Developer mode**.
6. Click on **Load unpacked** and select the extension folder.

---

## Technologies Used
- **Backend**: Python, Flask.
- **Models**: PyTorch, Transformers (BERT), Scikit-learn.
- **Frontend**: HTML, CSS, JavaScript.
- **Browser Extension**: JavaScript APIs for web extensions.

---

## Future Enhancements
- **Enhanced Blacklist Database**: Incorporate more threat intelligence feeds.
- **Model Optimization**: Further tuning and compression for faster predictions.
- **Cross-Browser Support**: Extend compatibility to Firefox and Edge.
- **Behavior Analysis**: Introduce dynamic analysis based on user interactions.

---

## Contributors
- **S Akash**  
- **Ammar Ahmad**  

---

## Acknowledgments
Special thanks to **CRISIL** for organizing the hackathon and providing an excellent platform to develop this project.
