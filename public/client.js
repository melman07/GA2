ReactDOM.createRoot(document.querySelector("#app")).render(<App></App>)

function App(){

    const [prods,setProds] = React.useState([])

    return(
        <>
        <Header></Header>
        <main>
            <Loginuser></Loginuser>
            <CreateProduct setProds = {setProds}></CreateProduct>
            <Products prods = {prods} setProds = {setProds}></Products>
            
        </main>
        
        
        </>
    )
};

function Header(){

    return(
        <header>
            <nav>
                <a href="#home">HOME</a>
            </nav>
        </header>
    )
};



function Loginuser(){

    function login(){



    }

    return(

        <div>

            <form action="/login"onSubmit={login} method="post">
                <input type="text" name="email" placeholder="Email" />
                <input type="text" name="password" placeholder="Password" />
                <input type="submit" value="login" />

            </form>
            
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


function ProductCard({product, setProds}){

    const [edit, setEdit] = React.useState(false)

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
                <button onClick={delProd}>Delete</button>
                <button onClick={toggleEdit}>Edit</button> 
            </div>
            <div className="container1">
                {edit ? <EditProduct product = {product} setProds={setProds}></EditProduct> : ""}
                
            </div>


        </div>
    )
}

function EditProduct({product, setProds}){

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
        

        }
    }

    return(
        <div className="EditDiv">

            <form onSubmit={EditProdFunc}>
                <input type="text" name="name" placeholder="Name"/>
                <input type="text" name="description" placeholder="Description"/>
                <input type="text" name="price" placeholder="Price" />
                <input type="submit" value="Save" />
            </form>
            
        </div>
    )
}

function Products({prods,setProds}){

    
    

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

            {prods.map(p=> (<ProductCard setProds = {setProds} product={p} key={p.id}></ProductCard>))}
        </div>
    )
}