const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    post:String,
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    date:{
        type:String,
        default:Date.now()
    },
    caption : String,
    likes:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    ],
    imageUrl:String ,
    comments :[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
      }
    ]
})


module.exports = mongoose.model('post' , postSchema);