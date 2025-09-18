import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io"
import User from "./models/User.js";


//Create express app and HTTP server
const app = express()
const server = http.createServer(app)

//Initialize socket.io server
export const io=  new Server(server, {
     cors:{origin: "*"}
})

//Store online users
export const userSocketMap = {}; //{userId:socketId}

// Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all conneted client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    // ===== Typing Indicator =====
    socket.on("typing", ({ toUserId }) => {
    const toSocketId = userSocketMap[toUserId];
    if(toSocketId){
        io.to(toSocketId).emit("typing", userId);
    }
    });

    socket.on("updateLastSeen", async (userId) => {
        try {
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
            io.emit("lastSeenUpdate", { userId, lastSeen: new Date() });
        } catch (error) {
            console.error("Error updating last seen:", error);
        }
    });

     socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        if (userId) {
            User.findByIdAndUpdate(userId, { lastSeen: new Date() })
                .then(() => {
                    io.emit("lastSeenUpdate", { userId, lastSeen: new Date() });
                })
                .catch((error) => console.error("Error updating last seen:", error));
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors())

//Route Setup
app.use("/api/status",(req,res)=>res.send("Server is live"))
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);



//Connnect to MONGODB
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,()=>console.log("Server is running on PORT:"+ PORT));
}


export default server;
