const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "dist" folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route for serving the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const port = process.env.PORT || 4200;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
