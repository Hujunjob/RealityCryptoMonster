
showProgress("正在获取链上信息...");

getWalletInfo(function(suc,res){
    if(suc)
    getUserInfo();
});


/*
        this.address = "";
        this.name = "";
        this.avatar = "";
        this.abstract = "";
        this.books = new Array();
        this.bookcase = new Array();
        this.followers = new Array();
        this.followings = new Array();
        this.timestamp = 0;
*/

function getUserInfo(){
    getInfo("getUserAccount",JSON.stringify([wallet_address]),function(result){
        // var user = JSON.parse(result);
        hideProgress();
        var address = result.address;
        if(address.length>1){
            hui("#div_no_register").hide();
            hui("#user_div").show();
            initPage(result);
        }
    });
}

function initPage(user){
    hui("#follownum").html(user.followings.length);
    hui("#booknum").html(user.bookcase.length);
    hui("#followernum").html(user.followers.length);
    hui("#mybooknum").html(user.books.length);
    hui("#username").html("用户名："+user.name);
    var books = user.books;
    console.log("book id="+books[0]);
}