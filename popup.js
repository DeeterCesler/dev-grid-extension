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
    console.log('Popup loaded');
    const toggleButton = document.getElementById('toggle');
    const presetButtons = document.querySelectorAll('[data-preset]');
    const addVerticalButton = document.getElementById('add-vertical');
    const addHorizontalButton = document.getElementById('add-horizontal');
    const removeLastButton = document.getElementById('remove-last');
    const linePositionSlider = document.getElementById('line-position');
    const positionValue = document.getElementById('position-value');

    let isGridVisible = false;
    let currentLines = [];

    // Update position value display
    linePositionSlider.addEventListener('input', function() {
        positionValue.textContent = this.value;
    });

    // Get the current tab and initialize
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (!currentTab) {
            console.error('No active tab found');
            return;
        }

        console.log('Querying tab state:', currentTab.id);
        chrome.tabs.sendMessage(currentTab.id, {action: 'getState'}, function(response) {
            console.log('Tab state response:', response);
            if (response && response.isVisible) {
                isGridVisible = true;
                toggleButton.textContent = 'Hide Grid';
            }
        });
    });

    // Toggle grid visibility
    toggleButton.addEventListener('click', function() {
        console.log('Toggle button clicked');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) {
                console.error('No active tab found');
                return;
            }

            isGridVisible = !isGridVisible;
            toggleButton.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';

            console.log('Sending toggle message:', {action: 'toggle', lines: currentLines});
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'toggle',
                lines: currentLines,
                show: isGridVisible
            }, function(response) {
                console.log('Toggle response:', response);
            });
        });
    });

    // Handle preset grid buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Preset button clicked:', this.dataset.preset);
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
                case 'golden':
                    const goldenRatio = 0.618033988749895;
                    lines = [
                        {type: 'vertical', position: goldenRatio * 100},
                        {type: 'horizontal', position: goldenRatio * 100}
                    ];
                    break;
                case 'rule-of-thirds':
                    lines = [
                        {type: 'vertical', position: 33.33},
                        {type: 'vertical', position: 66.66},
                        {type: 'horizontal', position: 33.33},
                        {type: 'horizontal', position: 66.66}
                    ];
                    break;
            }

            currentLines = lines;
            updateGrid();
            updateActiveButton(button);
        });
    });

    // Add custom lines
    function addLine(type) {
        console.log(`Adding ${type} line`);
        const position = parseFloat(linePositionSlider.value);
        if (isNaN(position) || position < 0 || position > 100) {
            console.error('Invalid position:', position);
            return;
        }

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
        console.log('Removing last line');
        if (currentLines.length > 0) {
            currentLines.pop();
            updateGrid();
        }
    });

    // Update grid with current lines
    function updateGrid() {
        console.log('Updating grid with lines:', currentLines);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) {
                console.error('No active tab found');
                return;
            }

            console.log('Sending update message:', {action: 'update', lines: currentLines});
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'update',
                lines: currentLines,
                show: isGridVisible
            }, function(response) {
                console.log('Update response:', response);
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
