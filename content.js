console.log('Content script loaded');

let gridContainer = null;
let isVisible = false;
let currentLines = [];

// Create grid container
function createGridContainer() {
    console.log('Creating grid container');
    if (gridContainer) {
        console.log('Grid container already exists');
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
        console.log('Grid container created and appended');
    } catch (error) {
        console.error('Error creating grid container:', error);
    }
}

// Create a grid line
function createLine(type, position) {
    console.log(`Creating ${type} line at ${position}%`);
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
    console.log('Updating grid lines:', lines);
    try {
        if (!gridContainer) {
            console.log('No grid container, creating one');
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
                console.log(`Added ${line.type} line at ${line.position}%`);
            }
        });

        currentLines = lines;
        console.log('Grid lines updated successfully');
        
        // Make sure the grid is visible
        gridContainer.style.display = 'block';
        isVisible = true;
    } catch (error) {
        console.error('Error updating grid lines:', error);
    }
}

// Toggle grid visibility
function toggleGrid(show, lines) {
    console.log(`Toggling grid visibility: ${show ? 'show' : 'hide'}`);
    try {
        if (!gridContainer) {
            console.log('No grid container, creating one');
            createGridContainer();
        }
        
        if (lines) {
            updateGridLines(lines);
        }

        gridContainer.style.display = show ? 'block' : 'none';
        isVisible = show;
        console.log(`Grid visibility set to: ${show ? 'visible' : 'hidden'}`);
    } catch (error) {
        console.error('Error toggling grid:', error);
    }
}

// Initialize grid
function initializeGrid() {
    console.log('Initializing grid');
    try {
        createGridContainer();
        console.log('Grid initialized');
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
    console.log('Received message:', request);
    try {
        switch(request.action) {
            case 'toggle':
                toggleGrid(!isVisible, request.lines);
                break;
            case 'update':
                updateGridLines(request.lines);
                break;
            case 'getState':
                sendResponse({isVisible});
                break;
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
    return true;
}); 