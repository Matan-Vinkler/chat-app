var socket = io()

// Elements
var $locationForm = document.querySelector("#sendLocation")
var $msgForm = document.querySelector("#msg-form")
var $msgFormInput = $msgForm.querySelector("input")
var $msgFormButton = $msgForm.querySelector("button")
var $messages = document.querySelector("#messages")
var $sidebar = document.querySelector("#sidebar")

// Templates
var msgTemp = document.querySelector("#message-template").innerHTML
var locationTemp = document.querySelector("#location-template").innerHTML
var sidebarTemp = document.querySelector("#sidebar-template").innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    var $new = $messages.lastElementChild

    // Height of the new message
    var newMsgStyles = getComputedStyle($new)
    var newMsgMargin = parseInt(newMsgStyles.marginBottom)
    var newMsgHeight = $new.offsetHeight + newMsgMargin

    // Visible Height
    var visibleHeight = $messages.offsetHeight

    // Height of messages container
    var containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    var scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

$msgForm.addEventListener("submit", (e) => {
    e.preventDefault()
    $msgFormButton.setAttribute("disabled", "disabled")

    var msg = e.target.elements.msg.value

    socket.emit("sendMessage", msg, (cb_msg) => {
        $msgFormButton.removeAttribute("disabled")
        $msgFormInput.value = ""

        if(cb_msg == "Profanity is not allowed." || msg == "Must provide a message.") {
            alert(cb_msg)
        }
        else {
            console.log(cb_msg)
        }
    })
})

$locationForm.addEventListener("click", (e) => {
    e.preventDefault()
    $locationForm.setAttribute("disabled", "disabled")

    if(!navigator.geolocation) {
        return alert("GeoLocation is not supported by your browser.")
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        var location = {
            lat: pos.coords.latitude,
            long: pos.coords.longitude
        }

        socket.emit("sendLocation", location, (cb_msg) => {
            $locationForm.removeAttribute("disabled")
            console.log(cb_msg)
        })
    })
})

socket.on("message", (msg) => {
    if(msg.text.startsWith("https://") || msg.text.startsWith("http://")) {
        var html = Mustache.render(locationTemp, {
            username: msg.username,
            url: msg.text,
            msg: msg.text,
            createdAt: moment(msg.createdAt).format("HH:mm")
        })

        $messages.insertAdjacentHTML("beforeend", html)
    }
    else {
        var html = Mustache.render(msgTemp, {
            username: msg.username,
            msg: msg.text,
            createdAt: moment(msg.createdAt).format("HH:mm")
        })
            
        $messages.insertAdjacentHTML("beforeend", html)
    }

    autoscroll()
})

socket.on("locationMessage", (url) => {
    var html = Mustache.render(locationTemp, {
        username: url.username,
        url: url.text,
        msg: "Here is my location!",
        createdAt: moment(url.createdAt).format("HH:mm")
    })

    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData", ({room, users}) => {
    var html = Mustache.render(sidebarTemp, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

socket.emit("join", {username, room}, (error, saved) => {
    if(error) {
        alert(error)
        location.href = "/"
    }

    if(saved) {
        JSON.parse(saved).forEach((msg) => {
            if(msg.text.startsWith("https://") || msg.text.startsWith("http://")) {
                if(msg.text.startsWith("https://google.com/maps?q=")) {
                    var html = Mustache.render(locationTemp, {
                        username: msg.username,
                        url: msg.text,
                        msg: "Here is my location!",
                        createdAt: ""
                    })
                }
                else {
                    var html = Mustache.render(locationTemp, {
                        username: msg.username,
                        url: msg.text,
                        msg: msg.text,
                        createdAt: ""
                    })
                }

                $messages.insertAdjacentHTML("beforeend", html)
            }
            else {
                var html = Mustache.render(msgTemp, {
                    username: msg.username,
                    msg: msg.text,
                    createdAt: ""
                })
            
                $messages.insertAdjacentHTML("beforeend", html)
            }
        });

        autoscroll()
    }
})