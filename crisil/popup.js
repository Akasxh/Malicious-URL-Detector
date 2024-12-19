document.getElementById('scrape').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if the URL is valid for scripting
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
    alert('This page cannot be scripted.');
    return;
  }

  try {
    // Inject the content script to scrape links
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // Fetch and display scraped links
    chrome.storage.local.get('scrapedLinks', (data) => {
      const results = data.scrapedLinks || [];
      const resultsList = document.getElementById('results');
      if (results.length === 0) {
        resultsList.innerHTML = '<li>No links found on this page.</li>';
      } else {
        resultsList.innerHTML = results
          .map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`)
          .join('');
      }
    });
  } catch (error) {
    console.error('Error executing content script:', error);
    alert('An error occurred. Check the console for details.');
  }
});

document.getElementById('test').addEventListener('click', () => {
  console.log('Test malicious links button clicked');

  // Fetch scraped links from storage
  chrome.storage.local.get('scrapedLinks', (data) => {
    const links = data.scrapedLinks || [];
    console.log('Scraped links:', links);

    // Send the links to the background script for testing
    chrome.runtime.sendMessage({ action: 'testMaliciousLinks', links: links }, (response) => {
      console.log('Received response from background:', response);
      const maliciousLinks = response.maliciousLinks || [];
      const maliciousResultsList = document.getElementById('maliciousResults');

      if (maliciousLinks.length === 0) {
        maliciousResultsList.innerHTML = '<li>No malicious links found.</li>';
      } else {
        maliciousResultsList.innerHTML = maliciousLinks
          .map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`)
          .join('');
      }
    });
  });
});
