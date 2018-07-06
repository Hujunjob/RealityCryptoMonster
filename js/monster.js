getWalletInfo(function(suc,res){
    if(suc){
        getTokenInfo();
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