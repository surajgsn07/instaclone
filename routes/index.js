var express = require('express');
const passport = require('passport');
var router = express.Router();
const localStrategy = require('passport-local');
const userModel = require('./users');
const commentModel = require("./comment");
const upload = require("./multer");
const postModel = require("./post");
passport.use(new localStrategy(userModel.authenticate()));
const fs  = require('fs/promises');
const path = require('path');


router.post('/register' , function(req,res){
  let userData = new userModel({
    username : req.body.username , 
    email : req.body.email ,
    name : req.body.name 
  });
  userModel.register(userData , req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
    })
  })
})

router.post("/update" , upload.single("profilepicture") ,  async function(req,res){
  const user = await userModel.findOneAndUpdate(
    {username:req.session.passport.user} ,
    {
      username : req.body.username,
      name:req.body.name,
      bio:req.body.bio
    } , 
    {new:true});
    if(req.file){
      user.profilepicture = req.file.filename;
    }
    await user.save();
    res.redirect("/profile");
  });

router.post('/login' , passport.authenticate("local" , {
  successRedirect:"/profile",
  failureRedirect:"/"
})  , function(req,res){})

router.get('/logout'  , function(req,res ,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  })
})

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const posts = await postModel.find({}).populate("user");
  res.render('feed', {footer: true , posts , user});
});

router.get('/post/click/:id', isLoggedIn,async function(req, res) {
  const user1 = await userModel.findOne({username : req.session.passport.user});
  const post = await postModel
  .findOne({ _id: req.params.id })
  .populate("user")
  .populate({
    path: "comments",
    populate: {
      path: "author",
    },
  });

  const comments = post;
  console.log(comments)

  // console.log(post)
  res.render('post', {footer: true , post , user1 , comments});
});



router.get('/post/delete/:id', async function(req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    
    // Find the post by ID and populate the 'deletedPost' variable
    const deletedPost = await postModel.findById(req.params.id);

    if (!deletedPost) {
      // Handle the case where the post is not found
      return res.status(404).send('Post not found');
    }

    const imagePath = path.join(__dirname, '..', 'public', 'images', 'uploads', String(deletedPost.imageUrl));

    // Use fs.promises.unlink for async file deletion
    await fs.unlink(imagePath);

    // Remove the post ID from the user's posts array
    user.posts.pull(deletedPost._id);

    // Save the user to persist the changes
    await user.save();

    // Delete the post from the database
    await postModel.findByIdAndDelete(req.params.id);

    res.redirect("/feed");
  } catch (e) {
    console.error('Error deleting post:', e);
    res.redirect("/profile");
  }
});


router.get('/like/post/:id', async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});

  if(post.likes.indexOf(user._id) == -1 ){
    post.likes.push(user._id);
  }else{
    post.likes.splice(post.likes.indexOf(user._id) , 1);
  }

  await post.save();
  res.redirect("/feed");
});

router.post('/comment/:id', async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});


  const comment = await  commentModel.create({
    author:user._id,
    content:req.body.comment,
  });

  post.comments.push(comment._id);

  await post.save();
  res.redirect(`/post/click/${req.params.id}`);
});


router.get('/profile', isLoggedIn ,async function(req, res) {
  try {
    const userdata = await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts');
    if (!userdata) {
      return res.status(404).send('User not found');
    }
    res.render('profile', { footer: true, userdata });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/search', isLoggedIn,function(req, res) {
  res.render('search', {footer: true});
});

router.get('/username/:username', async function(req, res) {
  const regex = new RegExp(req.params.username, 'i');
  const userdata = await userModel.find({username : regex});
  res.json(userdata);
});

router.get('/edit', isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});

  res.render('edit', {footer: true , user});
});

router.get('/upload', isLoggedIn,function(req, res) {
  res.render('upload', {footer: true});
});

router.post('/upload', upload.single("image") ,async function(req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.create({
    user:user._id,
    caption:req.body.caption,
    post : req.file.filename,
    imageUrl:req.file.filename
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

module.exports = router;
