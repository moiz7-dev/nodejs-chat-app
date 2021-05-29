const socket = io.connect();

$chatRooms = document.querySelector('#chatRooms')
$inputRoom = document.querySelector('#room')

// template
chatRoomsTemplate = document.querySelector('#chatRooms-Template').innerHTML

socket.on('connect', () => {
    socket.emit('main-page');
});

socket.on('chatRooms', (rooms) => {
    html = Mustache.render(chatRoomsTemplate, { rooms })
    if(!rooms.length){
        return $chatRooms.innerHTML = '<p class="no-rooms">No Rooms available at the moment.</p>'
    }
    $chatRooms.innerHTML = html
})

const selectedChatRooms = () => {
    let room = document.querySelector('#select-chat-rooms').value
    $inputRoom.value = room
}