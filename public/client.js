ReactDOM.createRoot(document.querySelector("#app")).render(<App />)

function App(){

    return(
        <>
        <Header></Header>
        <Main></Main>
        
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


function Main(){
    return(
        <main>
            <div className="productsDiv">
                <h2>main</h2>
            </div>
        </main>
    )
};