// Listen for commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  
  if (command === "open-popup") {
    // Just open popup
    chrome.action.openPopup();
  } else if (command === "process-clipboard") {
    // First open the popup
    await chrome.action.openPopup();
    
    // Simulate clicking the paste button in popup
    chrome.runtime.sendMessage({
      type: 'TRIGGER_PASTE_BUTTON'
    });
  }
});

async function processClipboardImage() {
  try {
    // Send initial processing status
    chrome.runtime.sendMessage({
      type: 'PROCESSING_STATUS',
      status: 'start'
    });

    // Get clipboard data directly
    const clipboardItems = await navigator.clipboard.read();
    let imageBlob = null;

    // Find image in clipboard
    for (const clipboardItem of clipboardItems) {
      if (clipboardItem.types.includes('image/png')) {
        imageBlob = await clipboardItem.getType('image/png');
        break;
      }
    }

    if (!imageBlob) {
      throw new Error('No image found in clipboard');
    }

    // Update status
    chrome.runtime.sendMessage({
      type: 'PROCESSING_STATUS',
      status: 'processing'
    });

    // Create form data and send to API
    const formData = new FormData();
    formData.append('file', imageBlob, 'screenshot.png');
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Send to Calendar Genie API
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
      // Send success status
      chrome.runtime.sendMessage({
        type: 'PROCESSING_STATUS',
        status: 'success'
      });

      // Open all calendar links in new tabs
      data.result.links.forEach(link => {
        chrome.tabs.create({ url: link, active: false });
      });
    } else {
      throw new Error('No calendar events found in the screenshot');
    }
  } catch (error) {
    console.error('Error:', error);
    // Send error status
    chrome.runtime.sendMessage({
      type: 'PROCESSING_STATUS',
      status: 'error',
      error: error.message
    });
  }
} 