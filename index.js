const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./bc");

// console.log("db: ", db);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// DON'T FORGET TO serve public folder
app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(csurf());
app.use((req, res, next) => {
    res.set("X-Frame-Options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

///ROUTES///

app.get("/", (req, res) => {
    console.log("get request to / route happened!");
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    const { user } = req.session;
    if (user) {
        res.redirect("/petition");
    } else {
        res.render("register");
    }
});

app.post("/register", (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    let password = req.body.password;
    req.session.user = {};

    if (first != "" && last != "" && email != "" && password != "") {
        // we grab user input, hash what they provided as a password and store this info in database
        hash(password)
            .then((hashedPw) => {
                console.log("hashedPw in /register: ", hashedPw);
                return db
                    .addRegistration(first, last, email, hashedPw)
                    .then((result) => {
                        // USER ID as cookie
                        console.log("result in addRegistration: ", result);
                        req.session.user = {
                            firstName: first,
                            lastName: last,
                            userId: result.rows[0].id,
                        };
                        console.log(
                            `${req.session.user.firstName} ${req.session.user.lastName} has the ID: ${req.session.user.userId}`
                        );
                        console.log("got your registration");
                        res.redirect("/petition"); //here redirect to /petition INSTEAD OF 200
                    });
            })
            .catch((err) => {
                console.log("Error in addRegistration: ", err);
                res.render("register", { error: true });
            });
    } else {
        res.render("register", { error: true });
    }
});

app.get("/login", (req, res) => {
    const { user } = req.session;
    if (user) {
        res.redirect("/petition");
    } else {
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    req.session.user = {};
    // const user = req.session.user;
    // console.log("***user***", user);
    //in our login, we use compare!
    //we take the users provided password and compare it to what we have stored as a hash in our db
    let id;
    db.getUserInfo(email)
        .then((result) => {
            let hashedPw = result.rows[0].password;
            id = result.rows[0].id;
            return hashedPw;
        })
        .then((hashedPw) => {
            return compare(password, hashedPw);
        })
        .then((matchValue) => {
            console.log("matchValue :", matchValue);
            if (matchValue == true) {
                req.session.user.userId = id;
                console.log("***JUST ASSIGNED IT****", req.session.user.userId);
                res.redirect("/petition"); // redirect to /petition or /thanks, depending on data flow
            } else if (matchValue != true) {
                res.render("login", {
                    error: true,
                });
            }
        })
        .catch((err) => {
            console.log("Error in getUserInfo: ", err);
            res.render("login", {
                error: true,
            });
        });
});

app.get("/petition", (req, res) => {
    // const { user } = req.session;
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    console.log("***IN POST petition***", req.session.user.userId);
    // console.log("***", signature);
    // const user_id = req.session.user_id;
    // console.log("******", req.session);
    if (signature != "") {
        db.addSignature(signature, req.session.user.userId)
            .then((result) => {
                console.log("Result of addSignature", result);
                req.session.signatureId = result.rows[0].id;

                console.log("got your details");
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("Error in addSignature:", err);
            });
    } else {
        res.render("petition", { error: true });
    }
});

app.get("/thanks", (req, res) => {
    // const { user } = req.session;
    let numbers;
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        console.log("agreed to cookies");
        db.totalSigners()
            .then((result) => {
                numbers = result;
            })
            .catch((err) => {
                console.log("Error in totalSigners", err);
            });
        db.getSignature(req.session.signatureId)
            .then((results) => {
                console.log("Results of getSignature: ", results);
                res.render("thanks", {
                    first: req.session.firstName,
                    last: req.session.lastName,
                    signaturePicture: results,
                    numberOfSignatures: numbers,
                });
            })
            .catch((err) => {
                console.log("Error in getSignature: ", err);
            });
    }
});

//SIGNERS BROKEN FOR NOW//

app.get("/signers", (req, res) => {
    const { user } = req.session;
    if (!user) {
        res.redirect("/petition");
    } else {
        db.getSupportersDetails()
            .then((results) => {
                let namesArray = [];
                for (let i = 0; i < results.rows.length; i++) {
                    let fullName =
                        results.rows[i].first + " " + results.rows[i].last;
                    namesArray.push(fullName);
                }
                console.log("Results.rows in getFirstLast: ", results.rows);
                console.log("NamesArray: ", namesArray);

                res.render("signers", { listOfNames: namesArray });
            })
            .catch((err) => {
                console.log("Error in getFirstLast: ", err);
            });
    }
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening!")
);
// env stands for environment
