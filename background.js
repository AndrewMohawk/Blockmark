let checkInterval = 500; // Default check interval (500 ms)
let lastCheckedTime = Date.now();
let blockedBookmarks = [];

chrome.storage.sync.get(['checkInterval', 'blockedBookmarks'], (data) => {
    if (data.checkInterval && data.checkInterval >= 100) {
        checkInterval = data.checkInterval;
    } else {
        // Save the default check interval if not set
        chrome.storage.sync.set({ checkInterval: checkInterval });
    }

    if (data.blockedBookmarks) {
        blockedBookmarks = data.blockedBookmarks;
    } else {
        chrome.storage.sync.set({ blockedBookmarks: [] });
    }
});

function addToBlockedBookmarks(bookmark, addedFrom) {
    chrome.storage.sync.get("blockedBookmarks", (data) => {
      const blockedBookmarks = data.blockedBookmarks || [];
      const newBlockedBookmark = {
        title: bookmark.title,
        url: bookmark.url,
        addedFrom: addedFrom,
      };
  
      // Check if the newBlockedBookmark already exists in the blockedBookmarks array
      const existingBookmarkIndex = blockedBookmarks.findIndex(
        (bm) => bm.url === newBlockedBookmark.url
      );
  
      // If the newBlockedBookmark doesn't exist, add it to the array
      if (existingBookmarkIndex === -1) {
        blockedBookmarks.push(newBlockedBookmark);
      } else {
        // If it exists, update the existing entry
        blockedBookmarks[existingBookmarkIndex] = newBlockedBookmark;
      }
  
      chrome.storage.sync.set({ blockedBookmarks: blockedBookmarks });
    });
  }

function removeJavaScriptBookmarks() {
    chrome.bookmarks.search({}, (bookmarks) => {
        const jsBookmarks = bookmarks.filter((bookmark) =>
            bookmark.url && bookmark.url.startsWith("javascript:") && bookmark.dateAdded > lastCheckedTime
        );

        if (jsBookmarks.length > 0) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];

                jsBookmarks.forEach((bookmark) => {
                    // Remove the bookmark
                    chrome.bookmarks.remove(bookmark.id);
                    // Add the bookmark to the blockedBookmarks list with the active tab URL
                    addToBlockedBookmarks(bookmark, activeTab ? activeTab.url : 'N/A');
                });
            });
        }
        lastCheckedTime = Date.now();
    });
}

function startChecking() {
    setInterval(removeJavaScriptBookmarks, checkInterval);
}

// Listen for check interval changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.checkInterval) {
        checkInterval = changes.checkInterval.newValue;
        startChecking();
    }
});

startChecking();