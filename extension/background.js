// Listen for commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  
  if (command === "process-clipboard") {
    try {
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

      // Create form data and send to API
      const formData = new FormData();
      formData.append('file', imageBlob, 'screenshot.png');
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

      // Open popup first
      await chrome.action.openPopup();

      // Send message to popup to show processing state
      chrome.runtime.sendMessage({
        type: 'PROCESSING_STATUS',
        status: 'start'
      });

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
        // Send success message to popup
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
      // Send error message to popup
      chrome.runtime.sendMessage({
        type: 'PROCESSING_STATUS',
        status: 'error',
        error: error.message || 'Failed to process screenshot'
      });
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROCESS_IMAGE') {
    processImage(message.imageBlob);
  }
});

function formatTimeForDebug(dateString) {
  try {
    const date = new Date(dateString);
    return {
      original: dateString,
      formatted: date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }),
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  } catch (error) {
    return {
      original: dateString,
      error: 'Invalid date format'
    };
  }
}

async function processImage(imageBlob) {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob, 'screenshot.png');
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

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
      // Debug log for each calendar link
      data.result.links.forEach((link, index) => {
        console.log(`\n📅 Calendar Event ${index + 1}:`);
        
        // Parse the URL to get the dates parameter
        const url = new URL(link);
        const dates = url.searchParams.get('dates');
        const text = url.searchParams.get('text');
        
        if (dates) {
          const [startTime, endTime] = dates.split('/');
          console.log('Event:', decodeURIComponent(text || 'Unnamed Event'));
          console.log('Start Time:', formatTimeForDebug(startTime));
          console.log('End Time:', formatTimeForDebug(endTime));
          console.log('Timezone:', url.searchParams.get('ctz'));
          console.log('Full URL:', link);
          console.log('-------------------');
        }
      });

      // Open all calendar links in new tabs
      data.result.links.forEach(link => {
        chrome.tabs.create({ url: link, active: false });
      });
      return true;
    } else {
      throw new Error('No calendar events found in the screenshot');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
} 