const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretKey = process.env.SESSION_SECRET; 

checkSession = (req,res,next) =>{
    if(req.session.userAddress && req.session.token){
        next()
    }
    res.redirect('/')
}


generateToken = (userAddress) => {
    const token = jwt.sign({ address: userAddress }, secretKey, { expiresIn: '1h' }); 
    return token;
}

addAuthorization = (req,res,next) =>{
    if(req.session.userAddress && req.session.token){
        next()
    }else if (req.query.token) {
        req.headers['Authorization'] = req.query.token
        next()
    }else{
        res.redirect('/')
        // res.status(401).json({message:"No Token Sent Or Found In Session"})
    }
}

verifyToken = (req, res, next) =>{
    if (req.session.userAddress && req.session.token){
        token = req.session.token
        userAddress = req.session.userAddress
        jwt.verify(token, secretKey, (err, decoded) => {
            if(err){
                res.redirect('/')
                // res.status(401).json({ success: false, message: 'Invalid token' });
            }
            next()
        })
    }else{
        const token = req.headers['Authorization'];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access Denied. Token Not Provided' });
        }
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.redirect('/')
                // return res.status(401).json({ success: false, message: 'Invalid token' });
            }
            req.session.userAddress = decoded;
            req.session.token = token
            next();
        });
    }
}


module.exports = {verifyToken,generateToken,addAuthorization,checkSession}