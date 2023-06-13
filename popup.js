function setCheckInterval(event) {
    const checkInterval = parseInt(event.target.value, 10);
    if (checkInterval >= 500) {
      chrome.storage.sync.set({ checkInterval: checkInterval });
    }
  }
  
  document.getElementById("checkInterval").addEventListener("input", setCheckInterval);
  
  chrome.storage.sync.get("checkInterval", (data) => {
    document.getElementById("checkInterval").value = data.checkInterval || 500;
  });

  function createBookmarkElement(bookmark, index) {
    const bookmarkElement = document.createElement("div");
    bookmarkElement.classList.add("bg-white", "p-4", "rounded", "shadow");
  
    const titleElement = document.createElement("div");
    titleElement.classList.add("text-gray-600", "mt-2");
    titleElement.classList.add("font-semibold");
    titleElement.textContent =  `Bookmark Title: ${bookmark.title}`;
  
    const urlElement = document.createElement("pre");
    urlElement.classList.add("bg-gray-100", "rounded", "p-2", "text-sm", "mt-1");
    urlElement.textContent = bookmark.url;
  
    const addedFromElement = document.createElement("div");
    addedFromElement.classList.add("text-gray-600", "mt-2");
    addedFromElement.classList.add("font-semibold");
    addedFromElement.textContent = `Added from: ${bookmark.addedFrom}`;
  
    const removeButton = document.createElement("button");
    removeButton.classList.add("bg-red-500", "text-white", "px-2", "py-1", "rounded", "mt-4");
    removeButton.textContent = "Remove";
    removeButton.onclick = () => {
      removeBlockedBookmark(index);
    };
  
    bookmarkElement.appendChild(titleElement);
    bookmarkElement.appendChild(urlElement);
    bookmarkElement.appendChild(addedFromElement);
    bookmarkElement.appendChild(removeButton);
  
    return bookmarkElement;
  }
  
  function displayBlockedBookmarks(blockedBookmarks) {
    const blockedBookmarksList = document.getElementById("blockedBookmarksList");
    blockedBookmarksList.innerHTML = '';
  
    blockedBookmarks.forEach((bookmark, index) => {
      const bookmarkElement = createBookmarkElement(bookmark, index);
      blockedBookmarksList.appendChild(bookmarkElement);
    });

    // IF there are no blocked bookmarks, display a message
    if (blockedBookmarks.length === 0) {
        const noBlockedBookmarksMessage = document.createElement("div");
        noBlockedBookmarksMessage.classList.add("text-gray-600", "mt-2");
        noBlockedBookmarksMessage.textContent = "No blocked bookmarks";
        blockedBookmarksList.appendChild(noBlockedBookmarksMessage);
    }
  }
  
  function removeBlockedBookmark(index) {
    chrome.storage.sync.get("blockedBookmarks", (data) => {
      const blockedBookmarks = data.blockedBookmarks;
      blockedBookmarks.splice(index, 1);
      chrome.storage.sync.set({ blockedBookmarks: blockedBookmarks }, () => {
        displayBlockedBookmarks(blockedBookmarks);
      });
    });
  }
  
  chrome.storage.sync.get("blockedBookmarks", (data) => {
    displayBlockedBookmarks(data.blockedBookmarks);
  });