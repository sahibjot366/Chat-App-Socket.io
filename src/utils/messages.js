const generateMessage=(text,username)=>{
    return (
        {
        message:text,
        createdAt:new Date().getTime(),
        username
        }
    )
}
module.exports={generateMessage}