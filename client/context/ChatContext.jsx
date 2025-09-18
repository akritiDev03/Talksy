import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from 'axios'
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [lastSeen, setLastSeen] = useState(null); 
  const [typingUsers, setTypingUsers] = useState({}); // { userId: true }
  const typingTimeouts = useRef({});

  const { socket, axios, authUser } = useContext(AuthContext);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    axios.defaults.baseURL = backendUrl;


    const getUsers = async()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
             toast.error(error.message)
        }
    }

// function to get messages for selected user
 const getMessages =  async(userId) =>{
    try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        if(data.success){
            setMessages(data.messages)
        }
    } catch (error) {
        toast.error(error.message)
    }
 }

  // Function to get last seen for selected user
const getLastSeen = async (userId) => {
        try {
            const { data } = await axios.get(`/api/auth/${userId}/lastseen`);
            if (data.success) {
                setLastSeen(data.lastSeen);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

 //function to send message to selected user

 const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                // Update last seen after sending a message
                socket.emit("updateLastSeen", authUser._id);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    //  Delete message
    const deleteMessage = async (messageId) => {
        try {
            const { data } = await axios.delete(`/api/messages/${messageId}`);
            if (data.success) {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === messageId ? { ...msg, isDeleted: true } : msg
                    )
                );
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


 //function to subscibe to messages for selected user
 const subscribeToMessages = async()=>{
    if(!socket) return;

    socket.on("newMessage",(newMessage)=>{
        if(selectedUser && newMessage.senderId === selectedUser._id){
            newMessage.seen = true;
            setMessages((prevMessages)=>[...prevMessages, newMessage]);
            axios.put(`/api/messages/mark/${newMessage._id}`);

        }else{
            setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1: 1
            }))
        }
    })

        socket.on("typing", ( userId ) => {
          setTypingUsers(prev => ({ ...prev, [userId]: true }));

          // Clear previous timeout if exists
          if(typingTimeouts.current[userId]){ 
            clearTimeout(typingTimeouts.current[userId]);
          }

          // Remove typing indicator after 2 seconds
          typingTimeouts.current[userId] = setTimeout(() => {
                setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[userId];
                    return newState;
                });
            }, 2000);
      })


      socket.on("lastSeenUpdate", (data) => {
            if (selectedUser && data.userId === selectedUser._id) {
                setLastSeen(data.lastSeen);
            }
        });


        socket.on("message-deleted", ({ messageId, isDeleted }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === messageId ? { ...msg, isDeleted } : msg
                )
            );
            toast.success("Message deleted");
        });

 } 


 //function to unsubscribe from messages
 const unsubscribeFromMessages = () => {
        if (socket) {
            socket.off("newMessage");
            socket.off("typing");
            socket.off("lastSeenUpdate");
            socket.off("message-deleted");
        }
    };


 const emitTyping = (userId) => {
        if(socket && selectedUser) {
            socket.emit("typing", { toUserId: userId });
        }
    };



useEffect(() => {
        if (selectedUser && authUser) {
            getMessages(selectedUser._id);
            getLastSeen(selectedUser._id); // Fetch last seen when user is selected
            // Emit last seen update for the current user
            socket?.emit("updateLastSeen", authUser._id);
        }
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser, authUser]);


    const value = {
       messages,
       users,
       selectedUser,
       getUsers,
       getMessages,
       sendMessage,
       setSelectedUser,
       unseenMessages,
       setUnseenMessages,
       typingUsers,
       emitTyping,
       lastSeen,
       deleteMessage
    }


     return (
     <ChatContext.Provider value={value}>
         {children}
     </ChatContext.Provider>
     )
}