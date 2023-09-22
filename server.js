require('dotenv').config();

const fs = require('fs');
const path = require('path');

const cookieParser = require('cookie-parser');

const express = require('express');
const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL)
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(`Error connecting to DB: ${err}`));



app.use(express.static(path.resolve(__dirname, './frontend/build')));

const routes = fs.readdirSync(path.resolve(__dirname, './backend/routes'));
routes.forEach(route => {
    const router = require(`./backend/routes/${route}/${route}`);
    app.use(`/${route}`, router);
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './frontend/build', 'index.html'));
});



const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
