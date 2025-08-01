if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const dbUrl = process.env.ATLASDB_URL;
// const localUrl = "mongodb://localhost:27017/";

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto : {
//         secret: process.env.SECRET,
//     },
//     touchAfter: 24 * 3600,
// });

// store.on("error", () => {
//     console.log("ERROR in MONGO SESSION STORE:", err);
// });

const sessionOptions = {
    // store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, 
    }
}; 


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view_engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currPath = req.path;
    next();
});

main()
.then (() => {
    console.log("Connection successfully established!")
})
.catch((err) => {
    console.log("Error connecting: ", err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Page not found 
// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not found")); 
// });

//Error handler
app.use((err, req, res, next) => {
    let {statusCode = 500, message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080....");
});
