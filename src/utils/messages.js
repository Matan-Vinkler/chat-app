const Room = require("../db/rooms")

const generateMessage = (username, text, roomName) => {
    var room = Room.findOne({Name: roomName})
    var date = new Date().getTime()

    room.Messages.push({
        username,
        date,
        text
    })

    room.save()

    return {
        username,
        text,
        createdAt: date
    }
}

module.exports = {
    generateMessage
}