chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create a new image from the current page
    const image = new Image();
    image.onload = () => {
      // Draw the image to canvas
      context.drawImage(image, 0, 0);
      
      // Convert canvas to base64
      const imageData = canvas.toDataURL('image/png');
      
      // Send back the image data
      sendResponse({ imageData });
    };
    
    // Capture the current view using html2canvas
    html2canvas(document.body).then(canvas => {
      image.src = canvas.toDataURL('image/png');
    });
    
    return true; // Required for async response
  }
}); 