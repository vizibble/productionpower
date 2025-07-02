//Express Setup
const express = require('express');
const app = express();

//Using HTTP for socket.io
//Socket.io is used for real-time data transfer between the server and the client
const http = require("http")
const server = http.createServer(app)
const socket = require("socket.io")
const io = new socket.Server(server)
io.on("connection", (socket) => { app.set("socket", socket) })

//.env for sensitive information
require("dotenv").config();

//Express Middlewares for recieving and parsing json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Setting Up Templating Engine
const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(express.static(path.join(__dirname, 'src')))

//Different Routes
const Data_from_tanker_router = require("./routes/Data_from_device.js")
app.use("/api", Data_from_tanker_router)
const Frontend_Router = require("./routes/Frontend.js")
app.use("/", Frontend_Router)

//Connecting the Database
const client = require("./service/db.js")
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

//Starting the server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`Server Started at ${PORT}`))