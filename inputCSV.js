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

function proceedToFinalPlacement() {
    // Implement the logic for proceeding to final placement
    alert('Proceeding to Final Placement...');
    // You can add more logic or redirect to another page as needed
}