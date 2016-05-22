module.exports = function(models){
    var fs = require("fs");
    //exported methods
    var methods = {};

    //internal methods
    var internal = {};

    var time = 0; //time variable for timiming requests
    var names = [];
    fs.readFile('streetNames.txt','utf8',function(err,data){
        names = data.split("\n");
    });

    var nameHash = {};

    internal._generateBoard = function(numMonops,game){
        var boardArray = [];
        var properties = [];
        var cornerSpace = ['Go','Jail','Free Parking','Go To Jail'];

        //space generator. Creates a singlton instance that randomly chooses from the arguments passed.
        var SpaceGenerator = function(spaceColor,baseVal){
            var genSpace = function(){
                var color = spaceColor;
                var val = baseVal;
                var type = arguments[Math.floor(Math.random() * arguments.length)];

                if(type === "Railroad"){

                    return {
                        category:type,
                        name:"Railroad",
                        owner:undefined,
                        developable:false,
                        value:[200],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    };

                }
                else if(type === "Utility"){

                    return {
                        category:type,
                        name:"Utility",
                        owner:undefined,
                        developable:false,
                        value:[100],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    };

                }
                else if(type === "Property"){

                    var spaceName = pickName();

                    return {
                        category:type,
                        name:spaceName,
                        owner:undefined,
                        developable:true,
                        color:color,
                        value:[val],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    };

                }
                else{
                    return {
                        category:type,
                        name:type,
                        property:undefined
                    }
                }
            };

            return genSpace;
        };

        var pickName = function(){
            for(var i =0; i<names.length; i++){
                var index = Math.floor(Math.random() * names.length);

                if(!nameHash[names[index]]){
                    nameHash[names[index]] = true;
                    return names[index];
                }
            }
        }

        for(var i =0; i<4;i++){
            var cornerGen = new SpaceGenerator();
            //add corner piece
            boardArray.push(cornerGen(cornerSpace[i]));

            //loop through all the monopolies per side and add spaces
            for(var j= 0; j<numMonops; j++){
                var color = '#'+Math.floor(Math.random()*16777215).toString(16); //random hex color
                var baseVal = 100 * i;
                var genSpace = new SpaceGenerator(color,baseVal); //spacegenerator instance

                boardArray.push(genSpace("Property"))
                boardArray.push(genSpace("Property"))
                boardArray.push(genSpace("Chance","Community Chest"))
                boardArray.push(genSpace("Property","Utility","Tax"))
                if(j !== numMonops - 1){
                    boardArray.push(genSpace("Railroad"))
                }
            }
        }
        return boardArray;
    };


    methods.createGame = function(request,response){
        console.log(request.user + " request that game "+ request.body.name + " be created" );
        console.log(request.body.name + " started");
        time = Date.now();

        //instantiate new game
        var game = new models.Game({
            name:request.body.name,
            started:false,
            board:internal._generateBoard(request.body.monopolies)
        });

        //when game is saved generate teh baord and resave
        game.save(function(err,savedGame){
            if(err){
                response.status(500).json({message:"Game Already Exists"})
            }
            else{
                time =( Date.now() - time) / 1000
                console.log(savedGame.name + " created successfully in " + time + " seconds");
                models.Game.find({"players.user":{$ne:request.user}},function(err,games){
                    response.json({message:savedGame.name + " created successfully", games:games});
                });
            }
        });
    };

    methods.addPlayer = function(request,response){
        var player = {
            user:request.user,
            money:1500,
            space:0,
            cards:[],
            stock:0 //total number of stocks issued.
        }
        models.Game.update({_id:request.body.game, 'players.user': {$ne: request.user}},{$push: {players: player}}, function(err,game){
            if(game.nModified !=0){
                response.json({message:request.user+" joined game", danger:false})
            }
            else{
                response.status(500).json({message:request.user+" could not join game", danger:true});
            }
        });
    };

    return methods;
};
