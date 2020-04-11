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
    if (!req.cookies.cookie) {
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
        db.addFirstLast(first, last)
            .then(() => {
                console.log("got your details");
            })
            .catch((err) => {
                console.log("Error in addFirstLast:", err);
            });

        res.cookie("cookie", "agreed");
        res.redirect("/thanks");
    } else {
        console.log("fail");
    }
});

app.get("/cities", (req, res) => {
    db.getCities() //returns promise
        .then((results) => {
            //OR {rows}
            console.log("results: ", results.rows); //we only care about rows, that's why .rows OR just rows IF destructuring
        })
        .catch((err) => {
            console.log("err in getCities: ", err);
        });
});

app.post("/add-city", (req, res) => {
    db.addCity("Guayaquil", "Ecuador") //ideally user input coming from the server, not hard-coding like here
        .then(() => {
            console.log("yay that worked!");
        })
        .catch((err) => {
            console.log("err in addCity: ", err);
        });
});

app.listen(8080, () => console.log("petition server is listening!"));
