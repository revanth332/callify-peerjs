import mongoose from 'mongoose';

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status:{
    type : String,
  },
  peerId:{
    type:String,
  },
  notificationRegistrationToken: {
    type:String,
  },
  contacts :{
    type : Array,
  }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

export default User;