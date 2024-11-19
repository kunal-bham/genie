document.addEventListener('DOMContentLoaded', function() {
  // Connect to background script to track popup state
  const port = chrome.runtime.connect({ name: 'popup' });

  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');
  const overlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');
  const statusMessage = document.getElementById('statusMessage');
  const captureBtn = document.getElementById('captureBtn');

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PROCESSING_STATUS') {
      if (message.status === 'start') {
        overlay.classList.add('active');
        processingStatus.textContent = 'Reading clipboard...';
        statusMessage.classList.remove('active', 'error'); // Hide any previous error
      } else if (message.status === 'processing') {
        processingStatus.textContent = 'Processing image...';
      } else if (message.status === 'success') {
        processingStatus.textContent = 'Opening calendar links...';
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 1000);
      } else if (message.status === 'error') {
        overlay.classList.remove('active');
        statusMessage.textContent = message.error;
        statusMessage.classList.add('active', 'error');
      }
    } else if (message.type === 'TRIGGER_PASTE_BUTTON') {
      handlePaste();
    } else if (message.type === 'TRIGGER_CAPTURE_BUTTON') {
      handleCapture();
    }
  });

  async function handlePaste() {
    try {
      // Hide any previous error message
      statusMessage.classList.remove('active', 'error');

      // Check clipboard before showing loading state
      const clipboardItems = await navigator.clipboard.read();
      let hasImage = false;

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes('image/png')) {
          hasImage = true;
          break;
        }
      }

      if (!hasImage) {
        statusMessage.textContent = 'No screenshot found';
        statusMessage.classList.add('active', 'error');
        return;
      }

      // If we have an image, proceed with loading state
      overlay.classList.add('active');
      processingStatus.textContent = 'Reading clipboard...';
      
      const imageBlob = await clipboardItems[0].getType('image/png');
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
        overlay.classList.remove('active');
        statusMessage.textContent = 'No events found in screenshot';
        statusMessage.classList.add('active', 'error');
      }

    } catch (error) {
      console.error('Error:', error);
      overlay.classList.remove('active');
      
      if (error.message === 'No image found in clipboard') {
        statusMessage.textContent = 'No screenshot found';
      } else if (error.message === 'No calendar events found in the screenshot') {
        statusMessage.textContent = 'No events found in screenshot';
      } else {
        statusMessage.textContent = error.message || 'Failed to process screenshot';
      }
      
      statusMessage.classList.add('active', 'error');
    }
  }

  // Add capture screenshot functionality
  async function handleCapture() {
    try {
      // Hide any previous error message
      statusMessage.classList.remove('active', 'error');

      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Show processing overlay
      overlay.classList.add('active');
      processingStatus.textContent = 'Capturing screenshot...';

      // Capture the visible tab
      const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      
      // Convert base64 to blob
      const response = await fetch(screenshot);
      const imageBlob = await response.blob();

      processingStatus.textContent = 'Processing screenshot...';
      
      // Create form data and send to API
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      const apiResponse = await fetch('http://localhost:3000/api/process-screenshots', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
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
        overlay.classList.remove('active');
        statusMessage.textContent = 'No events found in screenshot';
        statusMessage.classList.add('active', 'error');
      }

    } catch (error) {
      console.error('Error:', error);
      overlay.classList.remove('active');
      statusMessage.textContent = error.message || 'Failed to capture screenshot';
      statusMessage.classList.add('active', 'error');
    }
  }

  // Add click handler for manual paste button
  pasteBtn.addEventListener('click', handlePaste);

  // Add click handler for capture button
  captureBtn.addEventListener('click', handleCapture);
}); 