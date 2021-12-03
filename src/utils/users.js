const users=[]

const addUser=({id,username,room})=>{
    if(!username || !room){
        return {error:'Username and room are required!'}
    }
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()
    const isPresent=users.find(user=>{
        return user.room===room && user.username===username
    })
    if(isPresent){
        return {error:'Username is taken'}
    }
    const user={id,username,room}
    users.push(user)
    return {user};
}
const removeUser=id=>{
    const userIndex=users.findIndex(user=>user.id===id)
    if(userIndex!==-1){
        return users.splice(userIndex,1)[0]
    }
}
const getUser=id=>{
    const user=users.find(user=>user.id===id)
    return user
}
const getUsersInRoom=room=>{
    if(!room){
        return {error:'room name is required'}
    }
    room=room.trim().toLowerCase()
    const usersInRoom=users.filter(user=>user.room===room)
    return usersInRoom
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}