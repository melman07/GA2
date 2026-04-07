ReactDOM.createRoot(document.querySelector("#app")).render(<App></App>)

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
        /* if(res.ok){
            
        } */

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
       
        /* if(data.error) return */
        if(res.ok)
            setProds(p=>[...p, data.product])
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

function Products({prods,setProds, user}){

    const [loading,setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    

    React.useEffect(()=>{
            getProds();
        },[user]) //kör getProds när user ändras (loggar in)

    async function getProds() {

        setLoading(true)

        try{
            /* await new Promise(resolve => setTimeout(resolve, 1500)); */
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