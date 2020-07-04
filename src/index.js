const express = require("express");
// in order to connect to the database we just to do!
require("./db/mongoose");
// Importing Routes:
const userRoutes = require("./routes/userRoute");
const taskRoutes = require("./routes/taskRoute");
const Task = require("./models/task");
const User =  require("./models/user");
const app = express();

// let port;
// if (!process.env.PORT) {
//     port = 3000;
// } else {
//     port = process.env.PORT;
// }
const port = process.env.PORT;
// ============================== EXPRESS MIDDLE-WARE FOR ALL ROUTES ============================
// This is used to automatically get JSON data and all you need to do is req.body XD
app.use(express.json()); 
app.use(userRoutes);
app.use(taskRoutes);
app.listen(port, () => {
    console.log("Server listening on " + port);
});

// File uploads::
// importing the multer module:
const multer = require("multer");
// now in a bare bones you make a multer obj which handle the file shit
// the first thing is that you put an obj where you put a prop dest where the value is the place 
// to store your bitch ass file
upload = multer({
    // ======================== HOW TO STORE IN THE USER MODEL =========================
    // now when we don't give a location it'll put the file in req.file
    // as this is binary file we can access it through the .buffer prop the file obj!!!!
    // dest: "images",
    // to limit shit:
    limits: {
        // in bytes
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        console.log("DOES IT COME HERE")
        // you could do this but you can also write a regular expression or use the endswith method to 
        // manually write the extensions!!!
        if(file.mimetype === "image/jpeg"){
            console.log("OK!");
            cb(undefined, true);
        }else{
            console.log("REJECTED");
            cb(new Error("Must be JPG image"));
        }
        
    }   
});

// in order to execute for SINGLE file we use the method single that takes the name of the file
// remember to name this (name of file) and the one you put in the form data to be the same!!
// since this is middle ware it will be the second opt!
// ======== ERROR HANDLING ===========================================
// okay now express and the router handles these functions as callback middle ware
// now specifec middle unique from their params mean something like req and res means the route handler
// call back
// the other is the error handler callback where if any errors occur in the other middleware this 
// will run
// it has params error, req, res, next 
app.post("/uploads", upload.single("upload"), (req, res) => {
    res.send(req.file);
}, (error, req, res, next) => {
    // error handling callback:
    res.send({"error": error.message});
});


