# GA2
Melker GA

## Server

### Start server
``` js 
const express = require("express");
const {getData, saveData, auth, owner, logger} = require("./functions")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on http://localhost:" + port);
});

app.use(express.json());
```
Servern startar på port 3000 eller det som står i miljövariablen PORT
### Gör public foldern tillgänglig
```js
app.use(express.static("public"));
```

### Session
```js
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
```

### Routes
```js
app.use(logger)
```
Andvänder mitt logger minddleware på alla routes.
```js
app.get("/data", auth, async(req, res)=>{
    res.json(await getData("data.json"))
})
```
Skickar upp json respons med alla produkter om auth går igenom
```js
app.post("/data", auth, async(req,res)=>{

    const product = {}

    

    if(!req.body.name)
        return res.status(400).json({success: false, message: "Name is required"});
    product.id = "id_"+Date.now();

    const allProducts = await getData("data.json");

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
```
Create route ger status fel om name inte är skrivet och id redan andvänds eller om price inte är ett nummer. Tar emot name description och price från formulär och pushar nya produkten till allProducts som sparas till data.json filen.
```js
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
```
Update routes körs bara om auth och owner slutförs. Om uProd inte finns så returnas en felkåd. Om allt går bra så returnas Products. Om det är något i formulärens fält så updateras det till detta annars bevarar dom samma som innan.
```js
app.delete("/data/:id", auth,owner,async(req, res)=>{
    const id = req.params.id
    const products = await getData("data.json");
    const product = products.find(p=>p.id==id);

    if(!product) return res.status(404).json({success: false, message: "Product not found"});

    const filteredProducts = products.filter(p=>p.id != id);
    await saveData(filteredProducts, "data.json");

    res.json({success: true, message: "Product deleted"});
});
```
Delete route körs bara om auth och owner slutförs. Om producten som ska raderas inte hittas så returnas en felkåd. Om allt går bra returnas en respons success = true.
```js
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
```
Register route. om email och/eller password inte finns så returnas felkåd. om emailen redans andvänds för ett konto returnas felkåd. Om allt går bra så kommer den usern pushas till users som savas till users.json. Lösernordet hashas med bcrypt
```js
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
```
Login route. Om email och/eller password inte skrivs. Om emailen eller lösernordet är fel så kommer felkåd returnas (säger inte om email är rätt för säkerhets skäll). Om allt går bra kommer en session skappas på servern och cookien kommer skickas till clienten.
```js
app.post("/logout", auth, (req,res)=>{

    req.session.destroy((err)=>{
        if(err){
            return res.status(500).json({ success:false, message: "Logout failed"});
        }
    res.clearCookie('connect.sid');
    res.status(200).json({success:true,message:"Logout success"})

    });
})
```
Logout route. Raderar sessionen på servern och skickar till clienten att sessionen är borta med res.ckearCookie
```js
app.get("/me", async (req,res)=>{

    if(!req.session.user){
        return res.status(401).json({loggedIn: false});
    }
    res.json({
        loggedIn: true,
        user: req.session.user
    });
});
```
Route för att kolla om man har en session. Om man inte har en session kommer man inte åt routes med auth middleware. 
***
## Client

### Render client till index.html
```jsx
ReactDOM.createRoot(document.querySelector("#app")).render(<App></App>)
```
Renderar all html i App till diven med #app i index.html.
### App react objekt
```jsx
function App(){

    const [prods,setProds] = React.useState([]);
    const [user, setUser] = React.useState(null);


    React.useEffect(()=> {
        async function checkLogin() {
            try {
                const res = await fetch("/me", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();

                if(res.ok && data.loggedIn) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Session check failed", err);
            }
            
        }
        checkLogin();
    }, []);

```
React component med useState react hooks så när prods och/eller user ändras med set funktionerna så kommer App renderas igen. UseEffect körs beroende på dependency arrayen och eftersom den är tom så körs den bara första gången den renderas. checklogin körs en gång(när sidan laddasom) och kollar /me om andvändaren är inloggad
```jsx

    return(
        <>
        <Header user={user} setUser={setUser}></Header>
        <main>
            {!user?(
                <div>
                <Loginuser setUser={setUser}></Loginuser>
                <Register></Register>
                </div>
            ):(
                <div>
                <CreateProduct setProds = {setProds}></CreateProduct>
                <Products prods = {prods} setProds = {setProds} user = {user}></Products>
                </div>
            )}
            
            
            
            
            
        </main>
        
        
        </>
    )
};
```
Jsx med alla react komponenter. När det står tex user={user} betyder det att user skickas in i komponenten för att kunna andvändas där

## Header komponent
```jsx
function Header({user,setUser}){

    async function logout(){
        try {
            const res = await fetch("/logout", {
                method: "POST",
                credentials: "include"
            });
            const data = await res.json();
            if(res.ok){
                console.log(data.message)
                setUser(null);
                
            } else{
                console.error("Server logout failed", data.message);
            }
        } catch(error){
            console.error("Logout error:", error);
        }
    }
    return(
        <header>
            <nav>
                <a href="#home">HOME</a>
                {user && <button onClick={logout}>logout</button>}
            </nav>
        </header>
    )
};
```
Skickar in user och setUser. logout funktionen skickar vilken user som vill logga ut och får en response från servern om det gick eller inte. Om det gick så kommer Header renderas om och logout inte vissas.

```jsx
function Register(){
 
    const [message, setMessage] = React.useState(""); //skapar ett medddelande under
    async function saveAccount(event){
 
        event.preventDefault(); //stoppar webbsidan från att reload
 
 
        const account = {
            email: event.target.email.value,
            password: event.target.password.value
        };
 
 
        const res = await fetch("/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(account)
        });
 
 
        const data = await res.json();
 
 
        if (!data.success) {
            setMessage(data.message || "Registration failed");
            return;
        }
       
        setMessage("Registration successful.");
        event.target.email.value = "";
        event.target.password.value = "";
    }
 
    return(
 
        <div id="register" className="content">
            <h2>Register</h2>
            <h3 className="errorMessage">{message}</h3>
            <form onSubmit={saveAccount}>
                <input type="text" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Create Account</button>
            </form>
           
        </div>
    )
}
```
SaveAccount funktionen tar emot ett event som är själva register formen. event.preventDefault gör att inte sidan laddas om när formen  submitas.  skickar account till /register. Om responsen är bra så ändras message med setMessage till Registration successful och form inputsen blir en tom sträng annars blir message Registration failed. 

```jsx
function Loginuser({setUser}){
    const [message, setMessage] = React.useState("");
    async function login(event){

        event.preventDefault();

        const user = {
            email:event.target.email.value,
            password:event.target.password.value
        };

        const res = await fetch("/login", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(user),
            credentials: "include"
        });
        
        const data = await res.json();
        if(!res.ok){
            setMessage(data.message || "Login failed");
            return
        }
        setUser(data.user);
        setMessage("Login successful!");
        console.log("loggin in user",data.user.userid);

        event.target.email.value = "";
        event.target.password.value = "";
    }
    return(
        <div id="login" className="content">
            <h2>Login</h2>
            <form onSubmit={login}>
                <input type="text" name="email" placeholder="Email" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="submit" value="login" />
            </form>
            {message && <p>{message}</p>}
        </div>
    )
}
```
login funktionen tar emot ett event. user är formens inputade values. Skickar vilken user som vill logga in. credentials include gör att browser sparar cookien som servern skickar. Om det är en felkod i data så kommer message bli Login falied annars blir message Login successful! och setUser useState funktionen körs för att ändra på user. om message är något så vissar message annars vissas inget.

```jsx
function CreateProduct({setProds}){
    const [loading, setLoading] = React.useState(false);

    async function saveProduct(event){
        event.preventDefault();

        const confirm = window.confirm("Create this product?")
        if(!confirm) return;
        setLoading(true);
        try{

            const product = {
            name:event.target.name.value,
            description:event.target.description.value,
            price:event.target.price.value
        }
        
        const res = await fetch("/data", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(product),
            credentials: "include"
        })
        
        const data = await res.json();

        if(res.ok)
            setProds(prev=>[...prev, data.product])
            event.target.reset();
         console.log("status", res.status, data.message);

        }

        catch(err){
            console.error("Failed to create product", err);
        }

        finally{

            setLoading(false);
        } 
    }
    return(
        <div className="create">
            <form onSubmit={saveProduct} action="/data" method="post">
                <input type="text" name="name" placeholder="Name"/>
                <input type="text" name="description" placeholder="Description"/>
                <input type="number" name="price" placeholder="Price" />
                <input type="submit" value={loading ? "Saving..." : "Save"} disabled={loading}/>
            </form>
        </div>
    )
}
```
loading usestate så man inte kan göra produkter när en redan görs. window.confirm blir false eller true beroende på vad usern väljer i konfarmationen. loading sets till true. product blir till värderna i formet. Skickar product till servern som skickar tillbaka en respons som är bra eller dålig samt produkten. Om responsen är ok så mappar den alla producter med den nya produkten i slutet. event.targer.reset() gör så inerhållet i formen försvinner. loading sets till false vilket gör att saving... slutas vissas och knappen funkar igen.

```jsx
function ProductCard({product, setProds, user}){
    const [edit, setEdit] = React.useState(false)
    const isOwner = user && product.owner == user.userid;

    function toggleEdit(){
        setEdit(prev=>!prev)
    }

    async function delProd(){

        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if(!confirmed) return;
        const res = await fetch("/data/"+product.id,{
            method: "DELETE",
            credentials: "include"
        });

        
        const data = await res.json();
        
        if(res.ok)
            setProds(prev=> prev.filter(p=>p.id!=product.id));
        
        console.log("status", res.status, data.message)
    }


    return(
        <div className="product" >
            <div className="container1">
                <h3>{product.name}</h3>
                <h4>{product.price}</h4>
                <p>{product.description}</p>
                {isOwner && (
                    <div>
                        <button onClick={delProd}>Delete</button>
                        <button onClick={toggleEdit}>Edit</button>
                    </div>
                )}   
            </div>
            <div className="container1">
                {edit && isOwner ? (
                    <EditProduct product = {product} setProds={setProds} toggleEdit={toggleEdit}></EditProduct>
                )  : ""}  
            </div>
        </div>
    )
}
```
isOwner blir true om både en user är inloggad och product.owner är samma som user.userid(båda måste stämma). toggleEdit gör Edit till false om true och true om false för att kunna toggla edit menyn. delProd skickar en delete request till servern som inerhåller sessionen så servern vet om usern är ägaren. Om responsen är ok så tas produkten väck på clientsidan med setProds. Om usern äver produkten så kommer delete och edit knappar renderas. Om edit är true och och ägaren är inloggad så kommer EditProduct vissas.
```jsx
function EditProduct({product, setProds, toggleEdit}){

    const [loading, setLoading] = React.useState(false);

    async function EditProdFunc(event){

        event.preventDefault();

        const confirm = window.confirm("Save changes to this product?");
        if(!confirm) return;
        setLoading(true);
        try{
            const updatedProduct = {
            name: event.target.name.value || product.name,
            description: event.target.description.value || product.description,
            price: event.target.price.value || product.price
        };

        const res = await fetch("/data/"+product.id,{
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(updatedProduct),
            credentials: "include"
        });

        const data = await res.json();

        console.log("status", res.status, data.message);
        if(res.ok){
            setProds(prev=>
                prev.map(p=>
                    p.id==product.id?{...p, ...updatedProduct}: p
                )
            );
            toggleEdit();
        }
        }
        catch(err){
            console.error(err);
        }
        finally{
            setLoading(false);
        }
        
    }

    return(
        <div className="EditDiv">
            <form onSubmit={EditProdFunc}>
                <input type="text" name="name" defaultValue={product.name} />
                <input type="text" name="description" defaultValue={product.description} />
                <input type="number" name="price" defaultValue={product.price} />
                <input type="submit" value={loading? "Saving...": "Save"} disabled={loading}/>
            </form>
        </div>
    )
}
```
updatedProduct är det som är skrivet i formen. Skickar en put request till servern med updatedProduct och sessionen. Om responsen från servern är ok mapas en array som den updaterade produkten är inkluderad i. Detta körs med setProds.

```jsx
function Products({prods,setProds, user}){

    const [loading,setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    

    React.useEffect(()=>{
            getProds();
        },[user])

    async function getProds() {

        setLoading(true)

        try{

            const res = await fetch("/data", {
            credentials: "include"
        });
        const data = await res.json();
        setProds(data)

        }
        catch(err){
            console.error("Failed to fetch products", err);
        }

        finally{
            setLoading(false);
        }
    
    }
    const filteredProducts = prods.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    );

    return(
        <div id = "products" className="content">
            <h1>PRODUCTS</h1>
            
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}/>
                {loading && <p>Loading products...</p>}
                {filteredProducts.map(p=>(<ProductCard setProds = {setProds} product={p} key={p.id} user={user}></ProductCard>))}
        </div>
    )
}
```
getProds körs varje gång usern uppdateras (loggar in/ut) för att se till att produkterna är updaterade. När getProds körs så sätts setLoading till true så att en loading.. vissas under sök. filteredProducts innerhåller alla produkter vars beskrivning eller namn är includerat i det usern söker på (det som står i searchterm). filteredProducts renderas varje gång som searchTerm ändras eftersom det är  reactuseState. Search inputen ändrar det som är i searchTerm genom setSearchTerm. Produkterna i filteredProducts mapas vilket returnerar en array med alla produkter i filteredProducts som renderas med ProductCard.
***
## Funktioner/Middlewares
```js
function getData(fileName){
 return   new Promise( (resolve, reject)=>{
        fs.readFile(fileName,(error,data)=>{
            if(error) reject(error.message);
        resolve(JSON.parse(data.toString()));
    });
    });
};
```
Tar datan från filen med promise.

```js
function saveData(data,fileName){
    return  new Promise((resolve, reject)=>{
        fs.writeFile(fileName,JSON.stringify(data,null,3),(error)=>{
            if(error) reject(error.message);
            resolve();
        });
    });    
};
```
Skriver data till filen med promise.

```js
function auth(req,res,next){
    if(!req.session.user){
        return res.status(401).json({success: false, message: "unauthorized"});
    }
    next();
}
```
Kollar om andvändaren har en session och om inte så returnas ett error

```js
async function owner(req,res,next){

    const id = req.params.id;
    const products = await getData("data.json")
    const product = products.find(p=>p.id==id);
    if(!product){
        return res.status(404).json({success:false,message:"Product not found"});
    }
        
    if(product.owner != req.session.user.userid){
        return res.status(403).json({success: false, message: "Forbidden: You dont own this product"});
    }
    next();
}
```
Kollar om andvändaren är ägaren av produkten om inte returnas ett error

```js
async function logger(req,res,next){
    try{

    const userId = req.session.user ? req.session.user.userid : "guest";

    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip;

    const newLog = `${timestamp} ${method} ${url} - User: ${userId} - IP: ${ip}`

    let allLogs = await getData("logs.json") || [];

    allLogs.push(newLog);

    if(allLogs.length > 200){
        allLogs.splice(0,allLogs.length - 200);
    }
    await saveData(allLogs, "logs.json");

    next();
    }

    catch(err){
        console.error("Logger error:", err);
        next();
    }
}
```
Loggar allt som andvändare gör med ip, tid, urlen, method och userid for att spara vad olika users gjort. Dessa logs savas till logs.json. Om allLogs är längre än 200 så kommer den äldsta loggen raderas.