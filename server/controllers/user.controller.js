import User from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config.js'
import admin from "../utils/firebaseAdmin.js";

export async function login(req, res) {
    try {
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
        const user = await User.findById(userId);
        const contacts = await User.find({ _id: { $ne: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ contacts });
    }
    catch(err){
        console.log(err);
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
        // const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return res.status(401).json({ message: 'Unauthorized' });
        // }
        // const idToken = authHeader.split(' ')[1];
        // admin.auth().verifyIdToken(idToken)
        // .then((decodedToken) => {
        //     req.user = decodedToken;
        //     next();
        // })
        // .catch((error) => {
        //     console.error('Error verifying Firebase ID token:', error);
        //     return res.status(401).json({ message: 'Unauthorized' });
        // });
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
        return res.status(500).json({message : "Internal server error"})
    }
}