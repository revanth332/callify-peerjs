import connectDB from "./utils/dbConnection.js";
import express, { urlencoded } from "express";
import userRouter from './routers/user.routes.js'
import cors from "cors";

const app = express();
const port = 8001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(urlencoded({ extended: false }));

app.use('/api', userRouter);

app.listen(port,() => {
    console.log("server listening at port "+port)
})