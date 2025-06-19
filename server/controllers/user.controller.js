import User from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config.js'
import admin from "../utils/firebaseAdmin.js";
import { getIO } from "../utils/socketManager.js";

//notify status of a paricular user to all its contacts
async function notifyStatusToContacts(userId,status){
    try{
        const io = getIO();
        const {contacts} = await User.findById(userId).populate("contacts");
        // console.log(contacts);
        console.log(io.sockets.adapter.rooms)
        for(let i=0;i<contacts.length;i++){
            console.log(contacts[i]._id.toString(),"sedning status");
            io.to(contacts[i]._id.toString()).emit("user-status",userId,status)
        }
    }
    catch(err){
        console.log("status error",err);
    }
}

export async function updateUserStatus(req,res) {
    try{
      const {userId,status} = req.body;
      const user = await User.findById(userId);
      user.status = status;
      await user.save();
      notifyStatusToContacts(userId,status);
      res.status(200).json({message : "User status updated successfully"});
    }
    catch(err){
      console.log(err);
      res.status(500).json({message : "Filaed to uptatus user status"});
    };
}

export async function login(req, res) {
    try {
        const io = getIO();
        const { name, phone } = req.body;
        // Check if user already exists
        let user = await User.findOne({ name });
        if (!user) {
            // Create new user if not exists
            // user = new User({ username, phone,status : "offline",peerId : "" }); // In production, hash the password!
            // await user.save();
            return res.status(404).json({ message: 'User not found' });
        } else {
            // In production, compare hashed passwords!
            if (user.phone !== phone) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }
        user.peerId = uuidv4();
        user.status = "online";
        notifyStatusToContacts(user._id,"online");
        await user.save();
        return res.status(200).json({message : "Login successfull",user});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal server error"})
    }
}

export async function logout(req, res) {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = "offline";
        user.peerId = "";
        notifyStatusToContacts(user._id,"offline")
        await user.save();
        return res.status(200).json({ message: 'Logout successful' });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal server error"})
    }
}

export async function getPeerId(req,res){
    try{
        const {userId} = req.query;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ peerId: user.peerId });
    }
    catch(err){
        console.log(err);
    }
}

export async function getContacts(req,res){
    try{
        const {userId} = req.query;
        const {contacts} = await User.findById(userId).populate("contacts");
        // const contacts = await User.find({ _id: { $ne: userId } });
        if (!contacts) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ contacts });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message : "Failed to fetch contacts" });
    }
}

export async function setNotificationRegistrationToken(req, res) {
    try {
        const { userId, notificationRegistrationToken } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.notificationRegistrationToken = notificationRegistrationToken;
        await user.save();
        return res.status(200).json({ message: 'Notification registration token set successfully' });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "Internal server error"})
    }
}

export async function requestUserConnection(req,res){
    try{
        const {userId} = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const message = {
            notification: {
            title: 'New Connection Request',
            body: `${user.name} has requested to connect with you.`,
            },
            data: {
                url : process.env.CLIENT_ORIGIN
            },
            // link:process.env.CLIENT_ORIGIN,
            token: user.notificationRegistrationToken,
        };
        const response = await admin.messaging().send(message);
        return res.status(200).json({ success: true, messageId: response.messageId });   
    }
    catch(err){
        console.log(err);
        return res.status(200).json({success : false ,message : "Filed to notify user"})
    }
}

export async function changeUserStatus(req,res){
    try{
        const {userId,status} = req.body;
        const user = await User.findOne({_id:userId});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = status
        await user.save();
        return res.status(200).json({ message: 'Status changed successfully to '+status });
    }
    catch(err){
        console.log(err);
    }
}