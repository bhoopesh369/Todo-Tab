const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const cookieParser = require("cookie-parser");

const date = require(__dirname + "/models/date.js"); 
let day = date();

const app = express();


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "Lmao ded",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


mongoose.connect("mongodb://localhost:27017/hackathonDB", {useNewUrlParser: true});


const User = require('./models/user');
const Timetable = require('./models/timetable');


const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome"
});

const item2 = new Item({
    name: "Task"
});

const item3 = new Item({
    name: "CSPC31 - 10:20"
});
const item4 = new Item({
    name: "CSPC33 - 11:30"
});


const defaultItems = [item1,item2];
const defaultTimeTable = [item3,item4];

const listSchema = {
    name: String,
    items: [itemsSchema],
    items1: [itemsSchema]
};

const List = mongoose.model("List",listSchema);




passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
});


app.route("/dashboard")
    .get((req,res) => {

        const context = req.cookies.context;

        if(List.findOne({name: context}, function(err,foundList){
            if(!err){
                if(!foundList){
                    const list = new List({
                        name: context,
                        items: defaultItems,
                        items1: defaultTimeTable
                    });
                    list.save();
                    res.redirect("/dashboard");
                }
                else{
                    console.log(day);
                    res.render("dashboard",{kindDay: day, newListItem: foundList.items, newListItem1: foundList.items1});
                }
    
            }
        }));

        // res.render("dashboard" , {newListItem: null, kindDay: null});
    })

    .post();

//--------------------------------------------Todos---------------------------------------------------------------

app.route("/todo")
    .post((req,res) => {
        const itemName = req.body.newItem;
        const context = req.cookies.context;
        
    
        const item = new Item({
            name: itemName
        });
    
    
            List.findOne({name: context}, function(err,foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/dashboard");
            });

    }); 


//--------------------------------------------Register----------------------------------------------------------------

app.route("/register")
    .get((req,res) => {
        res.render("register" , {already: null});
    })

    .post(async (req,res) => {

        const exists = await User.findOne({username: req.body.username});

        if(exists){
            res.render("register", {already: "Userame already exists"});
        }
        else{

            User.register({username: req.body.username, email: req.body.email}, req.body.password, function(err, user){
                if(err){
                   console.log(err);
                   res.redirect("/register"); 
                }
                else{
                    passport.authenticate("local")(req,res, function(){
                        // activeUser = req.body.username;
                        console.log("Success");
                        res.clearCookie("context", { secure: true });
                        res.cookie("context", req.body.username, {secure: true });
                        res.redirect("/dashboard");
                    });
                }
            });

        
        }
        
    });

//------------------------------------------Delete------------------------------------------------------------------

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const context = req.cookies.context;

        List.findOneAndUpdate({name: context},{$pull: {items:{_id: checkedItemId}}},function(err){
            if(!err){
                res.redirect("/dashboard");
            }
        });
});

//------------------------------------------Login----------------------------------------------------------------

app.route("/login")
    .get((req,res) => {
       res.render("login");
    })

    .post(function(req,res){
            
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
    
        req.login(user, function(err){
            if(err){
              console.log(err);  
            }
            else{
                passport.authenticate("local")(req,res, function(){
            
                    res.clearCookie("context", { secure: true });
                    res.cookie("context", req.body.username, { secure: true });
                    res.redirect("/dashboard");
    
                });
            }
        });
    
    });
  

let port = process.env.PORT;

if (port==null || port==""){
    port=3000;
}

app.listen(port, function(){
    console.log("Server started successfully");
});
