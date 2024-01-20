const express = require('express');
const path = require('path');  // Import the path module
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/../public')));

// Dummy data for demonstration purposes
const dummyPlacementData = [
    { skill: 'Skill1', day: 'Monday', fromHour: '09:00', toHour: '12:00', numOfEmployees: 3 },
    { skill: 'Skill2', day: 'Tuesday', fromHour: '13:00', toHour: '17:00', numOfEmployees: 2 },
    { skill: 'Skill3', day: 'Monday', fromHour: '09:00', toHour: '12:00', numOfEmployees: 6 },
    { skill: 'Skill4', day: 'Tuesday', fromHour: '13:00', toHour: '17:00', numOfEmployees: 4 }
    // Add more dummy data as needed
];

// Dummy route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the Employee Placement Server!');
});

// Endpoint to handle final placement request
app.post('/api/placement', (req, res) => {
    try {
        // Log the received data
        console.log('Received data:', req.body);

        // Process the received files and perform the algorithm (dummy data for demonstration)
        const { employeeSkillContent, workerRequirementsContent, shiftBasketContent } = req.body;

        // Perform your algorithm here with the provided data

        // For demonstration, return dummy placement data
        res.json(dummyPlacementData);
    } catch (error) {
        console.error('Error during final placement:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});