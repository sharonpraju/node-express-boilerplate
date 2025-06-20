
const socketIo = require("socket.io");
const chat_rooms = require('../../db/models/chat_rooms');
const chat_messages = require('../../db/models/chat_messages');
const mongoose = require('mongoose');


exports.connectSocket = function (server) {
    try {
        
        const io = socketIo(server, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"],
              allowedHeaders: ["*"],
              credentials: true
            }
          });

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            // Join a chat room
            socket.on("joinRoom", ({ roomId, userId }) => {
                socket.join(roomId);
                console.log(`User ${userId} joined room ${roomId}`);
            });

            // Send message to a chat room
            socket.on("sendMessage", async ({ roomId, senderId, message, attachment }) => {

                //checking if room exists and sender is a participant
                let room = await chat_rooms.findOne({ $and: [{ _id: roomId }, { participants: { $in: [new mongoose.Types.ObjectId(senderId)] } }, { deleted: { $ne: true } }] });
                if (room) {

                    //saving message to database
                    let message_data = {
                        room: roomId,
                        source: senderId,
                        message: message,
                        attachment: attachment
                    };
                    let data = await chat_messages.create(message_data);

                    //updating last active time and last message of room
                    await chat_rooms.updateOne({ _id: roomId }, { last_active: Date.now(), last_message: data._id });

                    // Broadcast message to everyone in the room
                    io.to(roomId).emit("receiveMessage", data);
                }
                else {
                    //do nothing
                    return;
                }
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });
    } catch (error) {
        console.log(error);
    }
};