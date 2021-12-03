
const socket=io()
/* Elements */
const $form=document.querySelector('#message-form');
const $submitButton=$form.querySelector('button');
const $messageInput=$form.querySelector('input');
const $send_loc_button=document.querySelector('#sendLocation')
const $messages=document.querySelector('#messages')

/* Templates */
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationTemplate=document.querySelector('#location-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
// Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

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

$form.addEventListener('submit',e=>{
    e.preventDefault();
    $submitButton.setAttribute('disabled','disabled');
    
    socket.emit('sendMessage',e.target.elements.message.value,error=>{
        $submitButton.removeAttribute('disabled');
        $messageInput.value=''
        $messageInput.focus()
        if(error){
            console.log(error);
        }
        else
        console.log("message delivered")
    })
    e.target.elements.message.value=''
})
socket.on('message',({message,createdAt,username})=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        message,
        createdAt:moment(createdAt).format('hh:mm a'),
        username
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})
$send_loc_button.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Your browser doesn't support send location feature")
    }
    $send_loc_button.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(position=>{
        const {latitude,longitude}=position.coords;
        socket.emit('sendLocation',{latitude,longitude},()=>{
            $send_loc_button.removeAttribute('disabled')
            console.log('Location Shared!')
        });
    })
})
socket.on('recieveLoc',({message:location,createdAt,username})=>{
    console.log(location)
    const html=Mustache.render($locationTemplate,{
        location,
        createdAt:moment(createdAt).format('hh:mm a'),
        username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.emit('join',{username,room},error=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
socket.on('usersInRoom',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    const sidebar=document.querySelector('#sidebar');
    sidebar.innerHTML=html;
})