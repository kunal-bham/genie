document.addEventListener('DOMContentLoaded', function() {
  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');
  const overlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');
  const statusMessage = document.getElementById('statusMessage');

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

  // Add click handler for manual paste button
  pasteBtn.addEventListener('click', handlePaste);
}); 