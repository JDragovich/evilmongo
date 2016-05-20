module.exports = function(models){
    var fs = require("fs");
    var methods = {};
    var names = [];
    fs.readFile('streetNames.txt','utf8',function(err,data){
        names = data.split("\n");
    });

    var nameHash = {};

    methods.generateBoard = function(numMonops,game,callback){
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

                    var property = models.Property({
                        name:"Railroad",
                        game:game._id,
                        owner:undefined,
                        developable:false,
                        value:[200],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    });

                    property.save();

                    return {
                        category:type,
                        name:"Railroad",
                        property:undefined
                    }
                }
                else if(type === "Utility"){

                    var property = models.Property({
                        name:"Utility",
                        game:game._id,
                        owner:undefined,
                        developable:false,
                        value:[100],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    });

                    property.save();

                    return {
                        category:type,
                        name:"Utility",
                        property:undefined
                    }
                }
                else if(type === "Property"){

                    var spaceName = pickName();

                    var property = models.Property({
                        name:spaceName,
                        game:game._id,
                        owner:undefined,
                        developable:true,
                        value:[val],
                        houses:0,
                        buildingCost:50,
                        stock:0
                    });

                    property.save();

                    return {
                        category:type,
                        name:spaceName,
                        color:color,
                        property:property._id
                    }
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

    return methods;
};
