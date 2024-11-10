chrome.commands.onCommand.addListener(async (command) => {
  if (command === "process-clipboard") {
    try {
      // Create a temporary tab to handle the paste operation
      const tab = await chrome.tabs.create({ 
        url: chrome.runtime.getURL('paste.html'),
        active: false 
      });

      // Wait for the tab to be ready and send message to process clipboard
      setTimeout(async () => {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "processClipboard" });
        if (response && response.success && response.links) {
          // Open all links in new tabs
          for (const link of response.links) {
            chrome.tabs.create({ url: link });
          }
        }
        // Close the temporary tab
        chrome.tabs.remove(tab.id);
      }, 1000);

    } catch (error) {
      console.error('Error processing clipboard:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Calendar Genie',
        message: 'Error processing clipboard image. Make sure you have a screenshot copied.'
      });
    }
  }
}); 