(() => {
    "use strict";

    let currentOverlay = null;  // Track the currently displayed overlay

    document.addEventListener("mouseup", () => {
        let selection;
        const selectedText = (selection = window.getSelection()) ? selection.toString().trim() : null;
        console.log("Selected Text:", selectedText);

        if (selectedText) {
            let position = { top: 0, left: 0 };
            if (selection) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                position = {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                };
            }

            console.log("Sending selected text to background script...");
            chrome.runtime.sendMessage({ action: "EXPLAIN_TEXT", selection: selectedText, position: position }, (response) => {
                console.log("Received response from background script:", response.data);

                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    return;
                }

                if (!response) {
                    console.error('No response from background script');
                    return;
                }

                if (!response.action) {
                    console.error('Unexpected response format:', response);
                    return;
                }

                switch (response.action) {
                    case "IGNORE":
                        break;
                    case "RESULT":
                        chrome.runtime.sendMessage({ type: "SHOW_POPUP", data: response.data, position: position });
                        // If there's already an overlay, remove it before displaying the new one
                        if (currentOverlay) {
                            currentOverlay.remove();
                        }
                        // Display the overlay with the result
                        displayOverlay(position, response.data);
                        break;
                    case "ERROR":
                        if (currentOverlay) {
                            currentOverlay.remove();
                        }
                        // Display the overlay with the result
                        const notFetchedData = response.data && response.data[0] ? [{ word: response.data[0].word, phonetics: [{ text: "none" }], meanings: [{ definitions: [{ definition: "No matching Found" }] }] }] : [{ word: "Unknown", phonetics: [{ text: "none" }], meanings: [{ definitions: [{ definition: "No matching Found" }] }] }];
                        displayOverlay(position, notFetchedData);
                        break;
                    default:
                        console.error("Unexpected response action:", response.action);
                }
            });
        } else {
            console.log("No text selected.");
            // Close the current overlay if no text is selected
            if (currentOverlay) {
                currentOverlay.remove();
                currentOverlay = null;  // Clear the current overlay reference
            }
        }
    });

    // Function to create and display the overlay
    function displayOverlay(position, data = [{ word: "Loading...", phonetics: [{ text: "None", audio: "" }], meanings: [{ definitions: [{ definition: "No meaning found" }] }] }]) {
        // Create the main overlay div
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.left = `${position.left - 90 > 16 ? position.left - 90 : 10}px`;  // Horizontal position of the selection
        overlay.style.top = `${position.top - 150 > 16 ? position.top - 150 : 10}px`; // Position above the selection
        overlay.style.backgroundColor = 'rgba(0, 0, 0)';
        overlay.style.color = 'white';
        overlay.style.padding = '10px';
        overlay.style.borderRadius = '8px';
        overlay.style.zIndex = '9999';
        overlay.style.width = '300px'; // Set a fixed width for the overlay
        overlay.style.maxWidth = '350px'; // Prevent the overlay from being too wide
        overlay.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        // Create the first row: Selected word + Close icon
        const row1 = document.createElement('div');
        row1.style.display = 'flex';
        row1.style.justifyContent = 'space-between';
        row1.style.alignItems = 'center';

        const word = document.createElement('span');
        word.textContent = data[0].word || "Loading...";  // The selected word
        word.style.fontSize = '16px';
        word.style.fontWeight = 'bold';

        const closeIcon = document.createElement('span');
        closeIcon.textContent = '×';  // Close icon
        closeIcon.style.fontSize = '20px';
        closeIcon.style.cursor = 'pointer';
        closeIcon.style.color = 'white';
        closeIcon.addEventListener('click', (event) => {
            event.stopPropagation();  // Prevent overlay close
            overlay.remove();  // Remove the overlay on close
            currentOverlay = null;  // Clear the current overlay reference
        });

        row1.appendChild(word);
        row1.appendChild(closeIcon);

        // Create the second row: Phonetics + Speaker icon
        const row2 = document.createElement('div');
        row2.style.display = 'flex';
        row2.style.justifyContent = 'space-between';
        row2.style.alignItems = 'center';
        row2.style.marginTop = '10px';

        const phonetic = document.createElement('span');
        phonetic.textContent = (data[0].phonetics && data[0].phonetics[0] && data[0].phonetics[0].text) || 'None';  // Phonetics of the word
        phonetic.style.fontSize = '14px';
        phonetic.style.color = '#ddd';

        row2.appendChild(phonetic);

        if (data[0].phonetics && data[0].phonetics[0] && data[0].phonetics[0].audio) {
            const speakerButton = document.createElement('button'); // Create a button element
            speakerButton.textContent = '🔊'; // Speaker icon for pronunciation
            speakerButton.style.fontSize = '18px';
            speakerButton.style.cursor = 'pointer';
            speakerButton.style.border = 'none'; // Optional: Style the button to look minimal
            speakerButton.style.background = 'transparent'; // Optional: Transparent background
            speakerButton.style.padding = '0'; // Optional: Remove padding for icon-only button
            speakerButton.style.outline = 'none'; // Optional: Remove focus outline
            speakerButton.setAttribute('aria-label', 'Play pronunciation'); // Accessibility enhancement

            speakerButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Stop event propagation to prevent overlay from closing
                if (data[0].phonetics && data[0].phonetics[0] && data[0].phonetics[0].audio) {
                    const audio = new Audio(data[0].phonetics[0].audio); // Play audio pronunciation
                    audio.play().catch((error) => {
                        console.error("Error playing audio:", error); // Handle potential errors
                    });
                } else {
                    console.warn("Audio not available for pronunciation."); // Handle cases with no audio
                }
            });

            row2.appendChild(speakerButton);
        }

        // Create the third row: Meaning
        const row3 = document.createElement('div');
        row3.style.marginTop = '10px';
        const meaning = document.createElement('p');
        meaning.textContent = (data[0].meanings && data[0].meanings[0].definitions[0].definition) || 'No meaning found';  // The meaning of the word
        meaning.style.fontSize = '16px';
        meaning.style.color = '#ddd';
        meaning.style.lineHeight = '1.7';

        row3.appendChild(meaning);

        // Append the rows to the overlay
        overlay.appendChild(row1);
        overlay.appendChild(row2);
        overlay.appendChild(row3);

        // Append the overlay to the document body
        document.body.appendChild(overlay);

        // Store the current overlay for future reference
        currentOverlay = overlay;
    }
})();
