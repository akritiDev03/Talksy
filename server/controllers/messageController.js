import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";


//Get all users except the logged in user
export const getUserForSidebar = async(req,res)=>{
     try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne: userId}}).select("-password");

        //Count number of unseen messages
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user)=>{
             const messages =  await Message.find({senderId: user._id, receiverId: userId, seen: false})
             if(messages.length>0){
                unseenMessages[user._id] = messages.length;
             }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages})
     } catch (error) {
          console.log(error.message);
          res.json({success:false, message:error.message})
     }
}

//Get all messages for selected user
export const getMessages= async(req,res)=>{
    try {
        const { id:selectedUserId } = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId}
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId:myId},{seen:true});

        res.json({success:true, messages})
    } catch (error) {
       console.log(error.message);
       res.json({success:false, message:error.message}) 
    }
}


//api to mark message as seen using message id
export const markMessageAsSeen = async(req,res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen:true})
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message}) 
    }
}

//Send message to selected user
export const sendMessage = async(req,res)=>{
    try {
       const {text,image} = req.body;
       const receiverId  = req.params.id;
       const senderId = req.user._id;
        
       if (!text && !image) {
            return res.status(400).json({ success: false, message: "Message cannot be empty" });
        }

       let imageUrl;
       if(image){
         const uploadResponse = await cloudinary.uploader.upload(image)
         imageUrl = uploadResponse.secure_url;
       }

       const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image: imageUrl
       });

       // Emit the new message to the receiver's socket
       const receiverSocketId = userSocketMap[receiverId];
       if(receiverSocketId){
         io.to(receiverSocketId).emit("newMessage", newMessage)
       }

       res.json({success:true , newMessage});

    } catch (error) {
       console.log(error.message);
       res.json({success:false, message:error.message}) 
    }
}



// Delete a message (mark as deleted)
export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized to delete this message" });
        }

        message.isDeleted = true;
        await message.save();

        // Emit delete event to both sender and receiver
        const receiverSocketId = userSocketMap[message.receiverId];
        const senderSocketId = userSocketMap[userId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("message-deleted", { messageId, isDeleted: true });
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("message-deleted", { messageId, isDeleted: true });
        }

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};