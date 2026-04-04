const express = require("express");
const {getData, saveData, auth, owner, logger} = require("./functions")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});
// parse eventuell body som kommer i json-format
app.use(express.json());

app.get("/logs", async (req,res)=>{

    logs = await getData("logs.json")
    console.log(logs)
    res.send(logs)
})

app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(logger)


app.get("/data", auth, async(req, res)=>{
    res.json(await getData("data.json"))
})

app.get("/session", (req,res)=>{

    res.send(req.session)
})

app.post("/data", auth, async(req,res)=>{

    const product = {}

    

    if(!req.body.name)
        return res.status(400).json({success: false, message: "Name is required"});
    product.id = "id_"+Date.now();

    const allProducts = await getData("data.json");
    /* const idExists = allProducts.some(p => p.id == product.id); */

    if (allProducts.some(p => String(p.id) == String(product.id)))
        return res.status(400).json({success: false, message: "Product ID already exists"});

    product.name = req.body.name || "no_name"
    product.description = req.body.description || "no_description"
    product.price = Number(req.body.price) || "no_price"
    product.owner = req.session.user.userid
    
    if(isNaN(product.price)|| product.price < 0){
        return res.status(400).json({success:false,message:"Invalid price"});
    };

    allProducts.push(product);
    await saveData(allProducts, "data.json");

    res.status(201).json({product,success: true, message: "product created"});

})

app.put("/data/:id",auth,owner, async(req,res)=>{
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

app.delete("/data/:id", auth,owner,async(req, res)=>{
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

    const email = req.body.email
    const password = req.body.password

    if(!email || !password)
        return res.status(400).json({success: false, message:  "email and password required"});

    const users = await getData("users.json");

    if(users.find(u=>u.email==email))
        return res.status(400).json({success: false, message: "email already exists"});

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {userid: "user_"+Date.now(), email: email.trim(), password: hashedPassword}
    users.push(user);
    await saveData(users, "users.json");

    res.status(201).json({success: true, message: "User registered"});
});




app.post("/login", async(req,res)=>{

    const email = req.body.email.trim();
    const password = req.body.password;

    

    if(!email || !password)
        return res.status(400).json({success: false, message: "Email and password required"});

    

    const users = await getData("users.json");
    const user = users.find(u => u.email == email);

    if(!user)
        return res.status(401).json({success: false, message: "Invalid email or password"});

    const hashedPassword = await bcrypt.compare(password, user.password);

    if(!hashedPassword)
        return res.status(401).json({success: false, message: "Invalid email or password"})

    req.session.user = {
        userid: user.userid,
        email: user.email
    }

    res.status(200).json({user: req.session.user, success: true, message: "Login success"})
    console.log(user)
});


app.post("/logout", auth, (req,res)=>{

    req.session.destroy((err)=>{
        if(err){
            return res.status(500).json({ success:false, message: "Logout failed"});
        }
    res.clearCookie('connect.sid');
    res.status(200).json({success:true,message:"Logout success"})

    });
})

app.get("/me", async (req,res)=>{

    if(!req.session.user){
        return res.status(401).json({loggedIn: false});
    }
    res.json({
        loggedIn: true,
        user: req.session.user
    });
});