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
    const clearButton = document.getElementById('clear');
    const presetButtons = document.querySelectorAll('[data-preset]');
    const addVerticalButton = document.getElementById('add-vertical');
    const addHorizontalButton = document.getElementById('add-horizontal');
    const removeLastButton = document.getElementById('remove-last');
    const linePositionSlider = document.getElementById('line-position');
    const positionValue = document.getElementById('position-value');
    // const lineThicknessSlider = document.getElementById('line-thickness');
    const thicknessValue = document.getElementById('thickness-value');
    const lineControls = document.getElementById('line-controls');
    const savePresetButton = document.getElementById('save-preset');
    const customPresetsContainer = document.getElementById('custom-presets');
    const customPresetsSection = document.getElementById('custom-presets-section');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const confirmDeleteButton = document.getElementById('confirm-delete');

    let isGridVisible = false;
    let currentLines = [];
    let selectedLineIndex = -1;
    let lineThickness = 2;
    let presetToDelete = null;

    // Update toggle button state
    function updateToggleButton() {
        const hasLines = currentLines.length > 0;
        toggleButton.disabled = !hasLines;
        if (!hasLines) {
            toggleButton.style.opacity = '0.5';
            toggleButton.textContent = 'Hide Grid';
        } else {
            toggleButton.style.opacity = '1';
            toggleButton.textContent = isGridVisible ? 'Hide Grid' : 'Show Grid';
        }
    }

    // Check grid visibility
    function checkGridVisibility() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) {
                console.error('No active tab found');
                return;
            }

            chrome.tabs.sendMessage(currentTab.id, {action: 'getState'}, function(response) {
                console.log('Grid visibility check:', response);
                if (response) {
                    isGridVisible = response.isVisible;
                    updateToggleButton();
                }
            });
        });
    }

    // Delete confirmation handlers
    cancelDeleteButton.addEventListener('click', () => {
        deleteConfirmModal.style.display = 'none';
        presetToDelete = null;
    });

    confirmDeleteButton.addEventListener('click', () => {
        if (presetToDelete) {
            deleteCustomPreset(presetToDelete);
            deleteConfirmModal.style.display = 'none';
            presetToDelete = null;
        }
    });

    // Load saved state from storage
    chrome.storage.local.get(['gridState', 'customPresets'], function(result) {
        if (result.gridState) {
            currentLines = result.gridState.lines || [];
            selectedLineIndex = result.gridState.selectedLineIndex || -1;
            if (currentLines.length > 0) {
                lineControls.classList.add('visible');
                if (selectedLineIndex >= 0 && currentLines[selectedLineIndex]) {
                    linePositionSlider.value = currentLines[selectedLineIndex].position;
                    positionValue.textContent = currentLines[selectedLineIndex].position;
                }
            }
        }
        if (result.lineThickness) {
            lineThickness = result.lineThickness;
            // lineThicknessSlider.value = lineThickness;
            thicknessValue.textContent = lineThickness;
            updateGrid();
        }
        if (result.customPresets) {
            loadCustomPresets(result.customPresets);
        }

        // Check initial grid state
        checkGridVisibility();
    });

    // Load custom presets
    function loadCustomPresets(presets) {
      console.log('presets');
        customPresetsContainer.innerHTML = '';
        if (Object.keys(presets).length === 0) {
          console.log('no presets');
            customPresetsSection.style.display = 'none';
            return;
        }
        customPresetsSection.style.display = 'block';

        Object.entries(presets).forEach(([name, preset]) => {
          console.log('preset: ', preset);
            const button = document.createElement('button');
            button.textContent = name;
            button.className = 'custom-preset';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-preset';
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                presetToDelete = name;
                deleteConfirmModal.style.display = 'block';
            };
            
            button.appendChild(deleteButton);
            button.onclick = () => loadCustomPreset(name, preset);
            
            customPresetsContainer.appendChild(button);
        });
    }

    // Load a custom preset
    function loadCustomPreset(name, preset) {
        currentLines = preset.lines;
        if (preset.thickness) {
            // lineThickness = preset.thickness;
            // lineThicknessSlider.value = lineThickness;
            // thicknessValue.textContent = lineThickness;
        }
        updateGrid();
        saveState();
        checkGridVisibility();
    }

    // Delete a custom preset
    function deleteCustomPreset(name) {
        chrome.storage.local.get(['customPresets'], function(result) {
            const customPresets = result.customPresets || {};
            delete customPresets[name];
            chrome.storage.local.set({customPresets}, function() {
                loadCustomPresets(customPresets);
            });
        });
    }

    // Save state to storage
    function saveState() {
        chrome.storage.local.set({
            gridState: {
                lines: currentLines,
                selectedLineIndex: selectedLineIndex
            },
            // lineThickness: lineThickness
        });
    }

    // Update position value display
    linePositionSlider.addEventListener('input', function() {
        positionValue.textContent = this.value;
        if (selectedLineIndex >= 0 && currentLines[selectedLineIndex]) {
            currentLines[selectedLineIndex].position = parseFloat(this.value);
            updateGrid();
            saveState();
        }
    });

    // Update thickness value display
    // lineThicknessSlider.addEventListener('input', function() {
    //     thicknessValue.textContent = this.value;
    //     lineThickness = parseInt(this.value);
    //     updateGrid();
    //     saveState();
    // });

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

    // Clear grid
    clearButton.addEventListener('click', function() {
        currentLines = [];
        selectedLineIndex = -1;
        lineControls.classList.remove('visible');
        updateGrid();
        saveState();
        presetButtons.forEach(button => button.classList.remove('active'));
        checkGridVisibility();
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
            updateToggleButton();

            console.log('Sending toggle message:', {action: 'toggle', lines: currentLines, thickness: lineThickness});
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'toggle',
                lines: currentLines,
                // thickness: lineThickness
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
                        {type: 'vertical', position: 50}
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
                    lines = Array.from({length: 11}, (_, i) => ({
                        type: 'vertical',
                        position: ((i + 1) * 100) / 12
                    }));
                    break;
                case 'h-even':
                    lines = [
                        {type: 'horizontal', position: 50}
                    ];
                    break;
                case 'h-3':
                    lines = [
                        {type: 'horizontal', position: 33.33},
                        {type: 'horizontal', position: 66.66}
                    ];
                    break;
                case 'h-6':
                    lines = [
                        {type: 'horizontal', position: 16.66},
                        {type: 'horizontal', position: 33.33},
                        {type: 'horizontal', position: 50},
                        {type: 'horizontal', position: 66.66},
                        {type: 'horizontal', position: 83.33}
                    ];
                    break;
                case 'h-12':
                    lines = Array.from({length: 11}, (_, i) => ({
                        type: 'horizontal',
                        position: ((i + 1) * 100) / 12
                    }));
                    break;
                case 'combined-even':
                    lines = [
                        {type: 'vertical', position: 50},
                        {type: 'horizontal', position: 50}
                    ];
                    break;
                case 'combined-3':
                    lines = [
                        {type: 'vertical', position: 33.33},
                        {type: 'vertical', position: 66.66},
                        {type: 'horizontal', position: 33.33},
                        {type: 'horizontal', position: 66.66}
                    ];
                    break;
                case 'combined-6':
                    lines = [
                        ...Array.from({length: 5}, (_, i) => ({
                            type: 'vertical',
                            position: ((i + 1) * 100) / 6
                        })),
                        ...Array.from({length: 5}, (_, i) => ({
                            type: 'horizontal',
                            position: ((i + 1) * 100) / 6
                        }))
                    ];
                    break;
                case 'combined-12':
                    lines = [
                        ...Array.from({length: 11}, (_, i) => ({
                            type: 'vertical',
                            position: ((i + 1) * 100) / 12
                        })),
                        ...Array.from({length: 11}, (_, i) => ({
                            type: 'horizontal',
                            position: ((i + 1) * 100) / 12
                        }))
                    ];
                    break;
            }

            currentLines = lines;
            updateGrid();
            updateActiveButton(button);
            lineControls.classList.remove('visible');
            selectedLineIndex = -1;
            saveState();
            checkGridVisibility();
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

        if (!lineControls.classList.contains('visible')) {
            lineControls.classList.add('visible', 'attention');
            setTimeout(() => lineControls.classList.remove('attention'), 1000);
        }

        selectedLineIndex = currentLines.length - 1;
        linePositionSlider.value = position;
        positionValue.textContent = position;

        updateGrid();
        presetButtons.forEach(button => button.classList.remove('active'));
        saveState();
        checkGridVisibility();
    }

    addVerticalButton.addEventListener('click', () => addLine('vertical'));
    addHorizontalButton.addEventListener('click', () => addLine('horizontal'));

    // Remove last line
    removeLastButton.addEventListener('click', function() {
        console.log('Removing last line');
        if (currentLines.length > 0) {
            currentLines.pop();
            selectedLineIndex = currentLines.length - 1;
            if (selectedLineIndex >= 0) {
                linePositionSlider.value = currentLines[selectedLineIndex].position;
                positionValue.textContent = currentLines[selectedLineIndex].position;
            } else {
                lineControls.classList.remove('visible');
            }
            updateGrid();
            saveState();
        }
    });

    // Save current lines as preset
    savePresetButton.addEventListener('click', function() {
        if (currentLines.length === 0) return;

        const presetName = prompt('Enter a name for your preset:');
        if (!presetName) return;

        // Save to local storage
        chrome.storage.local.get(['customPresets'], function(result) {
            const customPresets = result.customPresets || {};
            customPresets[presetName] = {
                lines: currentLines,
                // thickness: lineThickness
            };
            chrome.storage.local.set({customPresets}, function() {
                loadCustomPresets(customPresets);
            });
        });
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

            console.log('Sending update message:', {action: 'update', lines: currentLines, thickness: lineThickness});
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'update',
                lines: currentLines,
                // thickness: lineThickness
            }, function(response) {
                console.log('Update response:', response);
                if (response) {
                    isGridVisible = response.isVisible;
                    updateToggleButton();
                }
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
