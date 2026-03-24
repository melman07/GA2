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
    if(!req.session.auth){
        return res.status(401).json({success: false, message: "unauthorized"});
    }
    next();

}

async function owner(req,res,next){
    const id = req.params.id

    const products = await getData("data.json")
    const product = products.find(p=>p.id==id);
    if(!product)
        return res.status(404).json({success:false,message:"Forbidden"});
    next();

}


module.exports = {getData,saveData,auth,owner}