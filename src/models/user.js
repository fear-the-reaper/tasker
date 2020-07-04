const mongoose = require("mongoose");
// for hashing the passwords
const bcrypt = require("bcryptjs");
// for the generic validation we be using validator 
const validator = require("validator");
// for generating the jwt:
const jwt = require("jsonwebtoken");
// For deleting all tasks:
const Task = require("../models/task");
// ==================================== SCHEMA ============================================
// to make a Schema:
const userSchema = new mongoose.Schema({
    name: {
        required: true,
        // refer to the docs for other built-in schema types!!!
        type: String,
        // built-in schema type!!!!
        trim: true
    },
    age: {
        default: 0,
        type: Number,
        // basic validation:
        validate(value) {
            if (value < 18) {
                throw new Error("You are not of legal age to use this app :)");
            }
        }
    },
    //adding new attribute to show generic testing of something!
    email: {
        required: true,
        unique: true,
        trim: true,
        type: String,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email!!!!!");
            }
        }
    },
    // CHALLENGE:
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            // Other than using this you can use the minlength schema type which is more easier!
            // if (value.length < 6) {
            //     throw new Error("password should be greater than 6 chars");
            // }
            if (value.toLowerCase().includes("password")) {
                throw new Error("password should not contain the word password idiot");
            }
        }
    },
    // okay now there is a bad we did which was just returning this
    // as this is just a value that will ALWAYS BE generated and not "linked" to the user
    // they will never truly logged out sooo what we'll do is make a token param in the schema
    // this will be an array NANI this is to ensure the nigga can log in and log out while being
    // logged in/out from other devices like mobile, tablet etc!!!!!!!!
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    profilePic: {
        type: Buffer
    }
}, {
    // now in order to organize our data and not send it as a whole or send EVERYTHING back n 
    // forth we work with timetamps: records the time when something happens or is created, updated,
    // deleted. 
    // now in this second param obj you specify shit for yo schema in this case mongoose already provides timestamps
    // i.e timestamp for when something was created and updated 
    // BY DEFAULT IT IS SET TO FALSE SO WE GONNA ENABLE IT
    timestamps: true 
});

// ============================ VIRTUAL PROPERTIES ========================
// now virtual properties are basically the same as the props we define in the schema but these
// properties ARE NOT STORED IN THE DB!! remember same as the props we define in the schema so we can
// use all the methods like find populate !!!!!!
// how to define a virtual prop!
// Since we be creating a relationship we'll be using localField and foreignField
// also this makes this into an array too!!
userSchema.virtual("tasks", {
    ref: "Task",
    // now wth is a localField well basically its the field that SHOULD match with the foreignField
    // it is essentially the field that tells this property SHOULD be in the model you refing to
    localField: "_id",
    // now wth is a foreignField well basically its the field that SHOULD match with the localField
    // it is essentially the field that tells this property IS  in the model you refing to and is in
    // localField hence it provides a way authenticating and getting it the best way is _id and owner in the
    // Task model as both contain the same ObjectID you cunt!!!
    foreignField: "owner"   
});


// Creating the our model and name of our collection apparently:
// okay so mongoose has some bare bones built-in validation
// for customized validation we use the built-in validate function where your attributes are
// it takes the value that you pass in the thingy!!!
// okay we can make our own validation for emails. phone numbers and what not
// now these things have a shit load of edge cases so for SOMETHING GENERIC 
// where it's something that every app needs FIND A MODULE FOR IT!!!
// trim removes the trailing and leading spaces cuz they be useless!

// ================================= MONGOOSE MIDDLE-WARE =================================
// Okay to store and secure passwords and other shit what we use is middleware
// now what is middle ware? Basically middleware are methods that executed JUST BEFORE OR AFTER 
// we do the mongoose operation! it goes like this *req sent* => *(if any) BEFORE-middleware operation* =>   
// *mongoose operation* => *(if any) AFTER-middleware operation* => *res sent*
// for this to happen we need to make a schema now we already made it in making our models,
// yes the objects in mongoose.model("ModelName", {OBJ}); => this {OBJ} is our Schema
// So a schema is basically a blueprint that DEFINES what our model has, what is required and what validations
// to run.
// now middleware are also thru hooks they can be added before or pre
// or they can be after or post.
// pre-hooks === *req sent* => *(if any) BEFORE-middleware operation* => *mongoose operation* => *res sent*
// post-hooks === *req sent* => *mongoose operation* => *(if any) AFTER-middleware operation* =>  *res sent*
// now we add our hooks to schemas cuz well duh and its a good programming prac to do this just before
// making the model!
// now according to the documentation in the save the *this* refers to the document hence we be using
// function and not arrow function!
// ============================= MIDDLE WARE ===========================================
// ============================= PRE-HOOKS  =====================================
userSchema.pre("save", async function(next){
    //Okay now wtf is the next param will it is signify that this async process has ended!
    // if we don't add it, it assumes that the process is still running!
    
    // alright now we don't want to hash a password thats already been hashed!
    // so we use a the documents isModified method to  check where it has been modded or nah
    // if it is we hash!

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next(); 
});

// Deleting every task of a user when he deletes himself:
// if we do post the user id will be lost you cunt
userSchema.pre("remove", async function(next){
    // remember this refers to the document!
    console.log("DELETING ALL TASKS");
    await Task.deleteMany({owner: this._id});
    next();
});

//========================== USER-INSTANCE CUSTOM METHODS ============================
// a user specifec methods i.e when we get a user, we do this through Schema.methods.name
// now in here "this" mean the user document:
userSchema.methods.getToken = async function() {
    const formula = process.env.JWT_SECRET;
    const _id = this._id.toString(); 
    // okay now there is a bad we did which was just returning this
    // as this is just a value that will ALWAYS BE generated and not "linked" to the user
    // they will never truly logged out sooo what we'll do is make a token param in the schema
    // this will be an array NANI this is to ensure the nigga can log in and log out while being
    // logged in/out from other devices like mobile, tablet etc!!!!!!!!
    const token = jwt.sign({_id}, formula);
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
}

// Okay this is a fun one now we need to hide shit and give the user what he needs and not the mega crap
// that will get himself hacked by a skid who's following a yt vid so lets go make a dis!
userSchema.methods.toJSON = function () {
    // okay the user we get is actually a Document basically a rep of the model like it is in the 
    // db IT LOOKS LIKE AN OBJECT BUT IT AINT so we'll convert it using the Document's toObject meth
    
    const userObj = this.toObject();
    
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.profilePic;

    return userObj;

}
//========================== USER-MODEL CUSTOM METHODS ============================
// okay so we can directly implement our custom methods in our model thru schema by using 
// statics  method. We define our custom method in our schema nigga
// ========================= LOGGING IN ==============================
// BEFORE ANYTHINF IS gucci remember we don't want ppl who have already made an acc
// make another acc with same email or someone else using that password so..
// !!!!!!!!!!!!!!!!!!!!!!!! ALWAYS KEEP A RESTRICTION OF EMAILS !!!!!!!!!!!!!!!!!
// we do this by putting the unique attr in the email in ze schema!!!!!!!
userSchema.statics.login = async (email, password) => {
    // we could use find but since it returns an array of 1 its BS!!!!
    // so we be using findOne :/
    const user = await User.findOne({email});
    if (!user) {
        throw new Error("User not found");
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error("Incorrect password!");
    }
    return user;
};



const User = mongoose.model("User", userSchema);
module.exports = User;

// ====================== EXAMPLE =====================
// Instatiating 

// const nigga = new User({
//     name: "Hussain Khan",
//     age: 12
// });

// SOME METHODS like a save i.e saves it to the database:
// nigga.save().then(() => {
//     console.log(nigga);
// }).catch(error => {
//     console.error(error);
// });

// When shit hits the fan:
// const wrong = new User({
//     name: "Wong",
//     age: "Piece of shit"
// });

// wrong.save().then(() => {
//     console.log(wrong);
// }).catch(error => {
//     console.error(error);
// });



// const newUser  = new User({
//     name: "Batman",
//     age: 21,
//     email: "iAmBatman@gmail.com"
// });

// newUser.save().then(() => {
//     console.log(newUser);
// }).catch(error => {
//     console.error(error);
// });

// Invalid email example:
// const invalidUserEmail = new User({
//     name: "Invalid",
//     age: 25,
//     email: "invalid@"
// });

// invalidUserEmail.save().then(() => {
//     console.log(invalidUserEmail);
// }).catch(error => {
//     console.error(error);
// });


// FINAL!!
// const creator = new User({
//     name: "    Hussain    ",
//     age: 20,
//     email: "   mshk9991@gmaill.com",
//     password: "niggaCat"
// });

// creator.save().then(() => {
//     console.log(creator);
// }).catch(error => {
//     console.error(error.message);
// });
