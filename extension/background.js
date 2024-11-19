// Track popup state and processing state
let isPopupOpen = false;
let isProcessing = false;

// Listen for popup open/close
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    isPopupOpen = true;
    port.onDisconnect.addListener(() => {
      isPopupOpen = false;
    });
  }
});

// Listen for processing status
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESSING_STATUS') {
    if (message.status === 'start') {
      isProcessing = true;
    } else if (['success', 'error'].includes(message.status)) {
      isProcessing = false;
    }
  }
});

// Main command listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "process-clipboard" || command === "capture-screenshot") {
    // Ignore if processing or popup is already open
    if (isProcessing || isPopupOpen) {
      console.log('Ignoring hotkey: Processing in progress or popup is open');
      return;
    }

    try {
      // Get active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || !tabs.length) {
        console.log('No active tab found');
        return;
      }

      // Open popup and trigger appropriate action
      await chrome.action.openPopup();
      chrome.runtime.sendMessage({
        type: command === "process-clipboard" ? 'TRIGGER_PASTE_BUTTON' : 'TRIGGER_CAPTURE_BUTTON'
      });

    } catch (error) {
      console.log('Could not process hotkey command');
      isProcessing = false;
    }
  }
}); 