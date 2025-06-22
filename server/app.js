import connectDB from "./utils/dbConnection.js";
import express, { urlencoded } from "express";
import cors from "cors";
import http from 'http';
import { initSocket } from './utils/socketManager.js';
import userRouter from './routers/user.routes.js'

const app = express();
const port = 8000;
const httpServer = http.createServer(app);
initSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ extended: false }));

app.use("/api", userRouter);

// app.listen(port, () => {
//   console.log("server listening at port " + port);
// });

httpServer.listen(port,() => {
    console.log("server listening at port "+port)
})