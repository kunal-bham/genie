chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processClipboard") {
    processClipboardContent().then(sendResponse);
    return true; // Required for async response
  }
});

async function processClipboardContent() {
  try {
    const pasteTarget = document.getElementById('paste-target');
    pasteTarget.focus();
    document.execCommand('paste');

    const images = pasteTarget.getElementsByTagName('img');
    if (images.length === 0) {
      throw new Error('No image found in clipboard');
    }

    const imageData = images[0].src;
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
    return {
      success: true,
      links: data.result.links
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 