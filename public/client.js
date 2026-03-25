ReactDOM.createRoot(document.querySelector("#app")).render(<App></App>)

function App(){

    const [prods,setProds] = React.useState([]);
    const [user, setUser] = React.useState(null);


    React.useEffect(()=> {
        async function checkLogin() {
            try {
                const res = await fetch("/me");
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
            const res = await fetch("/logout", {method: "POST"});
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
            setMessage(data.error || "Registration failed");
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
            body:JSON.stringify(user)
        })
        
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

        <div>

            <form action="/login" onSubmit={login} method="post">
                <input type="text" name="email" placeholder="Email" required/>
                <input type="password" name="password" placeholder="Password" required/>
                <input type="submit" value="login" />

            </form>
            {message && <p>{message}</p>}
            
        </div>

    )
}




function CreateProduct({setProds}){

    async function saveProduct(event){
        event.preventDefault();

        const product = {
            name:event.target.name.value,
            description:event.target.description.value,
            price:event.target.price.value
        }
        
        const res = await fetch("/data", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(product)
        })
        
        const data = await res.json();
        console.log("status", res.status, data.message);
        /* if(data.error) return */
        if(res.ok)
            setProds(prev=>[...prev, data.product])
        

        

        
    }

    return(
        <div className="create">
            <form onSubmit={saveProduct} action="/data" method="post">
                <input type="text" name="name" placeholder="Name"/>
                <input type="text" name="description" placeholder="Description"/>
                <input type="text" name="price" placeholder="Price" />
                <input type="submit" value="Save" />
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
        
        const res = await fetch("/data/"+product.id,{
            method: "DELETE"
        });

        if(res.ok)
            setProds(prev=> prev.filter(p=>p.id!=product.id));

    }


    return(
        <div className="product" >
            <div className="container1">
                <h3>{product.name}</h3>
                <h4>{product.price}</h4>
                <p>{product.description}</p>
                {isOwner && (
                    <>
                        <button onClick={delProd}>Delete</button>
                        <button onClick={toggleEdit}>Edit</button>
                    </>
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

    async function EditProdFunc(event){

        event.preventDefault();

        const updatedProduct = {
            name: event.target.name.value || product.name,
            description: event.target.description.value || product.description,
            price: event.target.price.value || product.price
        };

        const res = await fetch("/data/"+product.id,{
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(updatedProduct)

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

    return(
        <div className="EditDiv">

            <form onSubmit={EditProdFunc}>
                <input type="text" name="name" defaultValue={product.name} />
                <input type="text" name="description" defaultValue={product.description} />
                <input type="number" name="price" defaultValue={product.price} />
                <input type="submit" value="Save"/>
            </form>
            
        </div>
    )
}

function Products({prods,setProds, user}){

    
    

    React.useEffect(()=>{
            getProds();
        },[])

    async function getProds() {

        const res = await fetch("/data");
        const data = await res.json();
        setProds(data)
        console.log(data);
    }

    return(
        <div id = "products" className="content">
            <h1>PRODUCTS</h1>

            {prods.map(p=> (<ProductCard setProds = {setProds} product={p} key={p.id} user={user}></ProductCard>))}
        </div>
    )
}