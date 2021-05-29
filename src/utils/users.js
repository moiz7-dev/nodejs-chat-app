const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room) {
        return {
            error: 'Username and room must be specified!'
        }
    }
    
    const existingUser  = users.find((user) => {
        return user.username === username && user.room === room
    })

    if(existingUser){
        return {
            error: 'Username already exists!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
}


const getChatRooms = () => {
    let rooms = []
    users.forEach((user) => {
        rooms.push(user.room)
    })

    uniqueRooms = [...new Set(rooms)];
    rooms = []
    uniqueRooms.forEach((room) => {
        rooms.push({room})
    })

    return rooms;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getChatRooms
}