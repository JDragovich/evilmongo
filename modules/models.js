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
        players:[{type:mongoose.Schema.Types.ObjectId,ref:'Player'}],
        board:{type:mongoose.Schema.Types.ObjectId,ref:'Property'}
    }));

    models.Player = mongoose.model('Player', new Schema({
        id:ObjectId,
        user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        game:{type:mongoose.Schema.Types.ObjectId,ref:'Game'},
        money:Number,
        space:Number,
        cards:[{type:String}],
        stock:Number //total number of stocks issued.
    }));

    //a physical property represetned on teh board.
    models.Property = mongoose.model('Property', new Schema({
        id:ObjectId,
        game:{type:mongoose.Schema.Types.ObjectId,ref:'Game'},
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'Player'},
        developable:Boolean,
        value:[{type:Number}],
        houses:Number,
        color:String,
        buildingCost:Number,
        stock:Number //total number of stocks issued.
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
