var price = 0.0001;

getWalletInfo(function(suc,res){
    if(suc){
        getTokenInfo();
        getUser();
    }
});

function getTokenInfo(){
    getInfo("name",null,function(res){
        console.log("name="+res);
    });
    
    getInfo("balanceOf",JSON.stringify([wallet_address]),function(res){
        console.log("balanceof "+wallet_address+":"+res);
    });

    
}


function buy(){
    var buynum = hui("#buynum").val();
    uploadToWallet("buyToken",null,price * buynum,function(suc,res){
        console.log("buyToken "+suc);
        // getTokenInfo();
    });
}

//addOperator:function(name,num,price,blood,location,marker,info){
function add(){
    var name = "刑天";
    var num = 1;
    var price = 0.001;
    var blood = 1;
    var location = "上海";
    var marker = "xt";
    var info = "上古大神";
    var json = JSON.stringify([name,num,price,blood,location,marker,info]);
    uploadToWallet("addOperator",json,0,function(suc,res){
        console.log("addOperator "+suc);
    });
}

var monsterId;

function getM(){
    //getMonster
    // var json  =JSON.stringify(["7270d3269fb463f05d2f03514eda553fe6c4c09540f6f82b12a910a26607e7f6"]);
    // getInfo("getMonster",json,function(res){
    //     console.log("getMonster="+JSON.stringify(res));
    // });
    getInfo("getMarker",JSON.stringify(["xt"]),function(res){
        console.log("getMarker="+JSON.stringify(res));
        monsterId = res[0];
    });
}

function getUser(){
    getInfo("getUser",JSON.stringify([wallet_address]),function(res){
        console.log("getUser "+JSON.stringify(res));
    })
}

function kill(){
    //killMonster:function(monsterId){
    uploadToWallet("killMonster",JSON.stringify([monsterId]),0,function(suc,res){
        console.log("killMonster:"+suc+",res="+res);
    });
}

function getAll(){
    getInfo("getAllMonster",null,function(res){
        console.log("getAllMonster "+res);
    });
}