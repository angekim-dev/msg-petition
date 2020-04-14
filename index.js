const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

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

app.use(cookieParser());

app.get("/", (req, res) => {
    console.log("get request to / route happened!");
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (!req.cookies.agreed) {
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
                console.log("got your details");
            })
            .catch((err) => {
                console.log("Error in addFirstLast:", err);
            });

        res.cookie("agreed", true);
        res.redirect("/thanks");
    } else {
        res.render("petition", { error: true });
    }
});

app.get("/thanks", (req, res) => {
    if (!req.cookies.agreed) {
        res.redirect("/petition");
    } else {
        console.log("agreed to cookies");
        db.totalSigners()
            .then((result) => {
                return result;
            })
            .then((results) => {
                res.render("thanks", {
                    numberOfSignatures: results,
                });
            })
            .catch((err) => {
                console.log("Error in totalSigners: ", err);
            });
    }
});

app.get("/signers", (req, res) => {
    if (!req.cookies.agreed) {
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
