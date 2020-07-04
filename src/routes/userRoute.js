const express = require("express");
// importing our models/resources!:
const User = require("../models/user");
// getting our middleware:
const auth = require("../middleware/auth");
// multer middle ware:
const multer = require("multer")
// for resizing and cropping the images!!!!:
const sharp = require("sharp");
// for sending emails:
const emails = require("../emails/accounts");
// As you can see this file is a cluster fuck
// so to be organized we be seperating the routes into different in terms of our resources
// we do this by using the router method now router and app have the same methods for routes 
// i.e post, get, patch, and delete and to USE those routers yup we use the .use method to 
//  incooperate it in the server!
// DUMMMY code!
// const router = express.Router();
// router.get("/test", (req, res) => {
//     res.send("Testing route");
// });
const router = express.Router();
//========================= CREATION END POINTS: ================================
// As this is a creation request we use the post method!
// POST always expects JSON DATA!!!!
// Integrating async await
// ======================== SIGINING UP =====================================
router.post("/users", async (req, res) => {
    // saving a user:
    try {
        const user = new User(req.body);
        await user.save();
        emails.welcomeEmail(user.email, user.name);
        // okay so by default express sends 200 which means OK, but thats
        // really generic but to provide the best possible info we 
        // set it to 201 which signifies creation goto: https://httpstatuses.com/ for more info
        const token = await user.getToken();
        res.status(201).send({user, token});
    } catch (e) {
        // remember for an error or good accepted request set the status
        // use httpstatuses.com for the most relevant one!!!!!
        res.status(400).send(e);    
    }
});
// ======================== LOGGING IN: =========================================
router.post("/users/login", async (req, res) => {
    // OKAY we could put the whole process but that is a shit-ass cluster fuck of a way of doing it
    // the better thing would be to make our custom method in the model to do it
    // now lesss do that GOTO modelName.js[user] you cunt!!
    // well we made the custom meth so no we use it like we use the other cunts
    try {
        const {email, password} = req.body;
        const user = await User.login(email, password);
        const token = await user.getToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }    
    // =========== SHIT YOU DID YO SELF ========
    // why is get bad!?!? for logging in!: the login payload can be crafted with a link
    // increases xss attack shit and puts user login shit in the weeb history 
    // DAS WHY WE USE POST SOB!!!!!!!!! 
    // console.log(req.body);
    // const {email, password} = req.body;
    
    // try {
    //     const user = await User.findOne({email});
    //     if (!user) {
    //         return res.status(404).send("Error: User not found :/");
    //     }
    //     const isValid = await bcrypt.compare(password, user.password);
    //     if (!isValid) {
    //         return res.status(404).send("Wrong password nigga");
    //     }
    //     res.status(200).send(user)
    // } catch (e) {
    //     console.log(e);
    // }
});
// ====================== LOGGING OUT ======================
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            // REMEMBER the tokens array contains A SUB DOC WHICH HAS THE FIELD TOKEN
            // THIS SHIT HAPPENES EVERY TIME WHEN YOU MAKE AN ARRAY IN A SCHEMA
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});
// Challenge:
// ============================ LOGGING OUT FROM ALL DEVICES ============================
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save(); 
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});
// Challenge:
// ============================ File uploads =====================================
avatar = multer({
    // dest: "avatars",
    // Challenge:
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
            return cb(undefined, true);
        }
        cb(new Error("File must be jpeg, jpg, or png"));
    }
});

// Challenge
// now to make it auth before the multer middle ware we'll pass in the auth middle ware
router.post("/users/me/avatar", auth, avatar.single("avatar"),  async (req, res) => {
    req.user.profilePic = await sharp(req.file.buffer).resize(350, 350).toBuffer();
    await req.user.save();
    res.status(201).send("profile pic uploaded!!!!!!!!!!");
}, (error, req, res, next) => {
    res.status(400).send({"error": error.message});
});




//================================ READING END POINTS: =============================
// okay now we making request to GET shit from the db
// now there are 2 one where we get all the users info
// the second is getting the info of the specifec user
// now in order to get shit from the db we make search forms or queries
// these queries are like giving a piece of info and getting the respective thingy.
// now these query method come in built with each Model(User, Task) we make with mongoose
// like Model.queryMethod => User.queryMethod()
// fetching all the users
// okay so ya bad idea as one user cannot see other nibbas userNames and pass so we'll edit this out 
// and make it a profile yeet
router.get("/users/me", auth, async (req, res) => {
    try {
        // now you think you did pretty good you fool you can automate this even further! so it turns out
        // JUST before sending the response res.send calls in JSON.Stringify() now the Stringify method
        // automatically calls a fucntion toJSON() IF WE MADE it so bitch 
        res.send(req.user);
    } catch (e) {
        // as this error is related with not connecting cuz duh think about it jackass
        // we'll set the status code to 500 i.e internal server error for more info: https://httpstatuses.com/
        res.status(500);
    }     
});
//============================ UPDATING END-POINTS: ==============================
router.patch("/users/me", auth, async (req, res) => {
    const operations = Object.keys(req.body);
    const allowedOperations = ["name", "age", "password", "email"];
    // listen here you lil shit:
    // now to see if it is a valid update or not i.e valid attributes you use 
    // every attribute where it iterates through a given list and do something like
    // comparision, validation and it returns true IF ALL CASES ARE TRUE!!!!!
    // even if one of em is a false it'll return false
    const isValid = operations.every(operation => {
        return allowedOperations.includes(operation);
    });
    if (!isValid) {
        return res.status(400).send({"Error": "Enter a vallid update you shit"});
    }
    try {
        operations.forEach(operation => req.user[operation] = req.body[operation]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        if (e.name === "CastError") {
            return res.status(404).send({"Error": "User not found jackass"});
        }
        res.status(500).send(e);
    } 
});
// ======================= DELETING END POINTS: ===============================
// ======================= DELETING A USER ====================================
// Since we don't want an un-auth or auth user to delete another nigga so we remove the id and shit  
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        emails.farewellEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        if (e.name === "CastError") {
            return res.status(404).send({"Error": "User not found nimrod and could not be deleted!"});
        }
        res.status(500).send();
    }
});
// ============================ DELETING A PROFILE PIC =============================
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.profilePic = undefined;
    await req.user.save();
    res.send("Profile pic successfully deleted!!!!!!!!");
}, (error, req, res, next) => {
    res.send({"error": error.message});
});





module.exports = router;

// ==================== LEARNING PURPOSES ====================
// router.get("/users", auth, async (req, res) => {
//     try {
//         // okay so there ain't no specifec method for getting all the users but there's a wrap around
//         // we'll use the method find!
//         // we put an empty obj this triggers the find method to send all dem users!!!!!
//         const users = await User.find({});
//         res.send(users);
//     } catch (e) {
//         // as this error is related with not connecting cuz duh think about it jackass
//         // we'll set the status code to 500 i.e internal server error for more info: https://httpstatuses.com/
//         res.status(500);
//     }     
// });
// getting a specifec users through their ID!:
// now there are things like request params where a part of the URL is dynamic like it changes user to user     
// or something. Furthermore it is additional data! So it'll be shit like this nigga/420 or nigga/69
// now how we do that? well its easy we do this in the route by putting : with a name!
// router.get("/users/:id", async (req, res) => {
//     // as you can see the req param is id!
//     // to access this mf you do req.param this returns an object has a key value pari
//     // where the key is the param name in this case its id and the value is what yo user sent
//     // like in /users/12 it'll 12 and /users/56 it'll be 56!
//     // fo this nigga we be using findById!
//     const _id = req.params.id;
//     try {
//         //okay now there 2 possibilities either we find it or nah
//         // if it doesn't it'll send an empty obj and then express sends that is considerd correct
//         // syntatically not logically! So we use conditional logic were we configure the status code
//         // where it will tell us if it was succesfull or nah!
//         // now when it doesn't find the doc it'll return null!
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (e) {
//         res.status(500);
//     } 
// });
// router.patch("/users/:id", async (req, res) => {
//     const operations = Object.keys(req.body);
//     const allowedOperations = ["name", "age", "password", "email"];
//     // listen here you lil shit:
//     // now to see if it is a valid update or not i.e valid attributes you use 
//     // every attribute where it iterates through a given list and do something like
//     // comparision, validation and it returns true IF ALL CASES ARE TRUE!!!!!
//     // even if one of em is a false it'll return false
//     const isValid = operations.every(operation => {
//         return allowedOperations.includes(operation);
//     });
//     if (!isValid) {
//         return res.status(400).send({"Error": "Enter a vallid update you shit"});
//     }
//     try {
//         // okay since findByIdAndUpdate bypasses the middleware we have a niche lil work around!
//         // 1) find the cunt thru findById()!
//         const user = await User.findById(req.params.id);
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
//         if (!user) {
//             return res.status(404).send({"Error": "User not found jackass"});
//         }
//         operations.forEach(operation => user[operation] = req.body[operation]);
//         await user.save();
//         res.send(user);
//     } catch (e) {
//         if (e.name === "CastError") {
//             return res.status(404).send({"Error": "User not found jackass"});
//         }
//         res.status(500).send(e);
//     } 
// });
// ========================= RELATIONSHIP AND POPULATE PROBLEMS ======================================
// const main = async () => {
//     try {
//         // const task = await Task.findById("5ef789d042da8f15345550f1");
//         // now in order to make this property i.e owner into a full fledge we use Populate which uses the ref to see
//         // which model to convert that property thru any mode of ID i.e ObjectID to that document! and to assure it is being
//         // converted we chain it with execPopulate remember this process is ASYNC:
//         // BY DOING THE POPULATE METHOD IT CONVERTS THE ID AND PUTS THAT DOC IN IT HA!
//         // await task.populate("owner").execPopulate();
//         // console.log(task.owner);

//         const user = await User.findById("5ef789af42da8f15345550ef");
//         // now this returns undefined and ik what you thinking that we gonna put another
//         // attribute in the user with a ref of Task HA! wrong. now doing is perfectly valid
//         // but its redundant so its better to use virtual properties now go to /models/user you cunt
//         await user.populate('tasks').execPopulate(); 
//         console.log(user.tasks);
//     } catch (e) {
//         console.log(e)
//     }

// };

// main();

