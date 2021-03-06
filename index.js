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
    if (req.session.signatureId) {
        console.log(
            "***47*** req.session.signatureId",
            req.session.signatureId
        );
        res.redirect("/thanks");
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
                // console.log("hashedPw in /register: ", hashedPw);
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
                        res.redirect("/profile");
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
        console.log("***USER***", user);
        res.redirect("/thanks");
    } else {
        console.log("**rendering login in get/login");
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    req.session.user = {};
    // const user = req.session.user;
    console.log("***user***", req.session.user);
    //in our login, we use compare!
    //we take the users provided password and compare it to what we have stored as a hash in our db
    let id;
    db.getUserInfo(email)
        .then((result) => {
            // console.log("***result", result);
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
                // res.redirect("/thanks"); // redirect to /petition or /thanks, depending on data flow
                return req.session.user.userId;
            } else if (matchValue != true) {
                res.render("login", {
                    error: true,
                });
            }
        })
        .then((userId) => {
            //checking for signature with userID part 4
            // req.session.user = {};
            console.log("***140", userId);
            db.checkSignature(userId)
                .then((results) => {
                    if (results.rows[0].id) {
                        req.session.signatureId = results.rows[0].id;
                        console.log(
                            "signatureId in checkSignature",
                            results.rows[0].id
                        );
                        res.redirect("/thanks");
                    } else {
                        res.redirect("/petition");
                    }
                })
                .catch((err) => {
                    console.log("Error in checkSignature POST /login: ", err);
                    res.redirect("/petition");
                });
        })
        .catch((err) => {
            console.log("Error in getUserInfo: ", err);
            res.render("login", {
                error: true,
            });
        });
});

app.get("/petition", (req, res) => {
    console.log("***163*** req.session.signatureId", req.session.signatureId);
    if (req.session.signatureId) {
        console.log(
            "***165*** req.session.signatureId",
            req.session.signatureId
        );
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    console.log("***IN POST petition***", req.session.user.userId);
    // req.session.user = {};
    // console.log("***", signature);
    // const user_id = req.session.user_id;
    // console.log("******", req.session);
    if (signature != "") {
        db.addSignature(signature, req.session.user.userId)
            .then((result) => {
                // console.log("Result of addSignature", result);
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
    console.log("***199 req.session.signatureId", req.session.signatureId);
    let numbers;
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        console.log("line 180 agreed to cookies");
        db.totalSigners()
            .then((result) => {
                numbers = result;
            })
            .catch((err) => {
                console.log("Error in totalSigners", err);
            });
        db.getSignature(req.session.signatureId)
            .then((results) => {
                // console.log("Results of getSignature: ", results);
                res.render("thanks", {
                    first: req.session.first,
                    last: req.session.last,
                    signaturePicture: results,
                    numberOfSignatures: numbers,
                });
            })
            .catch((err) => {
                console.log("Error in getSignature: ", err);
            });
    }
});

app.post("/thanks/delete", (req, res) => {
    console.log("userId in thanks/delete", req.session.userId);
    db.deleteSig(req.session.user.userId)
        .then(() => {
            delete req.session.signatureId;
            console.log(
                "***THANKS/DELETE signatureID",
                req.session.signatureId
            );
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("Error in deleteSig: ", err);
        });
    console.log("DELETE success");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    let age = req.body.age;
    let city = req.body.city;
    let url = req.body.url;
    let userId = req.session.user.userId;
    // console.log("*****217*userId", userId);
    if (url.startsWith("http") || url == "") {
        db.addProfile(age, city, url, userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("Error in addRegistration: ", err);
                res.render("profile", { error: true });
            });
    } else {
        console.log("url NOT ok POST /profile", url);
        res.render("profile", { error: true });
    }
});

app.get("/profile/edit", (req, res) => {
    const { user } = req.session;
    if (!user) {
        res.redirect("/register");
    } else {
        db.getSupportersDetails(user.userId)
            .then((result) => {
                console.log("****258", user.userId);
                let supDet = result.rows;
                res.render("edit", {
                    first: supDet[0].first,
                    last: supDet[0].last,
                    email: supDet[0].email,
                    age: supDet[0].age,
                    city: supDet[0].city,
                    url: supDet[0].url,
                });
            })
            .catch((err) => {
                console.log("GET edit catch:", err);
            });
    }
});

app.post("/profile/edit", (req, res) => {
    const { user } = req.session;
    let age = req.body.age;
    let city = req.body.city;
    let url = req.body.url;
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    let password = req.body.password;
    if (url != "" && !url.startsWith("http")) {
        db.getSupportersDetails(user.userId)
            .then((result) => {
                let supDet = result.rows;
                res.render("edit", {
                    first: supDet[0].first,
                    last: supDet[0].last,
                    email: supDet[0].email,
                    age: supDet[0].age,
                    city: supDet[0].city,
                    url: supDet[0].url,
                    error: true,
                });
            })
            .catch((err) => {
                console.log("POST edit catch when url WRONG:", err);
            });
    } else if (password != "") {
        hash(password).then((hashedPw) => {
            Promise.all([
                db.makeChanges(first, last, email, hashedPw, user.userId),
                db.upsertProfile(age, city, url, user.userId),
            ])
                .then(() => {
                    res.redirect("/thanks");
                })
                .catch((err) => {
                    console.log("POST edit catch after update:", err);
                    // after error, rerender page
                    db.getSupportersDetails(user.userId)
                        .then((result) => {
                            let supDet = result.rows;
                            res.render("edit", {
                                first: supDet[0].first,
                                last: supDet[0].last,
                                email: supDet[0].email,
                                age: supDet[0].age,
                                city: supDet[0].city,
                                url: supDet[0].url,
                                error: true,
                            });
                        })
                        .catch((err) => {
                            console.log(
                                "POST edit catch when rerendering:",
                                err
                            );
                        });
                });
        });
    } else {
        Promise.all([
            db.makeChangesNoPw(first, last, email, user.userId),
            db.upsertProfile(age, city, url, user.userId),
        ])
            .then(() => {
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("POST edit catch when no password:", err);
                //again rerendering if error
                db.getSupportersDetails(user.userId)
                    .then((result) => {
                        let supDet = result.rows;
                        res.render("edit", {
                            first: supDet[0].first,
                            last: supDet[0].last,
                            email: supDet[0].email,
                            age: supDet[0].age,
                            city: supDet[0].city,
                            url: supDet[0].url,
                            error: true,
                        });
                    })
                    .catch((err) => {
                        console.log(
                            "POST edit catch when rerendering no password:",
                            err
                        );
                    });
            });
    }
});

app.get("/signers", (req, res) => {
    const { user } = req.session;
    console.log("user in GET signers", user);
    if (!user) {
        res.redirect("/register");
    } else {
        if (req.session.signatureId) {
            db.getSupporters()
                .then((result) => {
                    console.log("***result in signers", result);
                    return result.rows;
                })
                .then((result) => {
                    res.render("signers", {
                        signers: result,
                    });
                })
                .catch((err) => {
                    console.log("Error in getSupporters: ", err);
                });
        } else {
            res.redirect("/register");
        }
    }
});

app.get("/signers/:city", (req, res) => {
    if (req.session) {
        const city = req.params.city;
        db.getCity(city)
            .then((result) => {
                return result.rows;
            })
            .then((results) => {
                res.render("city", { city: city, citizens: results });
            })
            .catch((err) => {
                console.log("Error in getCity: ", err);
            });
    } else {
        res.redirect("/register");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening!")
);
// env stands for environment
