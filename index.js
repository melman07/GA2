const express = require("express");
const {getData, saveData, auth} = require("./functions")
const session = require("express-session")
const bcypt = require("bcryptjs")
const app = express();

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});

app.use(express.json());
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


app.get("/data", async(req, res)=>{
    res.json(await getData("data.json"))
})

app.post("/data", async(req,res)=>{

    const product = {}

    

    if(!req.body.name)
        return res.status(400).json({success: false, message: "Name is required"});
    product.id = "id_"+Date.now();

    const allProducts = await getData("data.json");
    const idExists = allProducts.some(p => p.id == product.id);

    if (allProducts.some(p => String(p.id) == String(product.id)))
        return res.status(400).json({success: false, message: "Product ID already exists"});

    product.name = req.body.name || "no_name"
    product.description = req.body.description || "no_description"
    product.price = req.body.price || "no_price"

    allProducts.push(product);
    await saveData(allProducts, "data.json");

    res.status(201).json({product,success: true, message: "product created"});

})

app.put("/data/:id", async(req,res)=>{
    const id = req.params.id
    const products = await getData("data.json");
    const uProd = products.find(p=>p.id == id);
    if(!uProd) return res.status(404).json({success: false, message: "Product not found"});

    uProd.name = req.body.name || uProd.name;
    uProd.description = req.body.description || uProd.description;
    uProd.price = req.body.price || uProd.price;

    await saveData(products, "data.json");

    res.status(200).json({products,success: true, message: "product updated"});
    
})

app.delete("/data/:id", async(req, res)=>{
    const id = req.params.id
    const products = await getData("data.json");
    const product = products.find(p=>p.id==id);

    if(!product) return res.status(404).json({success: false, message: "Product not found"});

    const filteredProducts = products.filter(p=>p.id != id);
    await saveData(filteredProducts, "data.json");

    res.json({success: true, message: "Product deleted"});

    /* res.json(await getData("data.json")) */
});

app.post("/register", async(req,res)=>{

    const username = req.body.username
    const password = req.body.password

    if(!username || !password)
        return res.status(400).json({success: false, message:  "Username and password required"});

    const users = await getData("users.json");

    if(users.find(u=>u.username==username))
        return res.status(400).json({success: false, message: "Username already exists"});

    const hashedPassword = await bcypt.hash(password, 12);

    const user = {userid: "user_"+Date.now(), username: username, password: hashedPassword}
    users.push(user);
    await saveData(users, "users.json");

    res.status(201).json({success: true, message: "User registered"});
});


app.post("/login", async(req,res)=>{

    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password)
        return res.status(400).json({success: false, message: "Email and password required"});

    const users = await getData("users.json");
    const user = users.find(u => u.email == email);

    if(!user)
        return res.status(401).json({success: false, message: "Invalid email or password"});

    if(user.password != password)
        return res.status(401).json({success: false, message: "Invalid email or password"});

    res.status(200).json({user,success: true, message: "Login success"})


});