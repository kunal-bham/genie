// Constants
const SUPPORTED_IMAGE_TYPES = ['image/png'];

// Utility Functions
const handleClipboardRead = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      if (item.types.some(type => SUPPORTED_IMAGE_TYPES.includes(type))) {
        return await item.getType('image/png');
      }
    }
    return null;
  } catch (error) {
    console.error('Clipboard read error:', error);
    return null;
  }
};

const sendStatusMessage = (status, error = null) => {
  chrome.runtime.sendMessage({
    type: 'PROCESSING_STATUS',
    status,
    ...(error && { error })
  });
};

// Message Handler
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "readClipboard") {
    try {
      sendStatusMessage('start');
      const imageBlob = await handleClipboardRead();
      
      if (!imageBlob) {
        throw new Error('No image found in clipboard');
      }

      chrome.runtime.sendMessage({
        type: 'SCREENSHOT_CAPTURED',
        imageBlob
      });
    } catch (error) {
      sendStatusMessage('error', error.message || 'Failed to read clipboard');
    }
  }
});

async function captureVisibleTab() {
  // Create a canvas element to draw the screenshot
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Set canvas size to viewport size
  const scrollWidth = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth
  );
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  
  canvas.width = scrollWidth;
  canvas.height = scrollHeight;
  
  // Draw the current page content to canvas
  try {
    // Create a new HTML2Canvas instance
    const screenshot = await html2canvas(document.body, {
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true
    });
    
    // Draw the screenshot onto our canvas
    context.drawImage(screenshot, 0, 0);
    
    // Convert to base64
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
} 