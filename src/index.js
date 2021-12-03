const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express();
const publicPath=path.join(__dirname,'../public')

const server=http.createServer(app);
app.use(express.static(publicPath))

const io=socketio(server);
io.on('connection',socket=>{
    console.log('connected!')
    socket.emit('message',generateMessage('Welcome','bot'))
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room);
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`,'bot')) 
        io.to(user.room).emit('usersInRoom',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left this room`,'bot'))
            io.to(user.room).emit('usersInRoom',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(message)){
            return callback('Bad words not allowed')
        }
        const user=getUser(socket.id);
        if(user)
            io.to(user.room).emit('message',generateMessage(message,user.username));
        callback();
    })
    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const user=getUser(socket.id);
        if(user)
            io.to(user.room).emit('recieveLoc',generateMessage(`https://google.com/maps?q=${latitude},${longitude}`,user.username))
        callback();
    })
})

const port= process.env.PORT || 3000
server.listen(port,()=>{
    console.log(`Listening on port ${port}...`);
})