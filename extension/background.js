// Constants for testing and debugging
const DEBUG = true;
const TEST_POINTS = {
  COMMAND_RECEIVED: 'command_received',
  CLIPBOARD_READ: 'clipboard_read',
  IMAGE_FOUND: 'image_found',
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETED: 'processing_completed'
};

// Test tracking
let testResults = new Map();

// Debug logging helper
function debugLog(point, success, message) {
  if (!DEBUG) return;
  
  testResults.set(point, success);
  console.log(`${success ? '✅' : '❌'} ${point}: ${message}`);
  
  if (!success) {
    console.error(`Failed at test point: ${point}`);
    console.trace();
  }
}

// Track popup state
let isPopupOpen = false;

// Listen for popup open/close
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    isPopupOpen = true;
    port.onDisconnect.addListener(() => {
      isPopupOpen = false;
    });
  }
});

// Main command listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "process-clipboard" || command === "capture-screenshot") {
    debugLog(TEST_POINTS.COMMAND_RECEIVED, true, `Hotkey pressed: ${command}`);
    
    try {
      // If popup is already open, close it
      if (isPopupOpen) {
        console.log('Popup already open, closing...');
        window.close();
        return;
      }

      // Get active tab first
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        debugLog(TEST_POINTS.COMMAND_RECEIVED, false, 'No active tab found');
        return;
      }

      // Open popup
      console.log('Opening popup...');
      await chrome.action.openPopup();

      // Send appropriate message based on command
      chrome.runtime.sendMessage({
        type: command === "process-clipboard" ? 'TRIGGER_PASTE_BUTTON' : 'TRIGGER_CAPTURE_BUTTON'
      });

      debugLog(TEST_POINTS.COMMAND_RECEIVED, true, 'Popup opened and action triggered');

    } catch (error) {
      console.error('Error in command listener:', error);
      debugLog(TEST_POINTS.COMMAND_RECEIVED, false, `Error: ${error.message}`);
    }
  }
});

// Main processing function
async function handleClipboardProcessing() {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      debugLog(TEST_POINTS.COMMAND_RECEIVED, false, 'No active tab found');
      return;
    }

    // Execute clipboard reading in content script context
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            if (item.types.includes('image/png')) {
              const blob = await item.getType('image/png');
              // Convert the blob to base64
              return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            }
          }
          return null;
        } catch (error) {
          console.error('Clipboard read error:', error);
          return null;
        }
      }
    });

    // Check if we got an image
    const base64Data = result[0]?.result;
    if (!base64Data) {
      debugLog(TEST_POINTS.CLIPBOARD_READ, false, 'No image found in clipboard');
      return;
    }
    debugLog(TEST_POINTS.IMAGE_FOUND, true, 'Image found in clipboard');

    // Convert base64 back to blob
    const imageBlob = await fetch(base64Data).then(r => r.blob());

    // Process the image
    debugLog(TEST_POINTS.PROCESSING_STARTED, true, 'Starting image processing');
    await processImage(imageBlob);

  } catch (error) {
    debugLog(TEST_POINTS.PROCESSING_STARTED, false, `Error: ${error.message}`);
    console.error('Processing error:', error);
  }
}

// Image processing function
async function processImage(imageBlob) {
  try {
    console.log('Creating FormData with blob type:', imageBlob.type);
    const formData = new FormData();
    formData.append('file', imageBlob, 'screenshot.png');
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    const response = await fetch('http://localhost:3000/api/process-screenshots', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.result.links?.length > 0) {
      debugLog(TEST_POINTS.PROCESSING_COMPLETED, true, 
        `Successfully processed ${data.result.links.length} calendar events`);
      
      // Open calendar links
      data.result.links.forEach(link => {
        chrome.tabs.create({ url: link, active: false });
      });
      
      // Log success details
      data.result.links.forEach((link, index) => {
        const url = new URL(link);
        console.log(`📅 Calendar Event ${index + 1}:`,
          '\nTitle:', decodeURIComponent(url.searchParams.get('text') || 'Untitled'),
          '\nTimezone:', url.searchParams.get('ctz'));
      });

      return true;
    } else {
      throw new Error('No calendar events found');
    }
  } catch (error) {
    debugLog(TEST_POINTS.PROCESSING_COMPLETED, false, `Error: ${error.message}`);
    throw error;
  }
}

// Test results helper
function getTestResults() {
  console.log('\n🧪 Test Results:');
  for (const [point, success] of testResults) {
    console.log(`${success ? '✅' : '❌'} ${point}`);
  }
  return Array.from(testResults.values()).every(Boolean);
} 