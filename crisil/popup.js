document.getElementById('scrape').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
    alert('This page cannot be scripted.');
    return;
  }

  try {
    // Clear links before scraping
    chrome.storage.local.set({ scrapedLinks: [] }, () => {
      console.log('Cleared previously scraped links.');
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: 'scrape_links' }, (response) => {
      if (response?.status === 'success') {
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
      }
    });
  } catch (error) {
    console.error('Error executing content script:', error);
    alert('An error occurred. Check the console for details.');
  }
});

document.getElementById('test-all-links').addEventListener('click', async () => {
  chrome.storage.local.get('scrapedLinks', async (data) => {
    const links = data.scrapedLinks || [];
    const resultsList = document.getElementById('results');

    if (links.length === 0) {
      alert('No links to test.');
      return;
    }

    resultsList.innerHTML = ''; // Clear the results list

    for (const link of links) {
      const listItem = document.createElement('li');
      listItem.textContent = `Testing ${link}...`;
      resultsList.appendChild(listItem);

      try {
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: link }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        listItem.textContent = `${link} - ${data.prediction} (${data.confidence.toFixed(2)})`;
        listItem.style.color = data.prediction === 'Safe' ? 'green' : 'red';
      } catch (error) {
        listItem.textContent = `${link} - Error during test.`;
        listItem.style.color = 'orange';
        console.error('Error testing link:', error);
      }
    }
  });
});

document.getElementById('test-curr-link').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url) {
    alert('No URL available to test.');
    return;
  }

  const url = tab.url;
  const resultsList = document.getElementById('results');
  const listItem = document.createElement('li');
  listItem.textContent = `Testing current URL: ${url}...`;
  resultsList.appendChild(listItem);

  try {
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    });
    const data = await response.json();
    listItem.textContent = `${url} - ${data.prediction} (${data.confidence.toFixed(2)})`;
    listItem.style.color = data.prediction === 'Safe' ? 'green' : 'red';
  } catch {
    listItem.textContent = `${url} - Error during test.`;
    listItem.style.color = 'orange';
  }
});
