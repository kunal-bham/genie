document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const loadingDiv = document.getElementById('loading');
  const statusDiv = document.getElementById('status');
  
  captureBtn.addEventListener('click', async () => {
    try {
      // Show loading state
      loadingDiv.classList.add('active');
      captureBtn.disabled = true;
      statusDiv.textContent = '';

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Capture the visible tab
      const response = await chrome.tabs.sendMessage(tab.id, { action: "capture" });
      
      if (response && response.imageData) {
        // Convert base64 to blob
        const base64Data = response.imageData.split(',')[1];
        const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
        
        // Create form data
        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');
        formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

        // Send to Calendar Genie
        const result = await fetch('https://your-calendar-genie-domain.com/api/process-screenshots', {
          method: 'POST',
          body: formData
        });

        const data = await result.json();
        
        if (data.success && data.result.links.length > 0) {
          // Open the first calendar link in a new tab
          chrome.tabs.create({ url: data.result.links[0] });
          window.close();
        } else {
          statusDiv.textContent = 'No calendar event found in the screenshot';
        }
      }
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error processing screenshot';
    } finally {
      loadingDiv.classList.remove('active');
      captureBtn.disabled = false;
    }
  });
}); 