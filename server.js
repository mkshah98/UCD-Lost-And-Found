// We need many modules

// some of the ones we have used before
const express = require('express');
const bodyParser = require('body-parser');
const assets = require('./assets');
const sql = require("sqlite3").verbose();
const path = require('path')
//const sqlite3 = require('sqlite3');  // we'll need this later
const request = require('request');
const fs = require('fs');
const FormData = require("form-data");

// and some new ones related to doing the login process
const passport = require('passport');
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

//<--------------------------------------------------------->

//DATABASE CREATION

const lostFoundDB = new sql.Database("lostfound.db");

let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='LostFoundTable' ";
lostFoundDB.get(cmd, function (err, val, next) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        console.log("ALERT!!!")
        createLostFoundDB();
    } else {
        console.log("Database file found");   
    }
});

function createLostFoundDB()
{
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE LostFoundTable (rowId TEXT PRIMARY KEY, lostorfound TEXT, title TEXT, category TEXT, description TEXT, imageurl TEXT, date TEXT, time TEXT, location TEXT)';
  lostFoundDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}



//<----------------------------------------------------------->
//GOOGLE LOGIN

// Setup passport, passing it information about what we want to do
passport.use(new GoogleStrategy(
  // object containing data to be sent to Google to kick off the login process
  // the process.env values come from the key.env file of your app
  // They won't be found unless you have put in a client ID and secret for 
  // the project you set up at Googlere
  {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // CHANGE THE FOLLOWING LINE TO USE THE NAME OF YOUR APP
  callbackURL: 'https://tartan-bow-radiator.glitch.me/auth/accepted',  
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // where to go for info
  scope: ['profile', 'email']// the information we will ask for from Google
},
  // function to call to once login is accomplished, to get info about user from Google;
  // it is defined down below.
  gotProfile));

//<------------------------------------------------------------------------------>
//GET AND POST REQUESTS

// Start setting up the Server pipeline
const app = express();
console.log("setting up pipeline")


// Multer is a module to read and handle FormData objects, on the server side
const multer = require('multer');

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// Use that storage object we just made to make a multer object that knows how to 
// parse FormData objects and store the files they contain
let uploadMulter = multer({storage: storage});

// First, server any static file requests
app.use(express.static('public'));

// Next, serve any images out of the /images directory
app.use("/images",express.static('images'));

// Next, serve images out of /assets (we don't need this, but we might in the future)
app.use("/assets", assets);

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session, 
// and deletes cookies when they expire
app.use(expressSession(
  { 
    secret:'bananaBread',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session()); 



// The usual pipeline stages

// Public files are still serverd as usual out of /public
app.get('/*',express.static('public'));

// special case for base URL, goes to index.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html/');
});

// Glitch assests directory 
app.use("/assets", assets);

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out 
// of /user using a static server. 
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get('/user/*', requireUser, requireLogin, express.static('.'));




// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get('/auth/google', passport.authenticate('google'));
// The first time its called, passport.authenticate sends 302 
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen. 


// Google redirects here after user successfully logs in. 
// This second call to "passport.authenticate" will issue Server's own HTTPS 
// request to Google to access the user's profile information with the  	
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in 
// a user database table. 
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the 
// /setcookie endpoint, below
// or, if failure, it goes back to the public splash page. 
// NOTE:  Apparently, this ends up at the failureRedirect if we
// do the revoke in gotProfile.  So, if you want to redirect somewhere
// else for a non-UCDavis ID, do it there. 
app.get('/auth/accepted', 
  passport.authenticate('google', 
    { successRedirect: '/setcookie', failureRedirect: '/?cause=loginFailed'}
  )
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// the second one makes a public cookie called
// google-passport-example
app.get('/setcookie', requireUser,
  function(req, res) {
    // if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
      // mark the birth of this cookie
  
      // set a public cookie; the session cookie was already set by Passport
      res.cookie('google-passport-example', new Date());
      res.redirect('/user/screen2.html');
    //} else {
    //   res.redirect('/');
    //}
  }
);


// currently not used
// using this route, we can clear the cookie and close the session
app.get('/user/logoff',
  function(req, res) {
    // clear both the public and the named session cookie
    res.clearCookie('google-passport-example');
    res.clearCookie('ecs162-session-cookie');
    res.redirect('/');
  }
);

//<----------------------------------------------------------------------------------->

//POST REQUEST FOR INSERTING INTO THE DATABASE

app.post('/SubmitData', express.json({type: '*/*'}), (req, res,next) => {
    
  // file system module to perform file operations
  
  console.log('HELLLLLLLOOOO');
  // stringify JSON Object
  var jsonContent = req.body;
  
  //"INSERT INTO ShopTable ( listItem, listAmount) VALUES (?,?) ";
  //const cmd = 'CREATE TABLE LostFoundTable (rowId TEXT PRIMARY KEY, lostorfound TEXT, title TEXT, category TEXT, description TEXT, imageurl TEXT, date TEXT, time TEXT, location TEXT)';
  //var myObj = {rowId : r.trim(), lostorfound:"found", title:sessionStorage.getItem("title") , category:sessionStorage.getItem("category"), description: sessionStorage.getItem("description"), imageurl: '/testImage.jpg', date: "today", time: "now", location:"dubai"};
  var inscmd = "INSERT INTO LostFoundTable (rowId, lostorfound, title, category, description, imageurl, date, time, location) VALUES (?,?,?,?,?,?,?,?,?)";
  lostFoundDB.run(inscmd, jsonContent.rowId.trim() , jsonContent.lostorfound, jsonContent.title,jsonContent.category, jsonContent.description, jsonContent.imageurl, jsonContent.date, jsonContent.time, jsonContent.location, function(err) {
    if (err) {
      console.log("DB insert error",err.message);
      next();
    } else {
      //let newId = this.lastID; // the rowid of last inserted item
      console.log("DB insert Successful");
      //alert(jsonContent);
      //console.log(resp);
      res.send(jsonContent.rowId);
    }
  }); // callback, shopDB.run // callback, app.post
  
});


//<-------------------------------------------------------------->
//code to upload to ecs162.org


app.post('/upload', uploadMulter.single('newImage'), function (request, response) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up 
  // when you look at the /images directory when browsing your project
  // until later (or unless you open the console (Tools->Terminal) and type "refresh").  
  // So sorry. 
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  // the file object "request.file" is truthy if the file exists
  if(request.file) {
    // Always send HTTP response back to the browser.  In this case it's just a quick note. 
    response.end("Server recieved "+request.file.originalname);
  }
  else throw 'error';
})

// fire off the file upload if we get this "post"
app.post("/sendUploadToAPI", uploadMulter.single('newImage'),function(request, response){
  
  console.log(request.file); 
  console.log("Recieved",request.file.originalname,request.file.size,"bytes");
  sendMediaStore("/images/"+ request.file.originalname, request, response);
        
});


// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            console.log(body); 
            serverResponse.send(body);
            console.log("received");
            fs.unlink("images/"+ serverRequest.file.originalname); 
          }
        });
      } else { // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}
//<----------------------------------------------------------------------------------------------------------------------->

// send the output.json to the webpage for GET request with URL /getJSON
app.post("/SubmitSearchResults", express.json({type: '*/*'}), function (request, response, next){
  var jsonContent = request.body;
  var type;
  if(jsonContent.type == "found")
    {
      type = "lost";
    }
  else
    {
      type = "found";
    }
  //const cmd = 'CREATE TABLE LostFoundTable (rowId TEXT PRIMARY KEY, lostorfound TEXT, title TEXT, category TEXT, description TEXT, imageurl TEXT, date TEXT, time TEXT, location TEXT)';
  
  let cmd = "SELECT * FROM LostFoundTable WHERE (date BETWEEN "+"'"+ jsonContent.FromDate+"' AND '" + jsonContent.ToDate + "') AND ( time BETWEEN "+"'"+ jsonContent.FromTime+"' AND '" + jsonContent.ToTime + "') AND " + "( category = '"  + jsonContent.SearchCategory +"') AND ( location = '" + jsonContent.SearchLocation + "') AND ( lostorfound = '" + type + "')";
  //let cmd = "SELECT * FROM LostFoundTable WHERE ( location = '" + jsonContent.SearchLocation + "') AND ( lostorfound = '" + type + "')";
  
  console.log(cmd); 
  lostFoundDB.all(cmd, function (err, rows) {
    if (err) {
      console.log("Database reading error", err.message);
      next();
    } else {
      // send postcard to browser in HTTP response body as JSON
      console.log(rows);
      response.json(rows);
    }
  })
  
});

//<----------------------------------------------------------------------------------------------------------------------------->



// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


// Some functions called by the handlers in the pipeline above


// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back. 
function printIncomingRequest (req, res, next) {
    //console.log("Serving",req.url);
    if (req.cookies) {
      //console.log("cookies",req.cookies)
    }
    next();
}

// function that handles response from Google containint the profiles information. 
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, email, done) {
    //console.log("Google profile",profile);
    //console.log("Google email", email.emails[0].value);
    
    // here is a good place to check if user is in DB,
    // and to store him in DB if not already there. 
    // Second arg to "done" will be passed into serializeUser,
    // should be key to get user out of database.
    const regex = /@ucdavis.edu/g; 
    const found = email.emails[0].value.match(regex);
    //console.log(found);

    
    let dbRowID = 1;
    if(found == null){
      dbRowID = -1;
      request.get('https://accounts.google.com/o/oauth2/revoke', {
        qs:{token: accessToken }},  function (err, res, body) {
        //console.log("revoked token");
      }) 
    }
  // temporary! Should be the real unique
    // key for db Row for this user in DB table.
    // Note: cannot be zero, has to be something that evaluates to
    // True.  
    
    done(null, dbRowID); 
}


// Part of Server's sesssion set-up.  
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie. 
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
    //console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time, 
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
    //console.log("deserializeUser. Input is:", dbRowID);
    // here is a good place to look up user data in database using
    // dbRowID. Put whatever you want into an object. It ends up
    // as the property "user" of the "req" object. 
    let userData = {userData: dbRowID};
    done(null, userData);
});

function requireUser (req, res, next) {
  console.log("require user",req.user)
  if (!req.user || req.user.userData< 0) {
    //console.log("HELLLLOOOOOOOO");
    res.redirect('/?email=notUCD');
  } else {
    //console.log("user is",req.user);
    next();
  }
};

function requireLogin (req, res, next) {
  //console.log("checking:",req.cookies);
  if (!req.cookies['ecs162-session-cookie']) {
    res.redirect('/');
  } else {
    next();
  }
};

//maps

app.get("/getAddress", (req,res)=>{
  let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.query.lat + "," + req.query.lng + "&key=" 
  + process.env.API_KEY2;
  request(url, {json:true}, (error, response, body) => {
    if (error) {return console.log(error);}
    res.json(body);
  });
})

app.get("/searchAddress", (req, res) => {
  var url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" + req.query.input 
  + "&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&locationbias=circle:100000@38.537,-121.754&key="
  +process.env.API_KEY2;
  request(url, {json: true}, (error, response, body) =>{
    if (error) {return console.log(error);}
    console.log(body)
    res.json(body);
  });
})

