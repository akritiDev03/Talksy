import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime , formatMessageText, formatLastSeen} from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'


const ChatContainer = () => {

  const {
    messages, 
    selectedUser,setSelectedUser,
    sendMessage, getMessages, 
    typingUsers, emitTyping,
    lastSeen,
    deleteMessage
  } = useContext(ChatContext);

  const { authUser, onlineUsers }= useContext(AuthContext)

  const [input, setInput] = useState('');
  const [activeMessageId, setActiveMessageId] = useState(null);
  const longPressTimer = useRef(null);
  const scrollEnd=useRef()



  const handleSendMessage = async(e)=>{
       e.preventDefault();
       if(input.trim() === "") return null;
       await sendMessage({text: input.trim()});
       setInput("")
  }


 //Hande sending an image
 const handleSendImage = async(e) =>{
  const file = e.target.files[0];
  if(!file || !file.type.startsWith("image/")){
    toast.error("Select an image file")
    return;
  }
  const reader = new FileReader();
  reader.onloadend = async ()=>{
    await sendMessage({image : reader.result})
    e.target.value = ""
  }
  reader.readAsDataURL(file)
 }

 const toggleDeleteOption = (messageId, e) => {
        e.stopPropagation(); // Prevent container click
        setActiveMessageId(activeMessageId === messageId ? null : messageId);
    };

    // Add this function to handle message clicks
const handleMessageClick = (msg, e) => {
  if (msg.senderId === authUser._id) {
    toggleDeleteOption(msg._id, e);
  }
};

    // Handle long press for small screens
    const handleTouchStart = (messageId,e) => {
        e.stopPropagation();
        longPressTimer.current = setTimeout(() => {
            toggleDeleteOption(messageId, e);
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = (e) => {
        e.stopPropagation();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };


    const handleContainerClick = (e) => {
    // Don't hide if clicking delete button
    if (e.target.tagName.toLowerCase() === 'button') {
        return;
    }
    // Hide active delete option
    setActiveMessageId(null);
};


useEffect(() => {
  if (selectedUser) {
    getMessages(selectedUser._id)
  }
}, [selectedUser])

  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior : "smooth"})
    }
  },[messages])


  return selectedUser ? (
    <div className ='h-full overflow-scroll relative backdrop-blur-lg'
    onClick={handleContainerClick}
        onTouchStart={() => {
            if (activeMessageId) {
                setActiveMessageId(null);
            }
        }}
    >
      {/*-------Header------- */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-300'>
            <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-14 h-14 rounded-full' />
            <p className='flex-1 text-lg text-white flex items-center gap-2'>
             {selectedUser.fullName}
             {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
             )}
            </p>
            <p className="text-sm text-gray-400">Last seen: {formatLastSeen(lastSeen)}</p>
            <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
            <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>

      {/* Chat Area */}
      <div className='flex flex-col h-[calc(100%-140px)] overflow-y-scroll p-3 pb-6'>
        {
          messages.map((msg,index)=>(
            <div 
            key={index} 
            className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id  && 'flex-row-reverse'} relative`}
             onClick={(e) => window.innerWidth >= 768 && handleMessageClick(msg, e)}
             onTouchStart={(e) => window.innerWidth < 768 && msg.senderId === authUser._id && handleTouchStart(msg._id, e)}
             onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'manipulation' }}
            >
            {msg.isDeleted ? (
                <div className="relative">
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words whitespace-normal bg-slate-900/60 text-gray-400 italic ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                      }`}
                  >
                    This message is deleted by sender
                  </p>
                </div>
              ) :
                msg.image ? (
                  <div className="relative">
                    <img
                      className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                      src={msg.image}
                      alt=""
                    />
                    {msg.senderId === authUser._id && (
                      <div
                        className={`absolute top-2 right-2 bg-gray-800 text-white text-xs rounded-md p-2 z-10 ${activeMessageId === msg._id ? 'block' : 'hidden'
                          }`}
                      >
                        <button onClick={(e) =>{e.stopPropagation();deleteMessage(msg._id)}}>Delete</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <p
                      className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words whitespace-normal bg-slate-900/60 text-white ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                        }`}
                    >
                      {/\b((https?:\/\/)?(www\.)?[\w-]+\.[\w.-]+(\S*)?)/gi.test(msg.text) ? (
                        <span
                          className="break-words"
                          dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                        ></span>
                      ) : (
                        msg.text
                      )}
                    </p>
                    {msg.senderId === authUser._id && (
                      <div
                        className={`absolute top-2 right-2 bg-gray-800 text-white text-xs rounded-md p-2 z-10 ${activeMessageId === msg._id ? 'block' : 'hidden' }`}
                      >
                        <button onClick={(e) => {e.stopPropagation();deleteMessage(msg._id)}}>Delete</button>
                      </div>
                    )}
                  </div>
                )}


             <div className='text-center text-xs'>
              <img src={msg.senderId ===  authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon }  className='w-7 h-7 rounded-full' alt="" />
              <p className='text-gray-300'>{ formatMessageTime(msg.createdAt)}</p>
             </div> 
            </div> 
          ))
        }

        {/* Typing Indicator */}
        {typingUsers[selectedUser?._id] && (
          <p className="text-sm text-gray-400 ml-2 mb-2"> Typing...</p>
        )}
        <div ref={scrollEnd}></div>
      </div>

       {/* Bottom Area  */}
       <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e)=> {setInput(e.target.value); emitTyping(selectedUser._id);}} 
          value={input} 
          onKeyDown={(e)=>e.key === "Enter" ? handleSendMessage(e) : null} 
          className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400' type="text" placeholder='Send a message' />

          <input onChange={handleSendImage} type="file" id="image" accept='image/png, image/jpeg' hidden/>

          <label htmlFor="image">
            <img src={assets.gallery_icon} className='w-5 mr-2 cursor-pointer' />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
       </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img className='max-w-16' src={assets.logo_icon} alt="" />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
