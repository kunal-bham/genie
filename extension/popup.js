document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const pasteBtn = document.createElement('button');
  const loadingDiv = document.getElementById('loading');
  const statusDiv = document.getElementById('status');
  
  // Add paste button
  pasteBtn.innerHTML = 'Paste Screenshot 📋';
  pasteBtn.className = captureBtn.className;
  captureBtn.parentNode.insertBefore(pasteBtn, captureBtn.nextSibling);
  
  captureBtn.addEventListener('click', async () => {
    try {
      // Show loading state
      loadingDiv.classList.add('active');
      captureBtn.disabled = true;
      statusDiv.textContent = 'Preparing to capture...';

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Inject both html2canvas and content script
      statusDiv.textContent = 'Injecting scripts...';
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['html2canvas.min.js', 'content.js']
      });
      
      // Wait a bit for scripts to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      statusDiv.textContent = 'Capturing screenshot...';
      // Capture the screenshot
      const response = await chrome.tabs.sendMessage(tab.id, { action: "capture" });
      
      if (!response || !response.imageData) {
        throw new Error('Failed to capture screenshot');
      }

      statusDiv.textContent = 'Processing screenshot...';
      
      // Create form data
      const formData = new FormData();
      
      // Convert base64 to blob
      const base64Data = response.imageData.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
      
      formData.append('file', blob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      // Send to Calendar Genie API with proper headers
      const result = await fetch('http://localhost:3000/api/process-screenshots', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type header when using FormData
        },
        mode: 'cors', // Enable CORS
        credentials: 'same-origin'
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      
      if (data.success && data.result.links.length > 0) {
        statusDiv.textContent = 'Success! Opening calendar...';
        // Open the first calendar link in a new tab
        chrome.tabs.create({ url: data.result.links[0] });
        setTimeout(() => window.close(), 1000);
      } else {
        statusDiv.textContent = 'No calendar event found in the screenshot';
      }
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error: ' + (error.message || 'Failed to process screenshot');
    } finally {
      loadingDiv.classList.remove('active');
      captureBtn.disabled = false;
    }
  });

  // Updated paste functionality
  pasteBtn.addEventListener('click', async () => {
    try {
      loadingDiv.classList.add('active');
      pasteBtn.disabled = true;
      statusDiv.textContent = 'Reading clipboard...';

      // Create a contenteditable element to receive the paste
      const pasteTarget = document.createElement('div');
      pasteTarget.contentEditable = true;
      pasteTarget.style.opacity = '0';
      pasteTarget.style.position = 'fixed';
      document.body.appendChild(pasteTarget);
      
      // Focus and paste
      pasteTarget.focus();
      document.execCommand('paste');

      // Process pasted content
      const images = pasteTarget.getElementsByTagName('img');
      document.body.removeChild(pasteTarget);

      if (images.length === 0) {
        throw new Error('No image found in clipboard');
      }

      // Get the image data
      const imageData = images[0].src;
      
      statusDiv.textContent = 'Processing screenshot...';
      
      // Convert base64 to blob
      const base64Data = imageData.split(',')[1];
      const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('file', blob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      const result = await fetch('http://localhost:3000/api/process-screenshots', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }

      const data = await result.json();
      
      if (data.success && data.result.links.length > 0) {
        statusDiv.textContent = 'Success! Opening calendar...';
        chrome.tabs.create({ url: data.result.links[0] });
        setTimeout(() => window.close(), 1000);
      } else {
        statusDiv.textContent = 'No calendar event found in the screenshot';
      }
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error: ' + (error.message || 'Failed to process screenshot');
    } finally {
      loadingDiv.classList.remove('active');
      pasteBtn.disabled = false;
    }
  });
}); 