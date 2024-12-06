// Wait for the document to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      
      if (message.type === 'SHOW_POPUP') {

        const word = message.data[0].word;
        const meaning = message.data[0].meanings[0].definitions[0].definition;
        const position = message.position;

        console.log('Popup Data:', word, meaning, position);
        
  
        // Display data in the popup
        const popupContainer = document.getElementById('popupContainer');
        const wordElement = document.getElementById('word');
        const meaningElement = document.getElementById('meaning');
  
        if (popupContainer && wordElement && meaningElement) {
          // Update content
          wordElement.textContent = word;
          meaningElement.textContent = meaning;
  
          // Position the popup
          popupContainer.style.top = `${position.y}px`;
          popupContainer.style.left = `${position.x}px`;
          popupContainer.style.display = 'block';
  
          sendResponse({ status: 'Popup updated successfully' });
        } else {
          console.error('Popup elements not found');
          sendResponse({ status: 'Popup elements not found' });
        }
      }
    });
  });
  