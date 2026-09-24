const jwt = require('jsonwebtoken');

const protect = (req,res,next)=>{
  try{
    //get token from header.
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
      return res.status(401).json({message: 'No token, Access Denied!'});
    }

    //Extract just the token (only cut 'Bearer' part).
    const token = authHeader.split(' ')[1];

    //verify token
    const decode = jwt.verify(token,process.env.JWT_SECRET);
    console.log(decode);
    //Attach user info to the request.
    req.user = decode;

    //move to the actual route
    next();

  }catch(error){
    res.status(401).json({message:'Token is not valid'});
  }
};

const adminOnly = (req,res,next)=>{
  if(req.user.role !== 'admin'){
    return res.status(403).json({message:'Access denied! Admin Only'});
  }

  next();
};

module.exports = {protect, adminOnly};