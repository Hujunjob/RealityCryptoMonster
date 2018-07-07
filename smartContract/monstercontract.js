'use strict';

const KILL_FAIL = 0;
const KILL_SUC = 1;

var User = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.monsters = obj.monsters;
        //遇上过的monster
        this.repository = obj.repository;
        this.killMonsters = obj.killMonsters;
    }else{
        this.name = "";
        this.monsters = new Array();
        this.repository = new Array();
        this.killMonsters = {};
    }
}

User.prototype = {
    toString:function(){
        return JSON.stringify(this);
    },
    add:function(monsterId){
        this.monsters[this.monsters.length] = monsterId;
    },
    visit:function(monsterId){
        this.repository.forEach(element => {
            if(monsterId === element){
                return;
            }
        });
        this.repository[this.repository.length] = monsterId;
    },
    kill:function(monsterId,result){
        this.killMonsters[monsterId] = result;
    },
}

var Operator = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
        //创造者
        this.creator = obj.creator;
        this.url = obj.url;
        this.owner = obj.owner;
        //怪物数量，默认为1，即能杀死1次；-1为能杀死无数次
        //能杀死无数次的，如果主人余额里没钱了，则不能获得奖励了
        this.num = obj.num;
        this.price = new BigNumber(obj.price);
        //blood是需要杀死几次才能杀死，默认为1，即用户一次即可杀死
        this.blood = obj.blood;
        this.location = obj.location;
        this.marker = obj.marker;
        this.info = obj.info;
        this.killers = obj.killers;
    }else{
        this.id = "";
        this.name = "";
        this.owner = "";
        this.creator = "";
        this.url = "";
        this.num = 1;
        this.price = new BigNumber(0);
        this.blood = 1;
        this.location = "";
        this.marker = "";
        this.info = "";
        this.killers = new Array();
    }
}

Operator.prototype = {
    toString:function(){
        return JSON.stringify(this);
    },
    generate:function(name,owner,num,price,blood,location,marker,info){
        this.name = name;
        this.owner = owner;
        this.num = num;
        this.price = price;
        this.blood = blood;
        this.location = location;
        this.marker = marker;
        this.info = info;
    },
    //kill monster 
    //return 
    //-1:error , 1 :success , 0: fail
    kill:function(killer){
        if(this.num == 0){
            return -1;
        }
        //random kill
        var random = Math.random();
        if(random>0.5){
            return KILL_FAIL;
        }else{
            this.num = this.num - 1;
            this.killers[this.killers.length] = killer;
            return KILL_SUC;
        }
    }
}

var Allowed = function (obj) {
    this.allowed = {};
    this.parse(obj);
}

Allowed.prototype = {
    toString: function () {
        return JSON.stringify(this.allowed);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.allowed[key] = new BigNumber(data[key]);
            }
        }
    },

    get: function (key) {
        return this.allowed[key];
    },

    set: function (key, value) {
        this.allowed[key] = new BigNumber(value);
    }
}

var StandardToken = function () {
    LocalContractStorage.defineProperties(this, {
        _admin: null,
        _name: null,
        _symbol: null,
        _ratioCreator: 0,
        _ratioAdmin: 0,
        _decimals: null,
        _totalSupply: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        _price: {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        }
    });

    LocalContractStorage.defineMapProperties(this, {
        "balances": {
            parse: function (value) {
                return new BigNumber(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "allowed": {
            parse: function (value) {
                return new Allowed(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });

    LocalContractStorage.defineProperties(this,{
        "monsterNum":0,
        "monsterArray":new Array()
    });

    LocalContractStorage.defineMapProperties(this,{
        "users": {
            parse: function (value) {
                return new User(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
        "monsters": {
            parse: function (value) {
                return new Operator(value);
            },
            stringify: function (o) {
                return o.toString(10);
            }
        },
       
        "markers":null,
        "locations":null
    });
};

StandardToken.prototype = {
    init: function () {
        this._name = "RealityCryptoWorld";
        this._symbol = "RCT";
        this._decimals = 18 || 0;
        this._totalSupply = new BigNumber(100000000).mul(new BigNumber(10).pow(this._decimals));
        this._price = new BigNumber(0.0001).mul(new BigNumber(10).pow(18));
        var from = Blockchain.transaction.from;
        this._admin = from;
        this.balances.set(from, this._totalSupply);
        this.transferEvent(true, from, from, this._totalSupply);

        this._ratioAdmin = 0.001;
        this._ratioCreator = 0.01;
    },
    addUser:function(name){
        var from = Blockchain.transaction.from;
        var user = this.users.get(from) || new User();
        user.name = name;
        this.users.put(from,user);
    },
    //generate:function(name,owner,num,price,blood,location,marker,info)
    addOperator:function(name,num,price,blood,location,marker,info){
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;

        num = parseInt(num);
        if(num == -1){
            this._checkAdmin();
        }

        var total = new BigNumber(price*num).mul(new BigNumber(10).pow(this._decimals));
        if(total.gt(this.balances.get(from))){
            this._throw("余额不足");
        }

        this.transfer(this._admin,total);
        var operator = new Operator();
        operator.generate(name,from,num,price,blood,location,marker,info);
        operator.id = hash;
        operator.creator = from;
        this.monsters.put(hash,operator);
        this.monsterNum = this.monsterNum+1;
        
        var oldarray = this.monsterArray || new Array();
        oldarray[oldarray.length] = hash;
        this.monsterArray = oldarray;

        this._addMarker(marker,hash);
        this._addLocation(location,hash);

        var user = this.users.get(from) || new User();
        user.add(hash);
        this.users.put(from,user);
    },
    //创造了一个怪物
    //包括怪物名、怪物信息、怪物模型ipfs地址
    generateMonster:function(name,info,url){
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;

        var monster = new Operator();
        monster.creator = from;
        monster.id = hash;
        monster.name = name;
        monster.info = info;
        monster.url = url;
        this.monsters.put(hash,monster);
    },
    //name,num,price,blood,location,marker,info
    putMonster:function(monsterId,num,price,blood,location,marker){
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;

        var monster = this.monsters.get(monsterId);
        if(!monster)this._throw("This monster is not exited");

        var name = monster.name;
        var info = monster.info;

        num = parseInt(num);
        if(num == -1){
            this._checkAdmin();
        }

        var total = new BigNumber(price*num).mul(new BigNumber(10).pow(this._decimals));
        if(total.gt(this.balances.get(from))){
            this._throw("余额不足");
        }

        this.transfer(this._admin,total);
        var operator = new Operator();
        operator.generate(name,from,num,price,blood,location,marker,info);
        operator.id = hash;
        this.monsters.put(hash,operator);

        this.monsterNum = this.monsterNum+1;
        
        var oldarray = this.monsterArray || new Array();
        oldarray[oldarray.length] = hash;
        this.monsterArray = oldarray;

        this._addMarker(marker,hash);
        this._addLocation(location,hash);

        var user = this.users.get(from) || new User();
        user.add(hash);
        this.users.put(from,user);
    },
    killMonster:function(monsterId){
        var from = Blockchain.transaction.from;
        var user = this.users.get(from) || new User();

        var monster = this.monsters.get(monsterId);
        if(!monster){
            this._throw("Can not find this monster");
        }

        user.visit(monsterId);
        this.users.put(from,user);

        var res = monster.kill(from);
        //-1:error , 1 :success , 0: fail
        if(res == -1){
            // return "该怪物已经死光灭绝了";
            return -1;
        }else if(res == KILL_FAIL){
            // return "战斗失败，你啥都没得到";
            return 0;
        }

        this._transferByAdmin(from,monster.price.times(1-this._ratioAdmin-this._ratioCreator));
        this._transferByAdmin(monster.creator,monster.price.times(this._ratioCreator));

        // return "战斗成功，你获得了"+monster.price+"奖励";
        return 1;
    },
    getMonsterNum:function(){
        return this.monsterNum;
    },
    getAllMonster:function(){
        return this.monsterArray;
    },
    getMonster:function(monsterId){
        return this.monsters.get(monsterId) || new Operator();
    },
    getUser:function(id){
        return this.users.get(id) || new User();
    },
    getLocation:function(location){
        return this.locations.get(location) || new Array();
    },  
    getMarker:function(marker){
        return this.markers.get(marker) || new Array();
    },
    buyToken:function(){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var num = value.dividedBy(this._price).mul(new BigNumber(10).pow(this._decimals));;
        this._transferByAdmin(from,num);
    },
    _addLocation:function(location,hash){
        var locations = this.locations.get(location) || new Array();
        locations[locations.length] == hash;
        this.locations.put(location,locations);
    },
    _addMarker:function(marker,monsterId){
        var markers = this.markers.get(marker) || new Array();
        markers[markers.length] = monsterId;
        this.markers.put(marker,markers);
    },
    _checkAdmin:function(){
        var from = Blockchain.transaction.from;
        if(!(from === this._admin)){
            this._throw("This operation is not permitted");
        }
    },
    _throw:function(error){
        throw new Error(error);
    },
    // Returns the name of the token
    name: function () {
        return this._name;
    },

    // Returns the symbol of the token
    symbol: function () {
        return this._symbol;
    },

    // Returns the number of decimals the token uses
    decimals: function () {
        return this._decimals;
    },

    totalSupply: function () {
        return this._totalSupply.toString(10);
    },

    balanceOf: function (owner) {
        var balance = this.balances.get(owner);

        if (balance instanceof BigNumber) {
            return balance.toString(10);
        } else {
            return "0";
        }
    },

    transfer: function (to, value) {
        value = new BigNumber(value);
        if (value.lt(0)) {
            throw new Error("invalid value.");
        }

        var from = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        if (balance.lt(value)) {
            throw new Error("transfer failed.");
        }

        this.balances.set(from, balance.sub(value));
        var toBalance = this.balances.get(to) || new BigNumber(0);
        this.balances.set(to, toBalance.add(value));

        this.transferEvent(true, from, to, value);
    },
    _transferByAdmin:function(to,value){
        value = new BigNumber(value);
        if (value.lt(0)) {
            throw new Error("invalid value.");
        }

        var from = this._admin;
        var balance = this.balances.get(from) || new BigNumber(0);

        if (balance.lt(value)) {
            throw new Error("transfer failed.");
        }

        this.balances.set(from, balance.sub(value));
        var toBalance = this.balances.get(to) || new BigNumber(0);
        this.balances.set(to, toBalance.add(value));

        this.transferEvent(true, from, to, value);
    },

    transferFrom: function (from, to, value) {
        var spender = Blockchain.transaction.from;
        var balance = this.balances.get(from) || new BigNumber(0);

        var allowed = this.allowed.get(from) || new Allowed();
        var allowedValue = allowed.get(spender) || new BigNumber(0);
        value = new BigNumber(value);

        if (value.gte(0) && balance.gte(value) && allowedValue.gte(value)) {

            this.balances.set(from, balance.sub(value));

            // update allowed value
            allowed.set(spender, allowedValue.sub(value));
            this.allowed.set(from, allowed);

            var toBalance = this.balances.get(to) || new BigNumber(0);
            this.balances.set(to, toBalance.add(value));

            this.transferEvent(true, from, to, value);
        } else {
            throw new Error("transfer failed.");
        }
    },

    transferEvent: function (status, from, to, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });
    },

    approve: function (spender, currentValue, value) {
        var from = Blockchain.transaction.from;

        var oldValue = this.allowance(from, spender);
        if (oldValue != currentValue.toString()) {
            throw new Error("current approve value mistake.");
        }

        var balance = new BigNumber(this.balanceOf(from));
        var value = new BigNumber(value);

        if (value.lt(0) || balance.lt(value)) {
            throw new Error("invalid value.");
        }

        var owned = this.allowed.get(from) || new Allowed();
        owned.set(spender, value);

        this.allowed.set(from, owned);

        this.approveEvent(true, from, spender, value);
    },

    approveEvent: function (status, from, spender, value) {
        Event.Trigger(this.name(), {
            Status: status,
            Approve: {
                owner: from,
                spender: spender,
                value: value
            }
        });
    },

    allowance: function (owner, spender) {
        var owned = this.allowed.get(owner);

        if (owned instanceof Allowed) {
            var spender = owned.get(spender);
            if (typeof spender != "undefined") {
                return spender.toString(10);
            }
        }
        return "0";
    }
};

module.exports = StandardToken;