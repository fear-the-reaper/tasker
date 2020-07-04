const sgMail = require("@sendgrid/mail");


// first we tell sgMail to use this api key nigga
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeEmail = (email, name) => {
    const msg = {
        to: email,
        from: "jta.reaper@gmail.com",
        subject: "Welcome to Tasker!",
        text:   `Hi! ${name} thank you for you signing up with Tasker Services!!!!`
    };
    sgMail.send(msg).then(() => {
        console.log("This worked!!!!");
    }).catch((e) => {
        console.log(e);
    });    
};

const farewellEmail = (email, name) => {
    const msg = {
        to: email,
        from: "jta.reaper@gmail.com",
        subject: "Thank you for using Tasker!",
        text:   `Hi! ${name} thank you for you using Tasker Services! If you can please tell us 
        how to improve our services!`
    };
    sgMail.send(msg).then(() => {
        console.log("This worked!!!!");
    }).catch((e) => {
        console.log(e);
    });
}

module.exports = {
    welcomeEmail,
    farewellEmail
};







// ========================= BASIC EXAMPLE =======================================
// sending a basic email! We do this through making an obj with to, from, subject, body props
// moreover we can add custom HTML to really configure our emailsss

// const msg = {
//     to: "mshk9991@gmail.com",
//     from: "jta.reaper@gmail.com",
//     subject: "First mail thru sendgrid!",
//     text: "suck my dick",
//     html: "<i>suck my dick</i>"
// };

// // sending the mail!!!
// sgMail.send(msg).then(() => {
//     console.log("This worked!!!!")
// }).catch((e) => {
//     console.log(e);
// });