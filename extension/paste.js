document.addEventListener('DOMContentLoaded', function() {
  const pasteButton = document.getElementById('pasteButton');
  const statusText = document.getElementById('status');
  const loadingSpinner = document.getElementById('loading');
  
  // Update the button text to show the shortcut and add customize link
  pasteButton.innerHTML = 'Paste Screenshot (⌘⇧Y) <a href="chrome://extensions/shortcuts" style="font-size: 12px; margin-left: 5px;">[Customize]</a>';

  // Function to handle paste
  async function handlePaste() {
    try {
      statusText.textContent = 'Reading clipboard...';
      loadingSpinner.style.display = 'block';
      pasteButton.disabled = true;

      const clipboardItems = await navigator.clipboard.read();
      let imageBlob = null;

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes('image/png')) {
          imageBlob = await clipboardItem.getType('image/png');
          break;
        }
      }

      if (!imageBlob) {
        throw new Error('No image found in clipboard');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      statusText.textContent = 'Processing image...';

      const response = await fetch('http://localhost:3000/api/process-screenshots', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.result.links && data.result.links.length > 0) {
        statusText.textContent = 'Success! Opening calendar...';
        data.result.links.forEach(link => {
          chrome.tabs.create({ url: link, active: false });
        });
      } else {
        throw new Error('No calendar events found in the screenshot');
      }

    } catch (error) {
      console.error('Error:', error);
      statusText.textContent = `Error: ${error.message}`;
    } finally {
      loadingSpinner.style.display = 'none';
      pasteButton.disabled = false;
    }
  }

  // Listen for clicks on the paste button
  pasteButton.addEventListener('click', handlePaste);

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "triggerPaste") {
      handlePaste();
    }
  });

  // Automatically trigger paste when opened via hotkey
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('source') === 'hotkey') {
    handlePaste();
  }

  // Add click handler for the customize link
  document.querySelector('a[href="chrome://extensions/shortcuts"]').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
}); 