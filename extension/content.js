// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    captureVisibleTab().then(dataUrl => {
      sendResponse({ imageData: dataUrl });
    });
    return true; // Required for async response
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