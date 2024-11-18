document.addEventListener('DOMContentLoaded', function() {
  const pasteBtn = document.getElementById('pasteBtn');
  const openSettings = document.getElementById('openSettings');
  const processingOverlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');

  // Handle customize shortcuts button
  openSettings.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
  });

  // Rest of your popup.js code...
  async function handlePaste() {
    try {
      processingOverlay.classList.add('active');
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

      // Send the blob to background script
      chrome.runtime.sendMessage({
        type: 'SCREENSHOT_CAPTURED',
        imageBlob: imageBlob
      });

    } catch (error) {
      console.error('Error:', error);
      processingStatus.textContent = error.message || 'Failed to process screenshot';
      setTimeout(() => {
        processingOverlay.classList.remove('active');
      }, 2000);
    }
  }

  // Listen for clicks on the paste button
  pasteBtn.addEventListener('click', handlePaste);

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TRIGGER_PASTE_BUTTON') {
      handlePaste();
    } else if (message.type === 'PROCESSING_STATUS') {
      if (message.status === 'start') {
        processingOverlay.classList.add('active');
        processingStatus.textContent = 'Processing image...';
      } else if (message.status === 'success') {
        processingStatus.textContent = 'Success! Opening calendar...';
        setTimeout(() => {
          processingOverlay.classList.remove('active');
        }, 1000);
      } else if (message.status === 'error') {
        processingStatus.textContent = message.error || 'Error processing screenshot';
        setTimeout(() => {
          processingOverlay.classList.remove('active');
        }, 2000);
      }
    }
  });
}); 