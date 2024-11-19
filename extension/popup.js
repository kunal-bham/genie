document.addEventListener('DOMContentLoaded', function() {
  // Connect to background script to track popup state
  const port = chrome.runtime.connect({ name: 'popup' });

  // DOM Elements
  const elements = {
    pasteBtn: document.getElementById('pasteBtn'),
    statusDiv: document.getElementById('status'),
    overlay: document.getElementById('processingOverlay'),
    processingStatus: document.getElementById('processingStatus'),
    statusMessage: document.getElementById('statusMessage'),
    captureBtn: document.getElementById('captureBtn'),
    hotkeyInfo: document.getElementById('hotkeyInfo'),
    openSettings: document.getElementById('openSettings'),
    infoIcon: document.getElementById('infoIcon'),
    instructionsModal: document.getElementById('instructionsModal'),
    closeInstructions: document.getElementById('closeInstructions')
  };

  // Utility Functions
  const formatShortcut = (shortcut) => {
    if (!shortcut) return 'Not Set';
    
    const isMac = navigator.platform.includes('Mac');
    const replacements = isMac ? 
      { 'Command': '⌘', 'Shift': '⇧', 'Alt': '⌥', 'MacCtrl': '⌃' } :
      { 'Ctrl': 'Ctrl', 'Shift': 'Shift', 'Alt': 'Alt' };
    
    return Object.entries(replacements).reduce(
      (acc, [key, value]) => acc.replace(key, value),
      shortcut
    );
  };

  const showError = (message) => {
    elements.overlay.classList.remove('active');
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.add('active', 'error');
  };

  const hideError = () => {
    elements.statusMessage.classList.remove('active', 'error');
  };

  const updateProcessingStatus = (message) => {
    elements.processingStatus.textContent = message;
  };

  const processApiResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.result.links?.length > 0) {
      updateProcessingStatus('Opening calendar links...');
      
      data.result.links.forEach(link => {
        chrome.tabs.create({ url: link, active: false });
      });

      setTimeout(() => {
        elements.overlay.classList.remove('active');
      }, 1000);
      return true;
    }
    
    throw new Error('No events found in screenshot');
  };

  // Initialize Shortcuts
  chrome.commands.getAll((commands) => {
    const processCommand = commands.find(cmd => cmd.name === "process-clipboard");
    const captureCommand = commands.find(cmd => cmd.name === "capture-screenshot");

    elements.hotkeyInfo.innerHTML = `
      ${formatShortcut(captureCommand?.shortcut)} - Capture Screenshot<br>
      ${formatShortcut(processCommand?.shortcut)} - Past Screenshot
    `;

    const instructionStepTwo = document.querySelector('.instruction-step:nth-of-type(2) p');
    if (instructionStepTwo) {
      instructionStepTwo.textContent = `Use ${formatShortcut(processCommand?.shortcut)} to paste or ${formatShortcut(captureCommand?.shortcut)} to capture`;
    }
  });

  // Event Handlers
  async function handlePaste() {
    try {
      hideError();
      const clipboardItems = await navigator.clipboard.read();
      const hasImage = clipboardItems.some(item => item.types.includes('image/png'));

      if (!hasImage) {
        showError('No screenshot found');
        return;
      }

      elements.overlay.classList.add('active');
      updateProcessingStatus('Reading clipboard...');
      
      const imageBlob = await clipboardItems[0].getType('image/png');
      updateProcessingStatus('Processing image...');
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      await processApiResponse(
        await fetch('http://localhost:3000/api/process-screenshots', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
      );

    } catch (error) {
      console.error('Error:', error);
      showError(
        error.message === 'No image found in clipboard' ? 'No screenshot found' :
        error.message === 'No calendar events found in the screenshot' ? 'No events found in screenshot' :
        error.message || 'Failed to process screenshot'
      );
    }
  }

  async function handleCapture() {
    try {
      hideError();
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      elements.overlay.classList.add('active');
      updateProcessingStatus('Capturing screenshot...');

      const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      const response = await fetch(screenshot);
      const imageBlob = await response.blob();

      updateProcessingStatus('Processing screenshot...');
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      await processApiResponse(
        await fetch('http://localhost:3000/api/process-screenshots', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
      );

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Failed to capture screenshot');
    }
  }

  // Event Listeners
  elements.pasteBtn.addEventListener('click', handlePaste);
  elements.captureBtn.addEventListener('click', handleCapture);
  elements.openSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  elements.infoIcon.addEventListener('click', () => {
    elements.instructionsModal.classList.add('active');
  });

  elements.closeInstructions.addEventListener('click', () => {
    elements.instructionsModal.classList.remove('active');
  });

  elements.instructionsModal.addEventListener('click', (e) => {
    if (e.target === elements.instructionsModal) {
      elements.instructionsModal.classList.remove('active');
    }
  });

  // Message Listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PROCESSING_STATUS') {
      switch (message.status) {
        case 'start':
          elements.overlay.classList.add('active');
          updateProcessingStatus('Reading clipboard...');
          hideError();
          break;
        case 'processing':
          updateProcessingStatus('Processing image...');
          break;
        case 'success':
          updateProcessingStatus('Opening calendar links...');
          setTimeout(() => elements.overlay.classList.remove('active'), 1000);
          break;
        case 'error':
          elements.overlay.classList.remove('active');
          showError(message.error);
          break;
      }
    } else if (message.type === 'TRIGGER_PASTE_BUTTON') {
      handlePaste();
    } else if (message.type === 'TRIGGER_CAPTURE_BUTTON') {
      handleCapture();
    }
  });
}); 