const socket = io();

// Elements
const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location'); 
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-Template').innerHTML;
const locationMessageTemplate = document.querySelector('#locationMessage-Template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-Template').innerHTML;

// Join Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {

    html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        locationUrl: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sender', (classRight) => {
    var lastOfClass = [...document.querySelectorAll('.message')].pop()
    lastOfClass.classList.add(classRight)
    var name = lastOfClass.firstElementChild.firstElementChild.innerHTML = 'me';
})

socket.on('roomData', ({ room, users}) => {
    html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');

    let message  = $messageFormInput.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageForm.reset();
        $messageForm.focus();

        (error) ? console.warn(error) : console.log('Delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported on this browser!')
    }
    
    $sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition( (location) => {
        socket.emit('sendLocation', {
            lat: location.coords.latitude,
            long: location.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/';
    }
})