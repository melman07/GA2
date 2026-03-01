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


module.exports = {getData,saveData, auth}