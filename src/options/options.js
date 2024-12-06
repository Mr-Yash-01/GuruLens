document.getElementById('saveSettings')?.addEventListener('click', () => {
  const darkMode = document.getElementById('darkMode').checked;
  const excludedSites = document.getElementById('excludedSites').value.trim()
    .split('\n')
    .map((site) => site.trim())
    .filter((site) => site.length > 0);
  
  // Debugging logs
  console.log('Dark Mode:', darkMode);
  console.log('Excluded Sites:', excludedSites);
  
  // Save the settings using chrome.storage.sync
  chrome.storage.sync.set({ darkMode, excludedSites }, () => {
    alert('Settings saved!');
    console.log('Settings saved to chrome.storage');
  });
});
