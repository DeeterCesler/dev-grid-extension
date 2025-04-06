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
    const toggleButton = document.getElementById('toggle');
    const presetButtons = document.querySelectorAll('[data-preset]');
    const addVerticalButton = document.getElementById('add-vertical');
    const addHorizontalButton = document.getElementById('add-horizontal');
    const removeLastButton = document.getElementById('remove-last');
    const positionInput = document.getElementById('position');

    let isGridVisible = false;
    let currentLines = [];

    // Get the current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (!currentTab) return;

        // Check if grid is already visible
        chrome.tabs.sendMessage(currentTab.id, {action: 'getState'}, function(response) {
            if (response && response.isVisible) {
                isGridVisible = true;
                toggleButton.textContent = 'Hide Grid';
            }
        });
    });

    // Toggle grid visibility
    toggleButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) return;

            isGridVisible = !isGridVisible;
            toggleButton.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';

            chrome.tabs.sendMessage(currentTab.id, {
                action: 'toggle',
                lines: currentLines
            });
        });
    });

    // Handle preset grid buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;
            let lines = [];

            switch(preset) {
                case 'even':
                    lines = [
                        {type: 'vertical', position: 50},
                        {type: 'horizontal', position: 50}
                    ];
                    break;
                case 'col-3':
                    lines = [
                        {type: 'vertical', position: 33.33},
                        {type: 'vertical', position: 66.66}
                    ];
                    break;
                case 'col-6':
                    lines = [
                        {type: 'vertical', position: 16.66},
                        {type: 'vertical', position: 33.33},
                        {type: 'vertical', position: 50},
                        {type: 'vertical', position: 66.66},
                        {type: 'vertical', position: 83.33}
                    ];
                    break;
                case 'col-12':
                case 'tailwind':
                case 'bootstrap':
                    lines = Array.from({length: 11}, (_, i) => ({
                        type: 'vertical',
                        position: ((i + 1) * 100) / 12
                    }));
                    break;
            }

            currentLines = lines;
            updateGrid();
            updateActiveButton(button);
        });
    });

    // Add custom lines
    function addLine(type) {
        const position = parseFloat(positionInput.value);
        if (isNaN(position) || position < 0 || position > 100) return;

        currentLines.push({
            type: type,
            position: position
        });

        updateGrid();
    }

    addVerticalButton.addEventListener('click', () => addLine('vertical'));
    addHorizontalButton.addEventListener('click', () => addLine('horizontal'));

    // Remove last line
    removeLastButton.addEventListener('click', function() {
        if (currentLines.length > 0) {
            currentLines.pop();
            updateGrid();
        }
    });

    // Update grid with current lines
    function updateGrid() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) return;

            chrome.tabs.sendMessage(currentTab.id, {
                action: 'update',
                lines: currentLines
            });
        });
    }

    // Update active button state
    function updateActiveButton(activeButton) {
        presetButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
});
