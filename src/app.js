const express = require('express')

const userRouter = require('./routers/user')
const partyRouter = require('./routers/party')
require('./db/db')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(partyRouter)


module.exports = app