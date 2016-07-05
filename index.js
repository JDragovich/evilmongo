var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var cryptography = require('crypto');

var connection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/evilmongo', function(error){
    if(error){
        console.log(error);
    }
});

var models = require('./modules/models.js')(mongoose); //DB models
var tokenDecoder = require('./modules/tokenDecoder.js'); //token decoder
var createGame = require('./modules/createGame.js')(models); //game creation and management
var gameControl = require('./modules/gameControl.js')(models); //game control

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));


//API layer

//Authenticate user and pass back web token.
app.post('/login', function(request, response) {
    console.log("login attempt from " + request.body.username);
    models.User.findOne({email:request.body.username},function(err,user){
        if(!user){
            console.log(request.body.username + " not found")
            response.status(400).json({sucess:false,message:'no user with that name found!'});
        }
        else{
            var passHash = cryptography.createHash('md5').update(user.salt + request.body.password).digest("hex");

            if(passHash === user.password){
                console.log("login from " + request.body.username + " successful");

                var rawToken = {
                    userID:user.email,
                    expiresInMinutes: 15
                }

                var token = jwt.sign(rawToken,'thisismysecret');

                response.json({
                    sucess:true,
                    message:'login successful',
                    token:token,
                    userID:user.email,
                    firstName:user.firstName,
                    expires: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
                });
            }
            else{
                console.log("login from " + request.body.username + " failed");
                response.status(401);
                response.json({sucess:false, message:'invalid password!'});
            }
        }
    });
});

//register new user
app.post('/register', function(request, response) {
    console.log("login attempt");
    //generate salt for password storeage
    cryptography.randomBytes(32, function(err, buffer) {
        var saltString = buffer.toString('hex');
        console.log("saltString: " + saltString);

        //hash salt and password for storeage in teh DB
        var hash = cryptography.createHash('md5').update(saltString + request.body.password).digest("hex");
        console.log("hash: " + hash);

        var user =  new models.User({
            firstName:request.body.firstName,
            lastName:request.body.lastName,
            username:request.body.username,
            email:request.body.email_address,
            salt:saltString,
            password:hash
        });

        user.save(function(err){
            if(err){
                console.log(err);
                var error = 'Somthing bad happened!';
                if(err.code === 11000){
                    error = 'email already exists!';
                }
                response.status(401);
                response.json({sucess:false, message:error});
            }
            else{
                console.log("success!");
                response.json({sucess:true, message:'account created'});
            }
        });
    });

});

//router for protected api endpoints
app.use('/api',tokenDecoder.decoder);

app.get('/api/v1/test',function(request,response){
    response.send('Yes it works');
});

//get all games that a player is not a prt of already
app.get('/api/v1/getallgames',function(request,response){
    models.Game.find({"players.user":{$ne:request.user}},function(err,games){
        response.json(games);
    });
});

//get all games that teh current user is a part of.
app.get('/api/v1/getplayergames',function(request,response){
    models.Game.find({"players.user":request.user},function(err,games){
        if(err){console.log(err)}
        response.json(games);
    });
});

app.get('/api/v1/getgame/:id',function(request,response){
    var getCurrentPlayer = function(players){
        for(var i=0; i<players.length; i++){
            if(players[i].user === request.user){
                return players[i];
            }
        }
    };

    models.Game.findOne({_id:request.params.id},function(err,game){
        if(err){console.log(err)}
        response.json({game:game, playerInfo:getCurrentPlayer(game.players)});
    });
});

app.post('/api/v1/creategame',createGame.createGame);
app.post('/api/v1/addplayer',createGame.addPlayer);

app.post('/api/v1/endTurn',gameControl.endTurn);
app.post('/api/v1/buyproperty',gameControl.buyProperty);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
