const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");

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

app.get("/", (req, res) => {
    console.log("get request to / route happened!");
    res.redirect("/petition");
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
    let first = req.body.first;
    let last = req.body.last;
    let signature = req.body.signature;

    if (first != "" && last != "" && signature != "") {
        db.addFirstLast(first, last, signature)
            .then((result) => {
                console.log(result);
                req.session.signatureId = result.rows[0].id;
                console.log("got your details");
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("Error in addFirstLast:", err);
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
                console.log(results);
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
                console.log(results.rows);
                console.log(namesArray);

                res.render("signers", { listOfNames: namesArray });
            })
            .catch((err) => {
                console.log("Error in getFirstLast: ", err);
            });
    }
});

app.listen(8080, () => console.log("petition server is listening!"));
