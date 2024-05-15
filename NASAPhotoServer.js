const path = require("path");
const express = require("express");
const app = express();
let portNumber = 2000;
const bodyParser = require("body-parser");
require("dotenv").config({path: path.resolve(__dirname, '/.env')});
const uri = "mongodb+srv://nguyenbrian095:Lockandkey7978@briannguyen.0lehxsr.mongodb.net/?retryWrites=true&w=majority";
const {MongoClient, ServerApiVersion} = require('mongodb');
const client = new MongoClient(uri);

let playerName;
let score = 0;
let correct = 0
let spacePhotos;
let photoIndex = 0;


const databaseAndCollection = {db: "NASA_Photos", collection: "highScores"};
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

//initialize game
app.post("/game", async (request, response) => {
    score = 0;
    playerName = request.body.name;
    await initializeSpacePhotos();
    correct = Math.floor(Math.random() * 3);
    console.log(correct + 1);
    response.render("game", 
    {
        "photo": spacePhotos[correct].url, 
        "descriptionOne": spacePhotos[0].explanation, 
        "descriptionTwo": spacePhotos[1].explanation, 
        "descriptionThree": spacePhotos[2].explanation, 
        "score": 0,
        "answer": ""
    });
});

app

//leaderboard
app.get("/leaderBoard", async (request, response) => {

    const topScores = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).aggregate([
        {$sort: {"highScores": -1}}
    ]).toArray();
    //console.log(topScores);
    //const topScores = res.json(); 
    let table = "<table border =\"1\"><th>Player</th><th>High Score</th>";
    for (player of topScores) {
        table += `<tr><td>${player.name}</td><td>${player.highScore}</td></tr>`;
    }
    table += "</table>";
    response.render("leaderBoard", {"playerTable": table});
});

//intialize game
app.get("/initializeGame", async (request, response) => {
    await initializeSpacePhotos();
    response.render("newGame");
});



//end the game and save your score
app.post("/endGame", async (request, response) => {
    

    let entry = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({"name": playerName});

    //if the entry was found, we simply update
    if (entry) {
        const currentHighScore = entry.highScore;
        if (currentHighScore < score) {
            const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection)
            .updateOne({"name": playerName}, {$set: {"highScore": score}});
            response.render("index");
            return result;
        } else {
            response.render("index");
        }
        
    //insert a whole new entry
    } else {
        
        let new_entry = 
        {
            "name": playerName,
            "highScore": score
        }
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(new_entry);
        response.render("index");
        return result;
    }
});

//get a photo from the 
app.post("/getNewPhoto", async (request, response) => {

    choice = request.body.choice;
    console.log(`choice is ${choice}`);
    if (choice == correct) {
        score++;
        //alert(`CORRECT ANSWER!`);
    } else {
        //alert(`Incorrect, correct answer is ${spacePhotos[correct].explanation}`);
    }


    await initializeSpacePhotos(); //we have ran out of photos to view so get new photos
    const prev = correct //save the previous correct answer
    correct = Math.floor(Math.random() * 3);
    console.log(correct + 1);
    response.render("game", 
    {
        "photo": spacePhotos[correct].url, 
        "descriptionOne": spacePhotos[0].explanation, 
        "descriptionTwo": spacePhotos[1].explanation, 
        "descriptionThree": spacePhotos[2].explanation, 
        "score": score,
        "answer": `The correct answer was choice ${prev + 1}`
    });
});

//gets fresh phots, we pull 3 at a time
async function initializeSpacePhotos() {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=gwZLEsjbQPP3I8TVbwBPXE9dbGjeVcwyfse2b3Tp&count=3");
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