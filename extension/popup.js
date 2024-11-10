document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');
  const overlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PROCESSING_STATUS') {
      if (message.status === 'start') {
        overlay.classList.add('active');
        processingStatus.textContent = 'Reading clipboard...';
      } else if (message.status === 'processing') {
        processingStatus.textContent = 'Processing image...';
      } else if (message.status === 'success') {
        processingStatus.textContent = 'Opening calendar links...';
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 1000);
      } else if (message.status === 'error') {
        processingStatus.textContent = message.error || 'Error processing screenshot';
        statusDiv.textContent = message.error || 'Error processing screenshot';
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 2000);
      }
    } else if (message.type === 'TRIGGER_PASTE_BUTTON') {
      // Automatically trigger paste when shortcut is used
      handlePaste();
    }
  });

  async function handlePaste() {
    try {
      overlay.classList.add('active');
      processingStatus.textContent = 'Reading clipboard...';
      
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

      processingStatus.textContent = 'Processing image...';
      
      // Create form data and send to API
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

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
        processingStatus.textContent = 'Opening calendar links...';
        
        // Open all calendar links in new tabs
        data.result.links.forEach(link => {
          chrome.tabs.create({ url: link, active: false });
        });

        setTimeout(() => {
          overlay.classList.remove('active');
        }, 1000);
      } else {
        throw new Error('No calendar events found in the screenshot');
      }

    } catch (error) {
      console.error('Error:', error);
      processingStatus.textContent = error.message || 'Failed to process screenshot';
      statusDiv.textContent = error.message || 'Failed to process screenshot';
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 2000);
    }
  }

  // Add click handler for manual paste button
  pasteBtn.addEventListener('click', handlePaste);

  // Add click handler for capture button
  captureBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab');

      overlay.classList.add('active');
      processingStatus.textContent = 'Capturing screenshot...';

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      chrome.tabs.sendMessage(tab.id, { action: "capture" });
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error: Failed to capture screenshot';
    }
  });
}); 