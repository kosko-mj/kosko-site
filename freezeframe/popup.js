document.addEventListener('DOMContentLoaded', async () => {
    const freezeBtn = document.getElementById('freeze-btn');
    const tabCountEl = document.getElementById('tab-count');
    const historyList = document.getElementById('history-list');

    // 1. Get current active window tabs (excluding the extension popup itself)
    const currentTabs = await chrome.tabs.query({ currentWindow: true });
    const ramCountEl = document.getElementById('ram-count');
    
    const estimatedRam = Math.round(currentTabs.length * 75);
    
    tabCountEl.textContent = `${currentTabs.length} Tabs Open`;
    ramCountEl.textContent = `~${estimatedRam}MB RAM Loaded`;

    // 2. Render out any previously saved frames from local storage
    displaySavedFrames();

    // 3. The Freeze Action Click Handler with Custom Naming
    freezeBtn.addEventListener('click', async () => {
        if (currentTabs.length === 0) return;

        // Open a clean browser prompt to capture the session name
        let sessionName = prompt("Name this Freezeframe session:", "");
        
        // If the user hits cancel, abort the freeze completely so they don't lose tabs
        if (sessionName === null) return; 
        
        // Trim whitespace; if they left it blank, generate a clean fallback name
        sessionName = sessionName.trim();
        if (!sessionName) {
            const existing = await new Promise(resolve => chrome.storage.local.get({ savedFrames: [] }, resolve));
            sessionName = `Session #${existing.savedFrames.length + 1}`;
        }

        // Map tab data cleanly
        const tabsToSave = currentTabs.map(tab => ({
            title: tab.title,
            url: tab.url
        }));

        const timestamp = new Date().toLocaleDateString(); // Clean short date (e.g., 5/20/2026)
        const frameId = 'frame_' + Date.now();
        const frameData = {
            id: frameId,
            name: sessionName,
            date: timestamp,
            tabs: tabsToSave
        };

        // Pull existing history, prepend the new named frame, and save
        chrome.storage.local.get({ savedFrames: [] }, (result) => {
            const updatedFrames = [frameData, ...result.savedFrames];
            chrome.storage.local.set({ savedFrames: updatedFrames }, () => {
                
                // Open landing anchor tab
                chrome.tabs.create({ url: 'https://kosko-mj.github.io/kosko-site/' });

                // Close memory-hogging tabs
                currentTabs.forEach(tab => chrome.tabs.remove(tab.id));
            });
        });
    });

    // 4. Function to pull data from local storage and inject into the HTML queue
    function displaySavedFrames() {
        historyList.innerHTML = ''; // Clear out the list layout
        
        chrome.storage.local.get({ savedFrames: [] }, (result) => {
            if (result.savedFrames.length === 0) {
                historyList.innerHTML = '<li class="empty-state">No saved frames yet.</li>';
                return;
            }

            result.savedFrames.forEach(frame => {
                const li = document.createElement('li');
                li.className = 'frame-item';
                li.innerHTML = `
                    <div class="frame-info">
                        <strong>${frame.name || 'Untitled Session'}</strong>
                        <span>${frame.date} (${frame.tabs.length} tabs)</span>
                    </div>
                    <div class="frame-actions">
                        <button class="restore-btn" data-id="${frame.id}">Restore</button>
                        <button class="delete-btn" data-id="${frame.id}">Delete</button>
                    </div>
                `;
                historyList.appendChild(li);
            });

            // Wire up the dynamic click handlers for Restore and Delete buttons
            attachDisplayEventListeners(result.savedFrames);
        });
    }

    function attachDisplayEventListeners(savedFrames) {
        // Handle Restoring a Session
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const targetFrame = savedFrames.find(f => f.id === id);
                if (targetFrame) {
                    // Open every saved URL back into the current window
                    targetFrame.tabs.forEach(tab => chrome.tabs.create({ url: tab.url, active: false }));
                    // Clean up and remove that frame from history after restoring
                    deleteFrame(id);
                }
            });
        });

        // Handle Deleting a Session without restoring
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteFrame(id);
            });
        });
    }

    function deleteFrame(id) {
        chrome.storage.local.get({ savedFrames: [] }, (result) => {
            const filteredFrames = result.savedFrames.filter(f => f.id !== id);
            chrome.storage.local.set({ savedFrames: filteredFrames }, () => {
                displaySavedFrames(); // Rerender layout updates
            });
        });
    }
});