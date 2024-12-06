// Listen to the message sent by popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'EXPLAIN_TEXT') {
        const text = message.selection;
  
        // Log the selected text for debugging
        console.log('Selected Text:', text);
  
        // If selection is a phrase longer than 5 words, ignore it
        const wordCount = text.split(' ').length;
        console.log('Word Count:', wordCount);
  
        if (wordCount > 5) {
            sendResponse({ action: 'IGNORE' });
            return;
        }
  
        // Fetch meaning using Dictionary API
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`)
            .then((response) => {
                if (!response.ok) {
                    // Log if API response fails
                    console.error(`Error fetching meaning for "${text}":`, response.status, response.statusText);
                    throw new Error('Error fetching meaning');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched Data:', data); // Log fetched data for debugging
                // Check if the response contains valid data
                if (data && data[0] && data[0].meanings) {
                    sendResponse({ action: 'RESULT', data });
                } else {
                    sendResponse({ action: 'ERROR' });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                sendResponse({ action: 'ERROR' });
            });
    }
  
    // For async sendResponse
    return true;
});
