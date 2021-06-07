const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_PATH, {
    useNewUrlParser: true,
    useCreateIndex: true
})

const msgSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true
    },
    roomName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true
    }
})

const Msg = mongoose.model("User", msgSchema)

const generateMessage = (username, text, room) => {
    var dateTime = Date.now()
    var time = new Date(dateTime)
    var timeStr = `${time.getHours()}:${time.getMinutes()}`

    var msg = new Msg({username, text, roomName: room, createdAt: timeStr})

    msg.save()

    return {
        username,
        text,
    }
}

module.exports = {
    generateMessage,
    Msg
}