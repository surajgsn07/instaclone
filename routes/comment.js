// comment.js

const mongoose = require('mongoose');

// Define the comment schema
const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment'
    }
  ],
  likes:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ]
});

// Create the Comment model
module.exports = mongoose.model('comment', commentSchema);

