const Room = require("../db/rooms")

const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: date
    }
}

module.exports = {
    generateMessage
}