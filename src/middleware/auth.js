// for jwt verification:
const jwt = require("jsonwebtoken");
// for accessing the user and the user model:
const User = require("../models/user");
// ============================== EXPRESS MIDDLE-WARE ============================
// okay so express middle ware works alot like mongoose middle ware but in the  end 
// depending on the middle ware operation it may or may not go to that route handler
// without express middle ware: new req -> run route handler
// with middle ware: new rew -> do shit -> may or may not run route handler
// now how to use this middle ware:
// yup we use the use method in which we can target all and specifec routes yeeet
// in the use method we put a function in this it gets 3 params the first 2 are the same as 
// we get in the route handlers yup req and res the third is next which uh huh like in mongoose middle-ware
// it signifes the end!!
// if we don't put it the function just keeps running  in this middle ware we can respond and not go to 
// the route if some error occured!
// example of express middle ware:
// app.use((req, res, next) => {
//     // to know more about these nibbas refer to: https://expressjs.com/en/api.html#req
//     console.log(req.method, req.path);
//     next();
// });
// example 2 stopping the req and sending an error if its a GET post!!!:
// app.use((req, res, next) => {
//     const method = req.method;
//     if (method === "GET") {
//         res.send({error: "unaccessible"});
//     } else {
//         next();
//     }
// });
// Challenge:
// app.use((req, res, next) => {
//     res.status(503).send("Site down, come back soon!");
// });

// now in order to use middle ware in specifec its easier said than done we do this through
// by putting it b/w thr route and the callback aho so the struct will be:
// router.HTTPMETHOD("router", middleWareFunction[if any], callBack!!!!)
const auth = async (req, res, next) => {

    try {
        // since we put the token in the header we'll extract it out of the request header
        // now to do this 2 ways first we do req.header("nameOfTheHeader") that returns the value
        // in thay header key or use req.headers which returns an object and access the header-key vals
        // from there! 
        const token = req.headers.authorization.replace("Bearer ", "");
        console.log(token);
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // whenever we accessing a field which is an array we put it in a string!!!!!
        const user = await User.findOne({_id: decodedToken._id, "tokens.token": token});
        if(!user){
            throw new Error();
        }
        // a nifty feature of the req param is that you can add shit on the fly we can use this as 
        // since we already found the user we don't need to find it again hence just send it and begone 
        // with that code!
        req.token = token;
        req.user = user;
        next(); 
    } catch (e) {
        console.log(e);
        res.status(401).send("Please authenticate!!!!!!!");
    }
    // console.log(req.headers);
}

module.exports = auth; 