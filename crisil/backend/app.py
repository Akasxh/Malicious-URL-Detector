import re, torch, requests, ipaddress, whois, urllib, socket, urllib.request, numpy as np
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from flask_cors import CORS
from urllib.parse import urlparse,urlencode
from datetime import datetime
from bs4 import BeautifulSoup
import joblib
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

pattern = r"^(https?://(?:www\.)?(?:[a-zA-Z0-9-]+\.)?(google|gmail|yahoomail|microsoft|github|stackoverflow|apple|facebook|amazon|twitter|linkedin|youtube|wikipedia|reddit|netflix|paypal|instagram|whatsapp|zoom|dropbox|adobe|bing|tesla|spotify|salesforce|oracle)\.[a-z]{2,})"

tokenizer = AutoTokenizer.from_pretrained(r"C:\Users\ammar\OneDrive - Indian Institute of Technology Patna\Desktop\CRISIL-20241218T195735Z-001\CRISIL")
model = AutoModelForSequenceClassification.from_pretrained(r"C:\Users\ammar\OneDrive - Indian Institute of Technology Patna\Desktop\CRISIL-20241218T195735Z-001\CRISIL")
model.eval()

mlp_model = joblib.load('mlp_model.joblib')

# 1.Domain of the URL (Domain)
def getDomain(url):
    domain = urlparse(url).netloc
    if re.match(r"^www.",domain):
        domain = domain.replace("www.","")
    return domain

# 2.Checks for IP address in URL (Have_IP)
def havingIP(url):
  try:
    ipaddress.ip_address(url)
    ip = 1
  except:
    ip = 0
  return ip

# 3.Checks the presence of @ in URL (Have_At)
def haveAtSign(url):
  if "@" in url:
    at = 1
  else:
    at = 0
  return at

# 4.Finding the length of URL and categorizing (URL_Length)
def getLength(url):
  if len(url) < 54:
    length = 0
  else:
    length = 1
  return length

# 5.Gives number of '/' in URL (URL_Depth)
def getDepth(url):
  s = urlparse(url).path.split('/')
  depth = 0
  for j in range(len(s)):
    if len(s[j]) != 0:
      depth = depth+1
  return depth

# 6.Checking for redirection '//' in the url (Redirection)
def redirection(url):
  pos = url.rfind('//')
  if pos > 6:
    if pos > 7:
      return 1
    else:
      return 0
  else:
    return 0

# 7.Existence of “HTTPS” Token in the Domain Part of the URL (https_Domain)
def httpDomain(url):
  domain = urlparse(url).netloc
  if 'https' in domain:
    return 1
  else:
    return 0

shortening_services = r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|" \
                      r"yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|" \
                      r"short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|" \
                      r"doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|" \
                      r"qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|" \
                      r"po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|" \
                      r"prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|" \
                      r"tr\.im|link\.zip\.net"

# 8. Checking for Shortening Services in URL (Tiny_URL)
def tinyURL(url):
    match=re.search(shortening_services,url)
    if match:
        return 1
    else:
        return 0

# 9.Checking for Prefix or Suffix Separated by (-) in the Domain (Prefix/Suffix)
def prefixSuffix(url):
    if '-' in urlparse(url).netloc:
        return 1            # phishing
    else:
        return 0            # legitimate

# 11.DNS Record availability (DNS_Record)
# obtained in the featureExtraction function itself

"""
def web_traffic(url):
    try:
        # Filling the whitespaces in the URL if any
        url = urllib.parse.quote(url)
        rank = BeautifulSoup(urllib.request.urlopen("http://data.alexa.com/data?cli=10&dat=s&url=" + url).read(), "xml").find("REACH")['RANK']
        rank = int(rank)
    except (urllib.error.URLError, socket.gaierror, TypeError) as e:
        print(f"Error fetching web traffic data: {e}")
        return 1  # Return a default value indicating a legitimate URL

    if rank < 100000:
        return 1  # High traffic, likely legitimate
    else:
        return 0  # Low traffic, might be suspicious
"""


# 13.Survival time of domain: The difference between termination time and creation time (Domain_Age)
def domainAge(domain_name):
  creation_date = domain_name.creation_date
  expiration_date = domain_name.expiration_date
  if (isinstance(creation_date,str) or isinstance(expiration_date,str)):
    try:
      creation_date = datetime.strptime(creation_date,'%Y-%m-%d')
      expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
    except:
      return 1
  if ((expiration_date is None) or (creation_date is None)):
      return 1
  elif ((type(expiration_date) is list) or (type(creation_date) is list)):
      return 1
  else:
    ageofdomain = abs((expiration_date - creation_date).days)
    if ((ageofdomain/30) < 6):
      age = 1
    else:
      age = 0
  return age

# 14.End time of domain: The difference between termination time and current time (Domain_End)
def domainEnd(domain_name):
  expiration_date = domain_name.expiration_date
  if isinstance(expiration_date,str):
    try:
      expiration_date = datetime.strptime(expiration_date,"%Y-%m-%d")
    except:
      return 1
  if (expiration_date is None):
      return 1
  elif (type(expiration_date) is list):
      return 1
  else:
    today = datetime.now()
    end = abs((expiration_date - today).days)
    if ((end/30) < 6):
      end = 0
    else:
      end = 1
  return end

# 15. IFrame Redirection (iFrame)
def iframe(response):
  if response == "":
      return 1
  else:
      if re.findall(r"[|]", response.text):
          return 0
      else:
          return 1

# 16.Checks the effect of mouse over on status bar (Mouse_Over)
def mouseOver(response):
  if response == "" :
    return 1
  else:
    if re.findall("", response.text):
      return 1
    else:
      return 0

# 17.Checks the status of the right click attribute (Right_Click)
def rightClick(response):
  if response == "":
    return 1
  else:
    if re.findall(r"event.button ?== ?2", response.text):
      return 0
    else:
      return 1

# 18.Checks the number of forwardings (Web_Forwards)
def forwarding(response):
  if response == "":
    return 1
  else:
    if len(response.history) <= 2:
      return 0
    else:
      return 1


def feature_extraction(url):
    features = []

    # Address bar-based features
    features.extend([
        havingIP(url),
        haveAtSign(url),
        getLength(url),
        getDepth(url),
        redirection(url),
        httpDomain(url),
        tinyURL(url),
        prefixSuffix(url)
    ])

    # Domain-based features
    dns = 0
    try:
        domain_name = whois.whois(urlparse(url).netloc)
    except:
        dns = 1
        domain_name = None

    features.extend([
        dns,
        1 if dns == 1 else domainAge(domain_name),
        1 if dns == 1 else domainEnd(domain_name)
    ])

    # HTML & Javascript-based features
    try:
        response = requests.get(url)
    except:
        response = None

    features.extend([
        iframe(response),
        mouseOver(response),
        rightClick(response),
        forwarding(response),
    ])

    return np.array(features).reshape(1, -1)
    # return features

def preprocess_url(url):
    return tokenizer(url, return_tensors="pt", truncation=True, padding=True, max_length=512)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if re.search(pattern, url):
        return jsonify({
            "url": url,
            "prediction": "Safe",
            "confidence": 1.0
        })
    
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

@app.route('/predict2', methods=['POST'])
def predict2():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if re.search(pattern, url):
        return jsonify({
            "url": url,
            "prediction": "Safe",
            "confidence": 1.0
        })
    
    inputs = feature_extraction(url)

    prediction = mlp_model.predict(inputs)  # Predicting using the MLP model
    confidence = mlp_model.predict_proba(inputs).max()  # Getting the probability of the prediction (confidence)

    return jsonify({
        "url": "Current URL",
        "prediction": "Safe" if prediction == 0 else "Not Safe",
        "confidence": confidence
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
