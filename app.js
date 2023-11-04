// Imports
import express from "express";
import Inventory from "./Router/Inventory.js";
//Database Import
import db from "./database/connect.js"


//Root
const app = express();


//Use
app.use(express.json());


// Routes
app.use('/inventory',Inventory);




// Server listening
app.listen(3000, () => {
    console.log("Server is running on port 3000 : http://localhost:3000");
})

export default app;