chrome.commands.onCommand.addListener(async (command) => {
  if (command === "process-clipboard") {
    try {
      // Get clipboard contents
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        // Check if the clipboard contains an image
        if (clipboardItem.types.includes('image/png')) {
          const blob = await clipboardItem.getType('image/png');
          await processScreenshot(blob);
          break;
        }
      }
    } catch (error) {
      console.error('Error processing clipboard:', error);
      // Show notification if there's an error
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Calendar Genie',
        message: 'Error processing clipboard image. Make sure you have a screenshot copied.'
      });
    }
  }
});

async function processScreenshot(blob) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'screenshot.png');
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Send to Calendar Genie API
    const response = await fetch('http://localhost:3000/api/process-screenshots', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.result.links.length > 0) {
      // Open the first calendar link in a new tab
      chrome.tabs.create({ url: data.result.links[0] });
    } else {
      throw new Error('No calendar event found in the screenshot');
    }
  } catch (error) {
    console.error('Error:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Calendar Genie',
      message: error.message || 'Error processing screenshot'
    });
  }
} 