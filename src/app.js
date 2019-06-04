const express = require('express')
require('./db/db')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Welcome to Party time')
})

module.exports = app