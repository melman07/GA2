const express = require("express");
const {getData, saveData} = require("./functions")
const app = express();
const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});

app.use(express.json());
app.use(express.static("public"));



app.get("/data", async(req, res)=>{
    res.json(await getData("data.json"))
})

app.delete("/data/:id", async(req, res)=>{
    res.json(await getData("data.json"))
})