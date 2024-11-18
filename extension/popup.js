document.addEventListener('DOMContentLoaded', function() {
  const pasteBtn = document.getElementById('pasteBtn');
  const openSettings = document.getElementById('openSettings');
  const processingOverlay = document.getElementById('processingOverlay');
  const processingStatus = document.getElementById('processingStatus');
  const infoIcon = document.getElementById('infoIcon');
  const instructionsModal = document.getElementById('instructionsModal');
  const closeInstructions = document.getElementById('closeInstructions');
  const hotkeyInfo = document.querySelector('.hotkey-info');

  // Fetch and update shortcut information
  chrome.commands.getAll((commands) => {
    const processCommand = commands.find(cmd => cmd.name === "process-clipboard");
    const openCommand = commands.find(cmd => cmd.name === "open-popup");
    
    const processShortcut = processCommand?.shortcut || 'Cmd+Shift+Y (Ctrl+Shift+Y)';
    const openShortcut = openCommand?.shortcut || 'Cmd+Shift+U (Ctrl+Shift+U)';

    // Format shortcuts for display (convert MacOS format if needed)
    const formatShortcut = (shortcut) => {
      if (!shortcut) return '';
      return navigator.platform.includes('Mac')
        ? shortcut.replace('Command', '⌘').replace('MacCtrl', '⌃').replace('Alt', '⌥').replace('Shift', '⇧')
        : shortcut.replace('Ctrl', 'Ctrl').replace('Shift', 'Shift').replace('Alt', 'Alt');
    };

    // Update hotkey info text
    hotkeyInfo.innerHTML = `
      Quick Shortcuts:<br>
      ${formatShortcut(processShortcut)} - Process Screenshot<br>
      ${formatShortcut(openShortcut)} - Open Extension
    `;

    // Update instructions text
    const shortcutStep = document.getElementById('shortcutStep');
    const quickOpenTip = document.getElementById('quickOpenTip');
    
    shortcutStep.textContent = `Press ${formatShortcut(processShortcut)} or click "Paste Screenshot"`;
    quickOpenTip.textContent = `• Use ${formatShortcut(openShortcut)} to quickly open the extension`;
  });

  // Handle customize shortcuts button
  openSettings.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({
      url: 'chrome://extensions/shortcuts'
    });
  });

  // Handle info icon click
  infoIcon.addEventListener('click', function() {
    instructionsModal.classList.add('active');
  });

  // Handle close button click
  closeInstructions.addEventListener('click', function() {
    instructionsModal.classList.remove('active');
  });

  // Close modal when clicking outside
  instructionsModal.addEventListener('click', function(e) {
    if (e.target === instructionsModal) {
      instructionsModal.classList.remove('active');
    }
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