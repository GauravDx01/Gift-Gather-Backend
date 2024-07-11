require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT
const app = express()
const router = require('./routes/routes')
const server = require('./server/server')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json())
app.use('/api' , router)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(`${port}` , ()=>{
    console.log(`Server is running at port ${port}`)
})

