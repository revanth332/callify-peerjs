import mongoose,{ Schema }  from 'mongoose';

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
  contacts: [{
        type: Schema.Types.ObjectId,
        ref: 'User' // This tells Mongoose the IDs in this array refer to documents in the 'User' collection.
    }],
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

export default User;