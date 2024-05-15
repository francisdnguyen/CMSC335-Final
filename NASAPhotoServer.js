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
app.get("/photoViewer", async (request, response) => {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=gwZLEsjbQPP3I8TVbwBPXE9dbGjeVcwyfse2b3Tp");
    let photo = await res.json();
    console.log(photo);
    response.render("photoViewer", {"photo": photo.url, "photographer": photo.copyright});
});

//album
app.get("/album", (request, response) => {

    response.render("album");
});

//add a favorite photo
app.post("/addFavorite", async (request, response) => {
    let fave = request.body.photo;
    let name = request.body.name;

    let entry = await db.collection.findOne({"name": name});

    //if the entry was found, we simply update
    if (entry) {
        let favorites = entry.favorites.push(fave);
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection)
        .updateOne({"name": name}, {$set: {"favorites": favorites}});
        return result;
    //insert a whole new entry
    } else {
        
        let new_entry = 
        {
            "name": name,
            "favorites": [fave]
        }
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(new_entry);
        return result;
    }
});

//get a photo from the 
app.get("/getNewPhoto", async (request, response) => {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=gwZLEsjbQPP3I8TVbwBPXE9dbGjeVcwyfse2b3Tp");
    let photo = await res.json();
    response.render("photoViewer", {"photo": photo.url, "photographer": photo.copyright});
});

if (process.argv.length != 3) {
    process.exit(1);
} else {
    portNumber = process.argv[2];
    app.listen(portNumber);
}

console.log(`Web server started and running at http://localhost:${portNumber}`);
const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.setEncoding("utf8");
process.stdin.on('readable', () => { //listen to stdin for commands from user
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log("Invalid command: " + command);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

main()