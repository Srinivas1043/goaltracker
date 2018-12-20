//Requiring the dependecies
var express = require('express');
var bodyParser =  require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var cors = require('cors');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var router = express.Router();
var app = express();
//end of the code

//Secret code
var secret = 'justabsolutesstuff';
app.set('superSecret',secret);
//end of secret code

//port to be accessed
var port = process.env.PORT ||3000;
//end of the code

//using the dependencies
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cors());
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT,GET , POST');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
//end of code



// mongodbconfig
var mongourl = "mongodb+srv://adminsrinivas:padma123@absolutes-hnf2v.mongodb.net/goal_tracker?retryWrites=true";
var connect = mongoose.connect(mongourl,{ useNewUrlParser: true });
var dbconnection = mongoose.connection;
dbconnection.on('error',err => debug('MongoDB connection error: ${err}'));
//end of code


//Schema creation

  //UserRegistration Schema
var userRegistration = mongoose.Schema({
  FullName:String,
  EmailId:String,
  Password:String,
  ContactNumber:String,
  SkillSet:Array,
  Interests:Array,
  AboutYou:String,
  User:Boolean
});

var UserRegistration = mongoose.model("UserRegistration",userRegistration);
//End of UserRegistration Schema

//Goal_track Schemas
var goalTrack = mongoose.Schema({
    Category:String,
  GoalTitle:String,
  GoalDescription:String,
  TargetDays:Number,
  GoalTasks:[]
 })

var GoalTrack = mongoose.model("GoalTrack",goalTrack);

//End of Goal Tracker Schema




//Inserting UserRegistration

router.post('/user_registration',function(req,res) {
  var newuser = new UserRegistration({
FullName:req.body.FullName,
EmailId:req.body.EmailId,
Password:req.body.Password,
ContactNumber:req.body.ContactNumber,
SkillSet:req.body.SkillSet,
Interests:req.body.Interests,
AboutYou:req.body.AboutYou,

  });

  newuser.save(function(err, UserRegistration){
    if(err)
      console.log(err);
    else {
      console.log("Added");
    }

  });

});

app.use('/api',router);
//End of UserRegistration Insertion code

//Goal Register
router.post('/add_goal',function(req,res){
var newgoal =new GoalTrack({
  Category:req.body.Category,
  GoalTitle:req.body.GoalTitle,
  GoalDescription:req.body.GoalDescription,
  TargetDays:req.body.TargetDays,
  GoalTasks:[req.body.GoalTasks]
});

newgoal.save(function(err, GoalTrack){
if(err)
{
  console.log(err)
}
else
{
  console.log(res.json());
}
});
});

app.use('/api',router);

//End of goal register code


//route to authenticate a user
//Find the User
router.post('/authenticate',function(req,res){
  UserRegistration.findOne({
    EmailId:req.body.EmailId
  }, function( err,user) {
    if(err) throw err

    if(!user) {
      res.json({success:false,message:"Authentication failed.User not found"});
    }
    else if(user) {
      if(user.Password!=req.body.Password) {
        console.log(user.EmailId);
        console.log(user.Password,req.body.Password);
        res.json({success:false,message:"Authentication failed.Password is Incorrect"});
      }
      else{

        const payload = { _id: user.id };

        var token = jwt.sign(payload, app.get('superSecret'));


        res.json({
          id:payload,
          success:true,
          message: "Enjoy your token",
          token:token
        });
      }
    }
  });

});


router.use(function(req,res,next) {
  var token =  req.body.token || req.query.token || req.headers['x-access-token'];
  if(token)
  {
    jwt.verify(token, app.get('superSecret'), function(err, decoded){

      if(err)
      {
        return res.json({success:false,message:"Failed to authenticate token"});
      }
      else
      {
        req.decoded = decoded;
        next();
      }

    });
  } else {

    return res.status(403).send({
        success:false,
        message:'No token provided.'
     });
  }
});

app.use('/api',router);


//End of Code



app.listen(3000);
