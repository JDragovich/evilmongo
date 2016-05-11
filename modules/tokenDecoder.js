var jwt = require('jsonwebtoken');

module.exports={
    decoder:function(request,response,next){
    var token = request.body.token || request.query.token || request.headers['x-auth-token'];
    if(token){
        jwt.verify(token,'thisismysecret',function(err,decode){
            if(err){
                return response.status(403).json({sucess:false, message:'could not authenticate token'})
            }
            else{
                request.user = decode.userID;
                request.firstName = decode.firstName;
                next();
            }
        });
    }
    else{
        response.status(403).send({
            sucess:false,
            message:'no token!!!'
        });
    }
}
}
