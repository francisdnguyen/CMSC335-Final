const path = require("path");
const express = require("express");
const app = express();
let portNumber = 2000;
const bodyParser = require("body-parser");
require("dotenv").config({path: path.resolve(__dirname, '/.env')});
const uri = "mongodb+srv://nguyenbrian095:Lockandkey7978@briannguyen.0lehxsr.mongodb.net/?retryWrites=true&w=majority";
const {MongoClient, ServerApiVersion} = require('mongodb');
const client = new MongoClient(uri);

let spacePhotos;
let album;
let albumIndex = 0;
let photoIndex = 0;

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
    await initializeSpacePhotos();
    response.render("photoViewer", {"photo": spacePhotos[0].url, "photographer": spacePhotos[0].copyright, "status": "No photo saved yet"});
});


//look-up
app.get("/lookUP", (request, response) => {

    response.render("lookUp");
});

//create the album
app.post("/albumCreation", async (request, response) => {
    let name = request.body.name;
    let entry = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({"name": name});

    if (entry) {
        album = entry.favorites;
        albumIndex = 0;
        response.render("album", {"photo": album[albumIndex].url, "photographer": album[albumIndex].copyright, "status": "Favorites found"});
    } else {
        response.render("resourceNotFound");
    }
});

app.get("/getNewPhotoAlbum", async (request, response) => {
    albumIndex++;
    if (albumIndex < album.length) {
        response.render("album", {"photo": album[albumIndex].url, "photographer": album[albumIndex].copyright, "status": "Favorites found"});
    } else {
        albumIndex = 0; //reset to the beginning
        response.render("album", {"photo": album[albumIndex].url, "photographer": album[albumIndex].copyright, "status": "Favorites found"});
    }
    
});

//add a favorite photo
app.post("/addFavorite", async (request, response) => {
    let fave = spacePhotos[photoIndex];
    let name = request.body.name;

    let entry = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({"name": name});

    //if the entry was found, we simply update
    if (entry) {
        const total = entry.favorites.push(fave);
        //console.log(favorites);
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection)
        .updateOne({"name": name}, {$set: {"favorites": entry.favorites}});
        response.render("photoViewer", {"photo": spacePhotos[photoIndex].url, "photographer": spacePhotos[photoIndex].copyright, "status": "Photo saved to favorites"});
        return result;
    //insert a whole new entry
    } else {
        
        let new_entry = 
        {
            "name": name,
            "favorites": [fave]
        }
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(new_entry);
        response.render("photoViewer", {"photo": spacePhotos[photoIndex].url, "photographer": spacePhotos[photoIndex].copyright, "status": "Photo saved to favorites"});
        return result;
    }
});

//get a photo from the 
app.get("/getNewPhoto", async (request, response) => {
    photoIndex++;
    if (photoIndex < 20) {
        response.render("photoViewer", {"photo": spacePhotos[photoIndex].url, "photographer": spacePhotos[photoIndex].copyright, "status": "No photo saved yet"});
    } else {
        await initializeSpacePhotos(); //we have ran out of photos to view so get new photos
        response.render("photoViewer", {"photo": spacePhotos[photoIndex].url, "photographer": spacePhotos[photoIndex].copyright, "status": "No photo saved yet"});
    }
    
});

//gets fresh phots, we pull 20 at a time
async function initializeSpacePhotos() {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=gwZLEsjbQPP3I8TVbwBPXE9dbGjeVcwyfse2b3Tp&count=20");
    spacePhotos = await res.json();
    photoIndex = 0;
}

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