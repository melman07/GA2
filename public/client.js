ReactDOM.createRoot(document.querySelector("#app")).render(<App></App>)

function App(){

    const [prods,setProds] = React.useState([])

    return(
        <>
        <Header></Header>
        <main>
            <CreateProduct></CreateProduct>
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


function CreateProduct(){

    
}


function ProductCard({product, setProds}){

    async function delProd(){
        
        const res = await fetch("/data/"+product.id,{
            method: "DELETE"
        });

        if(res.status == 200)
            setProds(prev=> prev.filter(p=>p.id!=product.id));

    }


    return(
        <div className="product" >

            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <button onClick={delProd}>Delete</button>


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