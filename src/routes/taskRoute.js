const express = require("express");
// importing our models/resources!:
const Task = require("../models/task");
// importing the authentication middleware
const auth = require("../middleware/auth");
const User = require("../models/user");
const router = express.Router();
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
// Creating tasks:
// Integrating async await
// now as we be making a relationship is a  good thing we authenticate a user is doing this hence
// we'll be using the express middle ware !
//========================= CREATION END POINTS: ================================
router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        // this the spread operator that copies the props into here
        ...req.body,
        owner: req.user._id
    });
    try {
        // okay so by default express sends 200 which means OK, but thats
        // really generic but to provide the best possible info we 
        // set it to 201 which signifies creation goto: https://httpstatuses.com/ for more info
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(error);   
    }
});
// Reading end points for Tasks:
// Challenge 
//================================ READING END POINTS: =============================
// okay rn we sending everything back which is abad cuz if you have a shit load of notes and hoes
// it'll take a bitch to get and recive so we'll filter data. The filtering will be done through the user
// we we'll do this uh huh through query strings!
// Filtering => /tasks?completed=boolVal
// Pagination => /tasks?limit=10&skip=10
// Sorting =? /tasks?sortBy=createdAt|desc
router.get("/tasks", auth, async (req, res) => {
    try {
        // const tasks = await Task.find({});
        // const user = await User.findById(req.user._id);
        // the alternative would be much shorter i.e just use find and filter with the owner and
        // and put in the auth user id!!!
        // now we used populate which is gucci now only using just the model/path name ain't good nuff
        // we can further elaborate what we by putting a document or an array of them
        // in the doc we'll first give the ref, the 2nd optional param is match which is basically
        // another filter obj we write in like we do when we use the query methods!!!
        // now since match is our filterer our query string's boolVal will go now this won't be a bool
        // val its gonna be string and the user can have 3 options: All notes, completed or not completed notes
        // now if there ain't a query string it means the nigga wants all of em, if there is we gotta see if
        // its true if it is then we populate all the completed: true notes, if it ain't we'll populate
        // completed: false  notes
        match = {};
        sort = {};
        if(req.query.completed){
            // if (req.query.completed === "true") {
            //     match.completed = true;
            // }else{
            //     match.completed = false;
            // }
            // Now this was the long ass method
            // in JS what we can do is put a conditional in an assignment and it can evaluate the condition
            // and then store the bool result to the var thats making the assignment!!!
            match.completed = req.query.completed === "true"
        }
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split("|");
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
        }
        await req.user.populate({
            path: "tasks",
            match,
            // okay wtf is pagination basically a way to divide, send, and display content
            // google does this if you google anything you'll see the number of results from your
            // query but it doesn't give it you all at once it'll be 10 links per page
            // now you can do pagination very easily through 2 props in the options obj
            // in populate.
            // now the limit is the block of how many items to populate, fetch etc
            // skip is the next page IN TERMS OF A ITEM so if you show 10 items i.e 0-9 
            // your skip would be 0 now the next skip would be 10 cuz we need to show 10-19
            options: {
                // now we want this to be dynamic i.e user-based so in limit and in skip we can do 2 things
                // either use parseInt and Number both will convert a string to number if it is an int!!
                // if it ain't mongoose-sama will ignore
                // the diff b/w parseInt and Number is simple: if you put "10px" in both
                // pasrseInt("10px", optional Param radix or base default is base 10) => will return 10
                // Number("10px") => will return NaN
                // hence we be using pasreInt => theres for float and others too!
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500);
    }
});
// making them authenticated and specifec to that user logged in so if even writes the correct id of a task
// of another user he won't get it!!
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        // the only thing we need to change is how we fetch and in the filter we put both the user
        // and task id 
        const task = await Task.findOne({_id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});
//============================ UPDATING END-POINTS: ==============================
// Updating shit in node.js:
router.patch("/tasks/:id", auth, async (req, res) => {
    const operations = Object.keys(req.body);
    const allowedOperations = ["description", "completed",];
    const isValid = operations.every(operation => {
        return allowedOperations.includes(operation);
    });
    if (!isValid) {
        return res.status(400).send({"Error": "Enter a valid update you shit"});
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send({"Error": "Task not found nimrod"});
        }
        operations.forEach(operation => task[operation] = req.body[operation]);
        await task.save();
        res.send(task);
    } catch (e) {
        if (e.name  === "ValidationError") {
            return res.status(406).send("Validation Error!");
        }
        else if (e.name === "CastError") {
            return res.status(404).send({"Error": "Task not found nimrod"});
        }
        res.status(500).send(e);
    } 
});
// ======================= DELETING END POINTS: ===============================
// Deleting tasks
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send({"Error": "Task not found jackass and could not be deleted!"});
        }
        res.send(task);
    } catch (e) {
        if (e.name === "CastError") {
            return res.status(404).send({"Error": "Task not found jackass and could not be deleted!"});
        }
        res.status(500).send();
    }
});
module.exports = router;