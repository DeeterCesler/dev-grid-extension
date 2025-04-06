// Create grid overlay
function createGrid() {
    const grid = document.createElement('div');
    grid.id = 'grid-overlay';
    
    // Create vertical lines
    const v1 = document.createElement('div');
    v1.className = 'grid-line vertical';
    v1.style.left = '33%';
    
    const v2 = document.createElement('div');
    v2.className = 'grid-line vertical';
    v2.style.left = '66%';
    
    // Create horizontal lines
    const h1 = document.createElement('div');
    h1.className = 'grid-line horizontal';
    h1.style.top = '33%';
    
    const h2 = document.createElement('div');
    h2.className = 'grid-line horizontal';
    h2.style.top = '66%';
    
    // Add lines to grid
    grid.appendChild(v1);
    grid.appendChild(v2);
    grid.appendChild(h1);
    grid.appendChild(h2);
    
    // Add grid to page
    document.body.appendChild(grid);
    return grid;
}

// Initialize grid
let grid = createGrid();

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "toggleGrid") {
        grid.classList.toggle('show');
    }
});
