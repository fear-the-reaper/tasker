const mongoose = require("mongoose");
// for hashing dem passwords:
const bcrypt = require("bcryptjs");
// for the generic validation we be using validator 
const validator = require("validator");

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // okay now is the time to build the relationship b/w users and tasks
    // now there's 2 ways to do this one you be doing this in the user Schema
    // or the task for this we'll be doing the latter and we'll be storing 
    // 2 things: yup the type is the objectID, reference or 'ref' now wtf is a ref
    // basically telling which Model to see for this task i.e the User, this is
    // also done so that we can use the populate method go to src/index.js to see what
    // that nibba is for!
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    // CHALLNEGE
    timestamps: true
});

// CHALLENGE:

// Middle-ware:
taskSchema.pre("save", async function(next){
    console.log("Saving a task!");
    next();
});
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

// ===================== EXAMPLES =================================
// // instantiating:
// const task1 = new  Task({
//     description: "Become someone",
//     completed: false
// });

// task1.save().then(() => {
//     console.log("Task saved!");
// }).catch( error => {
//     console.error(error);
// });

// const task = new Task({
//     description: "           Bang power girl            ",
//     completed: true
// });
// task.save().then(() => {
//     console.log(task);
// }).catch(error => {
//     console.error(error.message);
// });