const fs = require("fs")

function getData(fileName){
 return   new Promise( (resolve, reject)=>{
        fs.readFile(fileName,(error,data)=>{
            if(error) reject(error.message);
        resolve(JSON.parse(data.toString()));
    });
    });
};

function saveData(data,fileName){
    return  new Promise((resolve, reject)=>{
        fs.writeFile(fileName,JSON.stringify(data,null,3),(error)=>{
            if(error) reject(error.message);
            resolve();
        });
    });    
};

function auth(req,res,next){
    if(!req.session.user){
        return res.status(401).json({success: false, message: "unauthorized"});
    }
    next();

}

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



async function logger(req,res,next){

    const session = JSON.stringify(req.session.user) || "guest";

    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const userId = session.userId || session
    const ip = req.ip;

    console.log(`[${timestamp}] ${method} ${url} - User: ${userId} - IP: ${ip}`);

    newLog = `[${timestamp}] ${method} ${url} - User: ${userId} - IP: ${ip}`

    allLogs = await getData("logs.json")
    allLogs.push(newLog)
    await saveData(allLogs,"logs.json")


    next();
}

module.exports = {getData,saveData,auth,owner, logger}