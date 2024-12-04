document.addEventListener('DOMContentLoaded', function() {
  // Connect to background script to track popup state
  const port = chrome.runtime.connect({ name: 'popup' });

  const pasteBtn = document.getElementById('pasteBtn');
  const statusDiv = document.getElementById('status');
  const overlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');
  const statusMessage = document.getElementById('statusMessage');
  const captureBtn = document.getElementById('captureBtn');
  const hotkeyInfo = document.getElementById('hotkeyInfo');

  // Fetch and display current shortcuts
  chrome.commands.getAll((commands) => {
    const processCommand = commands.find(cmd => cmd.name === "process-clipboard");
    const captureCommand = commands.find(cmd => cmd.name === "capture-screenshot");

    // Format shortcuts for display
    const formatShortcut = (shortcut) => {
      if (!shortcut) return 'Not Set';
      
      // Format for Mac
      if (navigator.platform.includes('Mac')) {
        return shortcut
          .replace('Command', '⌘')
          .replace('Shift', '⇧')
          .replace('Alt', '⌥')
          .replace('MacCtrl', '⌃');
      }
      
      // Format for Windows/Linux
      return shortcut
        .replace('Ctrl', 'Ctrl')
        .replace('Shift', 'Shift')
        .replace('Alt', 'Alt');
    };

    // Update hotkey info display
    hotkeyInfo.innerHTML = `
      ${formatShortcut(captureCommand?.shortcut)} - Capture Screenshot<br>
      ${formatShortcut(processCommand?.shortcut)} - Past Screenshot
    `;

    // Update the instruction step text
    const instructionStepTwo = document.querySelector('.instruction-step:nth-of-type(2) p');
    if (instructionStepTwo) {
      instructionStepTwo.textContent = `Use ${formatShortcut(processCommand?.shortcut)} to paste or ${formatShortcut(captureCommand?.shortcut)} to capture`;
    }
  });

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

  // Update the API endpoint URL
  const API_URL = 'https://calendarg.vercel.app/api/process-screenshots';

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

      const response = await fetch(API_URL, {
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

      const apiResponse = await fetch(API_URL, {
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

  // Add click handler for settings button
  const openSettings = document.getElementById('openSettings');
  openSettings.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
  });

  // Add instructions modal handlers
  const infoIcon = document.getElementById('infoIcon');
  const instructionsModal = document.getElementById('instructionsModal');
  const closeInstructions = document.getElementById('closeInstructions');

  infoIcon.addEventListener('click', () => {
    instructionsModal.classList.add('active');
  });

  closeInstructions.addEventListener('click', () => {
    instructionsModal.classList.remove('active');
  });

  // Close modal when clicking outside
  instructionsModal.addEventListener('click', (e) => {
    if (e.target === instructionsModal) {
      instructionsModal.classList.remove('active');
    }
  });
}); 