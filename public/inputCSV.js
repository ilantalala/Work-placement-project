
var uploadedFileCount = 0;

// Function to handle file uploads
function handleFileUpload(inputId) {
    var fileInput = document.getElementById(inputId);
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var content = e.target.result;
            displayPartialContent(content); 
            disableUploadButton();
            uploadedFileCount++; 

            // Check if all three files are uploaded
            if (uploadedFileCount === 3) {
                addProceedButton(); 
            }
        };

        reader.readAsText(file);
    } else {
        alert('Please select a file to upload.');
    }
}

// Generic function to display partial content
function displayPartialContent(content) {
    var resultDiv = document.getElementById('result');
    var lines = content.split('\n').slice(0, 5).join('\n'); // Display only the first 5 lines
    var truncatedContent = lines.length < content.length ? lines + '...' : lines;

    resultDiv.innerHTML = '<h3>Uploaded CSV Content (Partial):</h3><pre>' + truncatedContent + '</pre>';
}

// Function to enable/disable upload button
function enableUploadButton(inputId, buttonId) {
    var uploadButton = document.getElementById(buttonId);
    var fileInput = document.getElementById(inputId);

    if (fileInput.files.length > 0) {
        uploadButton.disabled = false;
        uploadButton.style.backgroundColor = '#4CAF50'; // Change the color to the active state
    } else {
        uploadButton.disabled = true;
        uploadButton.style.backgroundColor = '#a0a0a0'; // Change the color to a disabled state
    }
}

// Function to disable upload button
function disableUploadButton() {
    var uploadButtons = document.querySelectorAll('[id^="upload"]');
    uploadButtons.forEach(function(button) {
        button.disabled = true;
        button.style.backgroundColor = '#a0a0a0'; 
    });
}

// Function to add "Proceed to Final Placement" button
function addProceedButton() {
    var resultDiv = document.getElementById('result');
    var proceedButton = document.createElement('button');
    proceedButton.id = 'proceedButton';
    proceedButton.innerHTML = 'Proceed to Final Placement';
    proceedButton.onclick = function() {
        proceedToFinalPlacement();
    };
    resultDiv.appendChild(proceedButton);
    proceedButton.style.backgroundColor = '#4CAF50';
}


// Assuming this code is triggered when you click the "Proceed to Final Placement" button
async function proceedToFinalPlacement() {
    try {
        // Get the content of the uploaded files
        const employeeSkillContent = getContent('employeeSkill');
        const workerRequirementsContent = getContent('workerRequirements');
        const shiftBasketContent = getContent('shiftBasket');

        const response = await fetch('http://localhost:3000/api/placement', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employeeSkillContent,
                workerRequirementsContent,
                shiftBasketContent,
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const placementData = await response.json();
        // Process placementData or navigate to another screen
        displayPlacementScreen(placementData);
    } catch (error) {
        console.error('Error during final placement:', error);
        alert('Error during final placement. Please try again.');
    }
}

// Helper function to get content from the uploaded files
function getContent(inputId) {
    const fileInput = document.getElementById(inputId);
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    } else {
        return null;
    }
}

// Function to display the placement data in a new HTML document with a table
function displayPlacementScreen(placementData) {
    // Create a new HTML document
    const newDocument = document.implementation.createHTMLDocument('Placement Screen');

    // Create a link element for the CSS file
    const linkElement = newDocument.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'placement.css';
    newDocument.head.appendChild(linkElement);

    // Create a table element
    const table = newDocument.createElement('table');
    table.classList.add('placement-table');

    // Create a header row
    const headerRow = table.insertRow();
    for (const key in placementData[0]) {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = key;
        headerRow.appendChild(headerCell);
    }

    // Populate the table with data
    placementData.forEach((data) => {
        const row = table.insertRow();
        for (const key in data) {
            const cell = row.insertCell();
            cell.innerHTML = data[key];
        }
    });

    // Append the table to the new document's body
    newDocument.body.appendChild(table);

    // Open the new document in a new window or tab
    const newWindow = window.open('');
    newWindow.document.write(newDocument.documentElement.outerHTML);
}