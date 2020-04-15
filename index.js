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

// DON'T FORGET TO serve public folder
app.use(express.static("./public"));

///ROUTES///

app.get("/", (req, res) => {
    console.log("get request to / route happened!");
    res.redirect("/register");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    let password = req.body.password;

    if (first != "" && last != "" && email != "" && password != "") {
        // we grab user input, hash what they provided as a password and store this info in database
        hash(password)
            .then((hashedPw) => {
                console.log("hashedPw in /register: ", hashedPw);
                return db
                    .addRegistration(first, last, email, hashedPw)
                    .then((result) => {
                        console.log("result in addRegistration: ", result);
                        req.session.userId = result.rows[0].id;
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
    res.render("login");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (email != "" && password != "") {
        //in our login, we use compare!
        //we take the users provided password and compare it to what we have stored as a hash in our db
        db.getUserInfo(email)
            .then((result) => {
                let hashedPw = result.rows[0].password;
                return hashedPw;
            }) // grab the user's stored hash from db and use that as compare value identifying it via the email
            .then((hashedPw) => {
                return compare(password, hashedPw);
            })
            .then((matchValue) => {
                console.log("matchValue :", matchValue);
                //depending on whether true or false, log user in or render login with error msg
                // if matchValue is true, store the user id in the cookie req.session.userId
                //if matchValue is false, rerender login with error msg
            })
            .then((result) => {
                req.session.userId = result.rows[0].id;
                res.redirect("/thanks"); // redirect to /petition or /thanks, depending on data flow
            })
            .catch((err) => {
                console.log("Error in getUserInfo: ", err);
                res.render("login", { error: true });
            });
    } else {
        res.render("login", { error: true });
    }
});

app.get("/petition", (req, res) => {
    const { signatureId } = req.session;
    if (!signatureId) {
        res.render("petition");
    } else {
        res.redirect("/thanks");
    }
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;

    if (signature != "") {
        db.addSignature(signature, user_id)
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
    const { signatureId } = req.session;
    let numbers;
    if (!signatureId) {
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
        db.getSignature(signatureId)
            .then((results) => {
                console.log("Results of getSignature: ", results);
                res.render("thanks", {
                    signaturePicture: results,
                    numberOfSignatures: numbers,
                });
            })
            .catch((err) => {
                console.log("Error in getSignature: ", err);
            });
    }
});

app.get("/signers", (req, res) => {
    const { signatureId } = req.session;
    if (!signatureId) {
        res.redirect("/petition");
    } else {
        db.getFirstLast()
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

app.listen(8080, () => console.log("petition server is listening!"));
