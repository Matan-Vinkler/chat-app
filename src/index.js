const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage} = require("./utils/messages")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname, "../public")
const port = process.env.PORT || 3000

app.use(express.static(publicPath))
app.use(express.json())

io.on("connection", (socket) => {
    socket.on("join", ({username, room}, callback) => {
        var {error, user} = addUser({id: socket.id, username, room})

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("System", "Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage("System", `${user.username} has joined!`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const filter = new Filter()
        var user = getUser(socket.id)
        msg = msg.trim()


        if(filter.isProfane(msg)) {
            return callback("Profanity is not allowed.")
        }

        if(msg === "") {
            return callback("Must provide a message.")
        }

        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback("Sent")
    })

    socket.on("sendLocation", (location, callback) => {
        var user = getUser(socket.id)

        io.emit("locationMessage", generateMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
        callback("Location shared!")

    })

    socket.on("disconnect", () => {
        var user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit("message", generateMessage("System", `${user.username} has left.`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => console.log(`The server is up on port ${port}.`))