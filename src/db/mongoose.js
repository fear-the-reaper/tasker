const mongoose = require("mongoose");

// directly connects to your database!
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
});





