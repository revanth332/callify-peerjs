import { Server } from 'socket.io';

let io; // This variable will be scoped to this module

export function initSocket(httpServer) {
    console.log("klkl")
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust for your needs in production
            methods: ["GET", "POST"]
        }
    });

    // You can place general connection logic here if you want
    io.on('connection', (socket) => {
        console.log('A user connected via socket manager:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        socket.on("join-user",(userId) => {
            console.log("user joined now",userId);
            socket.join(userId);
        })
    });
    return io;
}

// Export the io instance so other modules can use it
export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}