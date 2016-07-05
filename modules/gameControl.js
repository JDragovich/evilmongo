module.exports = function(models){
    var methods = {};
    var internal = {};

    internal._rollDice = function(){
        var die1 = Math.ceil(Math.random() * 6);
        var die2 = Math.ceil(Math.random() * 6);
        return{
            roll:die1+die2,
            double:die1 === die2
        }
    };

    internal._resolveSpace = function(){

    };

    internal._circularIncrement = function(array,current,increm){
        return (current + increm) % array.length;
    };
    //transfer property between players
    internal._transfer = function(player1,lot1,player2,lot2){
        var transfer = function(giver,taker,item){
            if(typeof item === "object"){
                if(item.owner === giver.user){
                    item.owner = taker.user;
                    return item;
                }
                else{
                    return false
                }
            }
            else if(typeof item === "number"){
                if(giver.money >= item){
                    if(typeof giver === "object"){ giver.money -= item };
                    if(typeof taker === "object"){ taker.money += item };
                    return true;
                }
                else{
                    return false
                }
            }
            else{
                return false;
            }
        };

        //loops through lots and makes changes
        var loopTrans = function(giver,taker,lot){
            if(Array.isArray(lot) === false){
                lot = transfer(giver,taker,lot);
            }
            else{
                for(var i=0; i<lot.length; i++){
                    lot[i] = transfer(giver,taker,lot);
                }
            }
        };

        //loops through lots and makes changes
        var loopSave = function(lot){
            if(Array.isArray(lot) === false){
                lot.save();
            }
            else{
                for(var i=0; i<lot.length; i++){
                    lot[i].save();
                }
            }
        };

        //go through lots and make changes
        loopTrans(player1,player2,lot1);
        loopTrans(player2,player1,lot2);

        //now save it all
        player1.save();
        player2.save();
        loopSave(lot1);
        loopSave(lot2);

    };

    methods.endTurn = function(request,response){
        //code resuse here. need to make this some sort of middleware. dont know how to do that.
        var getCurrentPlayer = function(players){
            for(var i=0; i<players.length; i++){
                if(players[i].user === request.user){
                    return players[i];
                }
            }
        };

        var onGameChanged = function(err,game){
            if(err){console.log(err)}

            response.json({message:"turn ended",game:game, playerInfo:getCurrentPlayer(game.players)});
        }

        models.Game.findOne({_id:request.body.game,"players.user":request.user},function(err,game){
            if(game.players[game.turn].user === request.user){
                var roll = internal._rollDice();
                var space = game.players[game.turn].space;

                game.players[game.turn].space = internal._circularIncrement(game.board,space,roll.roll);

                if(!roll.double){
                    console.log("new turn")
                    game.turn = internal._circularIncrement(game.players,game.turn,1);
                }
                game.save(onGameChanged);
            }
            else{
                console.log("no its noth this players turn");
            }
        });
    };

    methods.buyProperty = function(request,response){
        
        models.Game.findOne({'players.user':request.user},{'players.$':request.user},function(err,user){
            internal._transfer(user,request.body.property.value[0],"Bank",request.body.property);
        });
    };

    return methods;
}
