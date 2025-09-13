/**
 * Content Script for Cookie Copier Extension
 * Currently minimal - could be extended for advanced cookie detection
 */

// Content script is loaded on all pages but currently has minimal functionality
// Future enhancements could include:
// - Real-time cookie change detection
// - Visual indicators for sites with copied cookies
// - Advanced cookie analysis and warnings

console.log('Cookie Copier content script loaded');

// Listen for messages from popup or background script if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'PING':
      sendResponse({ status: 'PONG' });
      break;

    case 'GET_PAGE_INFO':
      sendResponse({
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
        timestamp: Date.now(),
      });
      break;

    default:
      // Unknown message type
      break;
  }
});

export {};
