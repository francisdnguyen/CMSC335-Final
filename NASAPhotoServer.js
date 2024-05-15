const path = require("path");
const express = require("express");
const app = express();
let portNumber = 2000;
const bodyParser = require("body-parser");
require("dotenv").config({path: path.resolve(__dirname, '/.env')});
const uri = "mongodb+srv://nguyenbrian095:Lockandkey7978@briannguyen.0lehxsr.mongodb.net/?retryWrites=true&w=majority";
const {MongoClient, ServerApiVersion} = require('mongodb');
const client = new MongoClient(uri);



const databaseAndCollection = {db: "NASA_Photos", collection: "Favorite_Photos"};
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs");
app.use(express.static(__dirname));


async function main() {
    // console.log(uri);
    try {
        await client.connect();
    } catch (e) {
        console.error(e)
    }
}

//home page
app.get("/", (request, response) => {
    response.render("index");
});

//photo viewer
app.get("/photoViewer", (request, response) => {
    response.render("photoViewer");
});

//album
app.get("/album", (request, response) => {
    response.render("album");
});

//add a favorite photo
app.post("/addFavorite", async (request, response) => {
    let fave = request.body.photo;
    let name = request.body.name;

    let entry = findOne()
});


main()