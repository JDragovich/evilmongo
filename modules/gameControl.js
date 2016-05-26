module.exports = function(models){
    var methods = {};
    var internal = {};

    internal._rollDice = function(){
        var die1 = Math.ceil(Math.random() * 6);
        var die2 = Math.ceil(Math.random() * 6);
        console.log(die1+die2)
        return{
            roll:die1+die2,
            double:die1 === die2
        }
    };

    internal._resolveSpace = function(){

    };

    internal._circularIncrement = function(array,current,increm){
        if(array.length === 1 || array.length === 0){
            return 0
        }
        else if(current + increm >= array.length -1){
            return (current + increm) - (array.length -1)
        }
        else{
            return current + increm
        }
    };

    methods.endTurn = function(request,response){
        var onGameChanged = function(err,game){
            if(err){console.log(err)}

            response.json({message:"turn ended",game:game});
        }

        models.Game.findOne({_id:request.body.game,"players.user":request.user},function(err,game){
            if(game.players[game.turn].user === request.user){
                var roll = internal._rollDice();
                var space = game.players[game.turn].space;

                game.players[game.turn].space = internal._circularIncrement(game.board,space,roll.roll);

                if(!roll.double){
                    game.turn = internal._circularIncrement(game.players,game.turn,1);
                }
                game.save(onGameChanged);
            }
            else{
                console.log("no its noth this players turn");
            }
        })
    }

    return methods;
}
