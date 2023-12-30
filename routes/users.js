const mongoose = require('mongoose');
const plm  = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/instaclone");

const userSchema = mongoose.Schema({
  username :String , 
  password:String ,
  name:String , 
  email :String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    }
  ],
  profilepicture :String ,
  bio:String ,
  followers:[
    {
      
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ] ,
  following:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  story:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'story'
    }
  ]
})

userSchema.plugin(plm);
module.exports = mongoose.model('user' , userSchema);