const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js"); 
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then (() => {
    console.log("Connection successfully established!")
})
.catch((err) => {
    console.log("Error connecting: ", err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6859022490468f27eb2c2a9d"}));
    await Listing.insertMany(initData.data);
    console.log("Databse ahs been initialized");
}

initDB();