document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Popup loaded');
  
  const pasteButton = document.getElementById('pasteButton');
  const statusText = document.getElementById('status');
  const loadingSpinner = document.getElementById('loading');
  
  pasteButton.innerHTML = 'Paste Screenshot (⌘⇧Y) <a href="chrome://extensions/shortcuts" style="font-size: 12px; margin-left: 5px;">[Customize]</a>';

  // Notify background script that popup is ready
  chrome.runtime.sendMessage({ type: 'POPUP_LOADED' });

  // Check if we should trigger paste automatically
  const { triggerPasteOnLoad } = await chrome.storage.local.get('triggerPasteOnLoad');
  if (triggerPasteOnLoad) {
    // Clear the flag
    await chrome.storage.local.remove('triggerPasteOnLoad');
    // Trigger paste after a short delay
    setTimeout(() => {
      handlePaste();
    }, 100);
  }

  async function handlePaste() {
    console.log('📋 Handle paste triggered');
    try {
      statusText.textContent = 'Reading clipboard...';
      loadingSpinner.style.display = 'block';
      pasteButton.disabled = true;

      console.log('📥 Attempting to read clipboard...');
      const clipboardItems = await navigator.clipboard.read();
      let imageBlob = null;

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types.includes('image/png')) {
          console.log('🖼️ Found PNG in clipboard');
          imageBlob = await clipboardItem.getType('image/png');
          break;
        }
      }

      if (!imageBlob) {
        throw new Error('No image found in clipboard');
      }

      console.log('📤 Sending screenshot to background...');
      chrome.runtime.sendMessage({
        type: 'SCREENSHOT_CAPTURED',
        imageBlob: imageBlob
      });

    } catch (error) {
      console.error('❌ Error in handlePaste:', error);
      statusText.textContent = `Error: ${error.message}`;
      loadingSpinner.style.display = 'none';
      pasteButton.disabled = false;
    }
  }

  // Listen for clicks on the paste button
  pasteButton.addEventListener('click', () => {
    console.log('🖱️ Paste button clicked');
    handlePaste();
  });

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Popup received message:', message);
    
    if (message.action === "triggerPaste") {
      console.log('🎯 Trigger paste message received');
      handlePaste();
    } else if (message.type === 'PROCESSING_STATUS') {
      console.log('📊 Status update:', message.status);
      if (message.status === 'start') {
        statusText.textContent = 'Processing image...';
      } else if (message.status === 'success') {
        statusText.textContent = 'Success! Opening calendar...';
        loadingSpinner.style.display = 'none';
        pasteButton.disabled = false;
      } else if (message.status === 'error') {
        statusText.textContent = `Error: ${message.error}`;
        loadingSpinner.style.display = 'none';
        pasteButton.disabled = false;
      }
    }
  });

  // Add click handler for the customize link
  document.querySelector('a[href="chrome://extensions/shortcuts"]').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
}); 