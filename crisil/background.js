chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);

  if (request.action === 'testMaliciousLinks') {
    const links = request.links;
    const maliciousLinks = [];

    // Send all URLs to the server for prediction
    const promises = links.map(url => {
      return fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Prediction result for', url, data);
        if (data.prediction === 'Not Safe') {
          maliciousLinks.push(url);
        }
      })
      .catch(error => {
        console.error('Error processing link:', error);
      });
    });

    // Wait for all requests to finish before responding with malicious links
    Promise.all(promises).then(() => {
      console.log('Malicious links found:', maliciousLinks);
      sendResponse({ maliciousLinks: maliciousLinks });
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});
