// (() => {
//     const links = Array.from(document.querySelectorAll('a')).map(link => link.href);
//     chrome.storage.local.set({ scrapedLinks: links });
//     console.log('Scraped Links:', links);
//   })();


(() => {
  // Existing link scraping functionality
  const links = Array.from(document.querySelectorAll('a')).map(link => link.href);
  chrome.storage.local.set({ scrapedLinks: links });
  console.log('Scraped Links:', links);

  // Inject CSS for the popup
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);

  // Listen for link clicks
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    // Prevent navigation
    event.preventDefault();

    const url = link.href;

    // Remove any existing popup
    const existingPopup = document.getElementById('malicious-check-popup');
    if (existingPopup) existingPopup.remove();

    // Create the popup
    const popup = document.createElement('div');
    popup.id = 'malicious-check-popup';
    popup.style.position = 'fixed';
    popup.style.top = `${event.clientY + 10}px`;
    popup.style.left = `${event.clientX + 10}px`;
    popup.style.backgroundColor = '#fff';
    popup.style.border = '1px solid #ccc';
    popup.style.padding = '10px';
    popup.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    popup.style.zIndex = 10000;
    popup.innerHTML = `
      <p>Check if this link is malicious:</p>
      <button id="check-link">Check</button>
      <button id="open-link" style="display: none;">Open Link</button>
      <p id="result" style="margin-top: 10px;"></p>
      <button id="close-popup" style="margin-top: 5px;">Close</button>
    `;

    document.body.appendChild(popup);

    // Add event listener to the "Check" button
    document.getElementById('check-link').addEventListener('click', () => {
      document.getElementById('result').textContent = 'Checking...';
      fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
        .then((response) => response.json())
        .then((data) => {
          const resultText = data.prediction === 'Not Safe' ? '🚨 Not Safe!' : '✅ Safe!';
          document.getElementById('result').textContent = resultText;

          if (data.prediction === 'Safe') {
            // Show the "Open Link" button if safe
            const openLinkButton = document.getElementById('open-link');
            openLinkButton.style.display = 'inline-block';
            openLinkButton.addEventListener('click', () => {
              window.open(url, '_blank');
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          document.getElementById('result').textContent = 'Error checking the link.';
        });
    });

    // Add event listener to the "Close" button
    document.getElementById('close-popup').addEventListener('click', () => {
      popup.remove();
    });
  });
})();
