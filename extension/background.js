// State Management
const state = {
  isPopupOpen: false,
  isProcessing: false
};

// Constants
const COMMANDS = {
  PROCESS_CLIPBOARD: 'process-clipboard',
  CAPTURE_SCREENSHOT: 'capture-screenshot'
};

const MESSAGE_TYPES = {
  PROCESSING_STATUS: 'PROCESSING_STATUS',
  TRIGGER_PASTE: 'TRIGGER_PASTE_BUTTON',
  TRIGGER_CAPTURE: 'TRIGGER_CAPTURE_BUTTON'
};

// Utility Functions
const updateProcessingState = (status) => {
  state.isProcessing = status === 'start';
};

const handleCommand = async (command) => {
  if (state.isProcessing || state.isPopupOpen) {
    console.log('Ignoring hotkey: Processing in progress or popup is open');
    return;
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs?.length) {
      console.log('No active tab found');
      return;
    }

    await chrome.action.openPopup();
    chrome.runtime.sendMessage({
      type: command === COMMANDS.PROCESS_CLIPBOARD ? 
        MESSAGE_TYPES.TRIGGER_PASTE : 
        MESSAGE_TYPES.TRIGGER_CAPTURE
    });
  } catch (error) {
    console.log('Could not process hotkey command');
    state.isProcessing = false;
  }
};

// Event Listeners
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    state.isPopupOpen = true;
    port.onDisconnect.addListener(() => {
      state.isPopupOpen = false;
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === MESSAGE_TYPES.PROCESSING_STATUS) {
    updateProcessingState(message.status);
  }
});

chrome.commands.onCommand.addListener(handleCommand); 