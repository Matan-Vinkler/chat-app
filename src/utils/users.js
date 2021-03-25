var users = []

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room) {
        return {
            error: "Username and room are required."
        }
    }

    // Check for existing user
    var existingUser = users.find((user) => user.room  === room && user.username === username)

    // Validate username
    if(existingUser) {
        return {
            error: "Username is in use."
        }
    }

    // Store user
    var user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    var index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    var user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    var usersInRoom = users.filter((user) => user.room === room.trim().toLowerCase())
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}