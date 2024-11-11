// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "readClipboard") {
    try {
      // Send processing status
      chrome.runtime.sendMessage({
        type: 'PROCESSING_STATUS',
        status: 'start'
      });

      // Read from clipboard
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

      // Send the blob back to background script
      chrome.runtime.sendMessage({
        type: 'SCREENSHOT_CAPTURED',
        imageBlob: imageBlob
      });
    } catch (error) {
      console.error('Error reading clipboard:', error);
      chrome.runtime.sendMessage({
        type: 'PROCESSING_STATUS',
        status: 'error',
        error: error.message || 'Failed to read clipboard'
      });
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