ReactDOM.createRoot(document.querySelector("#app")).render(<App />)

function App(){

    return(
        <>
        <Header></Header>
        <Products></Products>
        
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


function ProductCard({prod}){

    function delProd(){
        setProds(prev=>prev.filter(p=>p.id!=id));
    }


    return(
        <div>

            <h3>{prod.name}</h3>
            <p>{prod.description}</p>
            <button onClick={delProd}>Delete</button>


        </div>
    )
}

function Products(){

    
    const [prods,setProds] = React.useState([])

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

            {prods.map(p=> <ProductCard prod={p} key={p.id}></ProductCard>)}
        </div>
    )
};