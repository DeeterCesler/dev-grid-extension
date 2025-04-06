// Function that will be injected
function createAndToggleGrid() {
    // Create or get grid
    let grid = document.getElementById('grid-overlay');
    if (!grid) {
        grid = document.createElement('div');
        grid.id = 'grid-overlay';
        grid.style.position = 'fixed';
        grid.style.top = '0';
        grid.style.left = '0';
        grid.style.width = '100%';
        grid.style.height = '100%';
        grid.style.pointerEvents = 'none';
        grid.style.zIndex = '9999';
        grid.style.display = 'none';
        
        // Create vertical lines
        const v1 = document.createElement('div');
        v1.style.position = 'absolute';
        v1.style.width = '2px';
        v1.style.height = '100%';
        v1.style.top = '0';
        v1.style.left = '33%';
        v1.style.backgroundColor = 'rgba(255, 0, 166, 0.8)';
        
        const v2 = document.createElement('div');
        v2.style.position = 'absolute';
        v2.style.width = '2px';
        v2.style.height = '100%';
        v2.style.top = '0';
        v2.style.left = '66%';
        v2.style.backgroundColor = 'rgba(255, 0, 166, 0.8)';
        
        // Create horizontal lines
        const h1 = document.createElement('div');
        h1.style.position = 'absolute';
        h1.style.height = '2px';
        h1.style.width = '100%';
        h1.style.left = '0';
        h1.style.top = '33%';
        h1.style.backgroundColor = 'rgba(255, 0, 166, 0.8)';
        
        const h2 = document.createElement('div');
        h2.style.position = 'absolute';
        h2.style.height = '2px';
        h2.style.width = '100%';
        h2.style.left = '0';
        h2.style.top = '66%';
        h2.style.backgroundColor = 'rgba(255, 0, 166, 0.8)';
        
        // Add lines to grid
        grid.appendChild(v1);
        grid.appendChild(v2);
        grid.appendChild(h1);
        grid.appendChild(h2);
        
        // Add grid to page
        document.body.appendChild(grid);
    }
    
    // Toggle visibility
    grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
}

// Add click handler when popup loads
document.addEventListener('DOMContentLoaded', function() {
    // Determine which browser API to use
    const browserAPI = typeof chrome !== 'undefined' ? chrome : 
                      typeof brave !== 'undefined' ? brave : 
                      typeof browser !== 'undefined' ? browser : null;

    if (!browserAPI) {
        alert('Browser API not found!');
        return;
    }

    document.getElementById('toggle').addEventListener('click', function() {
        browserAPI.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0]) {
                alert('No active tab found');
                return;
            }
            
            browserAPI.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: createAndToggleGrid
            }).catch(function(err) {
                alert('Failed to execute script: ' + err.message);
            });
        });
    });
});
