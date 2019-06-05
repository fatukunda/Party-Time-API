const express = require('express')

const userRouter = require('./routers/user')
const partyRouter = require('./routers/party')
const requestRouter = require('./routers/request')
require('./db/db')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(partyRouter)
app.use(requestRouter)


module.exports = app