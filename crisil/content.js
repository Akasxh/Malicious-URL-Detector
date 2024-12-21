// (() => {
//     const links = Array.from(document.querySelectorAll('a')).map(link => link.href);
//     chrome.storage.local.set({ scrapedLinks: links });
//     console.log('Scraped Links:', links);
//   })();


(() => {
  // Function to scrape links
  const scrapeLinks = () => {
    const links = Array.from(document.querySelectorAll('a'))
      .map((anchor) => anchor.href)
      .filter((href) => href && href.startsWith('http')); // Only keep valid HTTP(S) links
    chrome.storage.local.set({ scrapedLinks: links }, () => {
      console.log('Links scraped and saved:', links);
    });
  };

  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrape_links') {
      scrapeLinks();
      sendResponse({ status: 'success' });
    }
  });

  // Inject a popup when clicking a link (existing feature)
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    event.preventDefault();
    const url = link.href;

    // Remove existing popup
    let existingPopup = document.getElementById('malicious-check-popup');
    if (existingPopup) existingPopup.remove();

    // Create the popup dynamically
    existingPopup = document.createElement('div');
    existingPopup.id = 'malicious-check-popup';
    existingPopup.style.position = 'fixed';
    existingPopup.style.top = `${event.clientY}px`;
    existingPopup.style.left = `${event.clientX}px`;
    existingPopup.style.padding = '15px';
    existingPopup.style.border = '1px solid #ccc';
    existingPopup.style.backgroundColor = '#fff';
    existingPopup.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.2)';
    existingPopup.style.zIndex = '9999';
    existingPopup.style.fontSize = '14px';
    existingPopup.style.borderRadius = '5px';
    existingPopup.style.width = '250px';

    existingPopup.innerHTML = `
      <p style="margin: 0 0 10px; font-weight: bold; color: #333;">Check Link:</p>
      <button id="check-link" style="background-color: #007BFF; color: #fff; border: none; padding: 8px 12px; cursor: pointer; border-radius: 5px; font-size: 14px;">Check</button>
      <button id="open-link" style="display: none; background-color: #28a745; color: #fff; border: none; padding: 8px 12px; cursor: pointer; border-radius: 5px; margin-left: 5px; font-size: 14px;">Open</button>
      <p id="result" style="margin: 10px 0 0; color: #333; font-size: 14px;"></p>
      <button id="close-popup" style="margin-top: 10px; background-color: #dc3545; color: #fff; border: none; padding: 8px 12px; cursor: pointer; border-radius: 5px; font-size: 14px;">Close</button>
    `;

    document.body.appendChild(existingPopup);

    const checkButton = existingPopup.querySelector('#check-link');
    const openButton = existingPopup.querySelector('#open-link');
    const result = existingPopup.querySelector('#result');
    const closeButton = existingPopup.querySelector('#close-popup');

    // Check the link for maliciousness
    checkButton.addEventListener('click', () => {
      result.textContent = 'Checking...';
      fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.prediction === 'Safe') {
            result.textContent = '✅ This link is Safe!';
            result.style.color = 'green';
            openButton.style.display = 'inline-block';
          } else {
            result.textContent = '🚨 This link is Not Safe!';
            result.style.color = 'red';
          }
        })
        .catch(() => {
          result.textContent = 'Error checking the link.';
          result.style.color = 'orange';
        });
    });

    // Open the link if safe
    openButton.addEventListener('click', () => {
      window.open(url, '_blank');
    });

    // Close the popup
    closeButton.addEventListener('click', () => {
      existingPopup.remove();
    });
    // Close the popup if the user clicks outside it
    const closePopupIfClickedOutside = (event) => {
      if (!existingPopup.contains(event.target)) {
        existingPopup.remove();
        document.removeEventListener('click', closePopupIfClickedOutside); // Clean up the listener
      }
    };

    // Add event listener for clicks outside the popup
    document.addEventListener('click', closePopupIfClickedOutside);

  });
})();
