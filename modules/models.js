module.exports = function(mongoose){
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var models = {}

    //data models for the DB
    models.User = mongoose.model('User', new Schema({
        id:ObjectId,
        firstName: String,
        lastName: String,
        email: {type:String, unique:true},
        salt:String,
        password:String
    }));

    models.Game = mongoose.model('Game', new Schema({
        id:ObjectId,
        name:{type:String, unique:true},
        players:[{
            user:String,
            money:Number,
            space:Number,
            cards:[{type:String}],
            stock:Number //total number of stocks issued.
        }],
        turn:Number,
        started:{type:Boolean, defualt:false},
        board:[{
            category:{type:String,enum:['Chance','Property','Go','Jail','Go To Jail','Free Parking','Railroad','Community Chest','Utility','Tax']},
            name:String,
            color:String,
            owner:{type:String,default:"Bank"},
            developable:Boolean,
            value:[{type:Number}],
            houses:Number,
            buildingCost:Number,
            stock:Number //total number of stocks issued.
        }]//array of objects that reresent the spaces.
    }));

    //any long term debt
    models.Debt = mongoose.model('Debt', new Schema({
        id:ObjectId,
        game:{type:mongoose.Schema.Types.ObjectId,ref:'Game'},
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'Player'},
        debtor:{type:mongoose.Schema.Types.ObjectId,ref:'Player'},
        stock:Number, //total number of stocks issued.
        principal:Number, //total principal in dollars
        interest:Number, //interst rate as decimal
        term:Number, //loan term in game turns
        maturity:Boolean //loan or bond?
    }));

    //any piece of anything.
    models.Equity = mongoose.model('Equity', new Schema({
        id:ObjectId,
        parentObject:{type:mongoose.Schema.Types.ObjectId}, // until i figure out a better way there is no type restriction on what a stock ca reference
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'Player'},
        lastSoldPrice:Number
    }));

    return models;
}
