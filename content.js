let gridContainer = null;
let isVisible = false;
let currentLines = [];

// Create grid container
function createGridContainer() {
    if (gridContainer) {
        return;
    }

    try {
        gridContainer = document.createElement('div');
        gridContainer.id = 'dev-grid-overlay';
        gridContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999999;
            display: none;
            background: transparent;
        `;
        document.body.appendChild(gridContainer);
    } catch (error) {
        console.error('Error creating grid container:', error);
    }
}

// Create a grid line
function createLine(type, position) {
    const line = document.createElement('div');
    line.className = 'dev-grid-line';
    
    if (type === 'vertical') {
        line.style.cssText = `
            position: absolute;
            top: 0;
            left: ${position}%;
            width: 4px;
            height: 100%;
            background: rgba(255, 0, 0, 0.8);
            z-index: 999999;
            box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
        `;
    } else {
        line.style.cssText = `
            position: absolute;
            left: 0;
            top: ${position}%;
            width: 100%;
            height: 4px;
            background: rgba(255, 0, 0, 0.8);
            z-index: 999999;
            box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
        `;
    }

    return line;
}

// Update grid lines
function updateGridLines(lines) {
    try {
        if (!gridContainer) {
            createGridContainer();
        }
        
        // Clear existing lines
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
        }

        // Add new lines
        lines.forEach(line => {
            if (typeof line.position === 'number' && line.position >= 0 && line.position <= 100) {
                const newLine = createLine(line.type, line.position);
                gridContainer.appendChild(newLine);
            }
        });

        currentLines = lines;
        gridContainer.style.display = 'block';
        isVisible = true;
    } catch (error) {
        console.error('DEBUG: Error updating grid lines:', error);
    }
}

// Toggle grid visibility
function toggleGrid(show, lines) {
    try {
        if (!gridContainer) {
            createGridContainer();
        }
        
        if (lines) {
            updateGridLines(lines);
        }

        gridContainer.style.display = show ? 'block' : 'none';
        isVisible = show;
    } catch (error) {
        console.error('Error toggling grid:', error);
    }
}

// Initialize grid
function initializeGrid() {
    try {
        createGridContainer();
    } catch (error) {
        console.error('Error initializing grid:', error);
    }
}

// Initialize grid on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGrid);
} else {
    initializeGrid();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        if (request.action === 'update') {
            updateGridLines(request.lines);
            sendResponse({isVisible: true});
        }
    } catch (error) {
        console.error('DEBUG: Error in content script:', error);
    }
    return true;
});
