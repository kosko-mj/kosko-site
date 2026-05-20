# Freezeframe

A lightweight, local-first browser extension designed to instantly pause, capture, and archive active window sessions to free up system memory. 

Built with a sharp brutalist aesthetic and an architectural mid-century modern layout, Freezeframe gives you a zero-bloat environment to clear your browser workspace without losing your research threads.

## Core Features

* **Instant CPU Unloading** – Freezes all active tabs in the current window instantly, calculating an estimated baseline of reclaimed RAM.
* **Structural Named Capsules** – Prompt-driven session naming allows you to group research by topic (e.g., *Italy Research*, *SaaS Architecture*) with an automatic numeric sequence fallback (`Session #1`, `Session #2`).
* **100% Client-Side Privacy** – No external servers, no tracking scripts, and zero analytics. All tab structures are sandboxed entirely on your local machine using `chrome.storage.local`.
* **Clean Landing Anchor** – Once tabs are frozen, the window gracefully redirects to a single, focused landing space instead of crashing the browser window.

## Architecture

* **Manifest V3** – Built using modern extension standards for fast execution and secure permission mapping.
* **Zero Dependencies** – Written purely in raw vanilla JavaScript, semantic HTML5, and architectural CSS.

## Local Installation (Developer Sideload)

1. Clone or download this repository to your local computer.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** to **ON** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the local `freezeframe` project folder.