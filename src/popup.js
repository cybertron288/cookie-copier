// Get the current domain from the active tab
function getCurrentDomain(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      callback(url.hostname);
    } else {
      callback("unknown");
    }
  });
}

// Store copied cookies, replacing if domain already exists
function storeCopiedCookies(domain, cookies) {
  chrome.storage.local.get(["cookieHistory"], function (result) {
    let history = result.cookieHistory || [];
    // Remove existing entry for this domain
    history = history.filter((entry) => entry.domain !== domain);
    // Add new entry
    history.unshift({ domain: domain, cookies: cookies });
    // Keep only the last 3 unique entries
    history = history.slice(0, 3);
    chrome.storage.local.set({ cookieHistory: history });
  });
}

// Display stored cookie sets with radio buttons
function displayHistory() {
  chrome.storage.local.get(["cookieHistory"], function (result) {
    const history = result.cookieHistory || [];
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    if (history.length === 0) {
      historyList.innerHTML = "<p>No copied cookie sets yet.</p>";
      return;
    }
    history.forEach(function (entry, index) {
      const label = document.createElement("label");
      label.className = "flex items-center mb-2";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "cookieSet";
      radio.value = index;
      radio.className = "mr-2";
      const span = document.createElement("span");
      span.textContent = `${entry.domain} (${entry.cookies.length} cookies)`;
      label.appendChild(radio);
      label.appendChild(span);
      historyList.appendChild(label);
    });
  });
}

// Apply selected cookie set to current domain
function applyCookies(index) {
  getCurrentDomain(function (currentDomain) {
    chrome.storage.local.get(["cookieHistory"], function (result) {
      const history = result.cookieHistory || [];
      const selectedEntry = history[index];
      const status = document.getElementById("status");
      if (!selectedEntry) {
        status.textContent = "Selected cookie set not found.";
        return;
      }
      status.textContent = `Applying cookies from ${selectedEntry.domain} to ${currentDomain}...`;
      selectedEntry.cookies.forEach(function (cookie) {
        const protocol = cookie.secure ? "https://" : "http://";
        const url = protocol + currentDomain + (cookie.path || "/");
        const newCookie = {
          url: url,
          name: cookie.name,
          value: cookie.value,
          path: cookie.path || "/",
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
        };
        if (cookie.expirationDate) {
          newCookie.expirationDate = cookie.expirationDate;
        }
        chrome.cookies.set(newCookie, function (result) {
          if (chrome.runtime.lastError) {
            console.error("Error setting cookie:", chrome.runtime.lastError);
          }
        });
      });
      status.textContent = `Applied ${selectedEntry.cookies.length} cookies from ${selectedEntry.domain} to ${currentDomain}`;
    });
  });
}

// Initialize popup
document.addEventListener("DOMContentLoaded", function () {
  const copyButton = document.getElementById("copyButton");
  const applyButton = document.getElementById("applyButton");
  const status = document.getElementById("status");

  // Display current domain and history
  getCurrentDomain(function (domain) {
    document.getElementById(
      "currentDomain"
    ).innerHTML = `Current Domain: <div class="font-bold text-lg"> ${domain} </div>`;
  });
  displayHistory();

  // Copy cookies button
  copyButton.addEventListener("click", function () {
    copyButton.disabled = true;
    copyButton.textContent = "Copying...";
    getCurrentDomain(function (domain) {
      chrome.cookies.getAll({ domain: domain }, function (cookies) {
        storeCopiedCookies(domain, cookies);
        displayHistory();
        copyButton.disabled = false;
        copyButton.textContent = "Copy Cookies";
        status.style.color = "#4CAF88";
        status.textContent = `Copied ${cookies.length} cookies from ${domain}`;
      });
    });
  });

  // Apply selected cookies button
  applyButton.addEventListener("click", function () {
    const selectedRadio = document.querySelector(
      "input[name='cookieSet']:checked"
    );
    if (!selectedRadio) {
      status.style.color = "#E57474";
      status.textContent = "Please select a cookie set to apply.";
      return;
    }
    applyCookies(selectedRadio.value);
  });
});
