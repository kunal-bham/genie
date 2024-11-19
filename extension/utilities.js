export const formatShortcut = (shortcut) => {
  if (!shortcut) return 'Not Set';
  
  const isMac = navigator.platform.includes('Mac');
  const replacements = isMac ? 
    { 'Command': '⌘', 'Shift': '⇧', 'Alt': '⌥', 'MacCtrl': '⌃' } :
    { 'Ctrl': 'Ctrl', 'Shift': 'Shift', 'Alt': 'Alt' };
  
  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replace(key, value),
    shortcut
  );
};

export const API_ENDPOINTS = {
  PROCESS_SCREENSHOTS: 'http://localhost:3000/api/process-screenshots'
};

export const MESSAGE_TYPES = {
  PROCESSING_STATUS: 'PROCESSING_STATUS',
  SCREENSHOT_CAPTURED: 'SCREENSHOT_CAPTURED',
  TRIGGER_PASTE: 'TRIGGER_PASTE_BUTTON',
  TRIGGER_CAPTURE: 'TRIGGER_CAPTURE_BUTTON'
}; 