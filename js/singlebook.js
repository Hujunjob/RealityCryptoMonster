var request = decodeURI(location.search);
var bookid = request.substr(1);
console.log("id="+bookid); 

showProgress("正在从区块链拉取文章中...");

getWalletInfo(function(suc,res){

});

var book;
if(bookid){
    getBookInfo(bookid);
}

/*
        this.id = "";
        this.title = "";
        //简介
        this.abstract = "";
        //作者
        this.author = "";
        this.chapterlist = new Array();
        //已完成章节数
        this.chaptercount = 0;
        //是否完结
        this.finished = false;
        //图片地址
        this.picture = "";
        //字数统计
        this.wordsize = 0;
        this.timestamp = 0;
*/
function getBookInfo(id){
    getInfo("getBook",JSON.stringify([id]),function(result){
        console.log("getBook="+JSON.stringify(result));
        initBook(result);
    });
}


function initBook(book){
    this.book = book;
    hui("#bookname").html(book.title);
    var author = book.author;
    hui("#author").html(author);
    getUser(author);
    hui("#chaptercount").html(book.chaptercount);
    hui("#forks").html(book.forks.length);

    hideProgress();
    var list = book.chapterlist;
    for(var i=0;i<list.length;i++){
        var cpid = list[i];
        getChapter(cpid);
    }
}

function getUser(id){
    getInfo("getUserAccount",JSON.stringify([id]),function(result){
        hui("#author").html(result.name);
    });
}


function getChapter(id){
    getInfo("getChapterInfo",JSON.stringify([id]),function(result){
        var count = result.count;
        var price = parseFloat(result.price);
        var priceint = price;
        if(price==0){
            price = "免费";
        }else{
            price = price+"Nas";
        }
        var title = result.title;
        var id = result.id;
        var html = "<li><a onclick='readChapter(\""+id+"\","+priceint+");'><div class='hui-list-text'><div class='hui-list-text-content'>第"+count+"章："+title+"</div><div class='hui-list-info'>"+price+"<span class='hui-icons hui-icons-right'></span></div></div></a></li>";
        var old = hui("#chapters").html();
        hui("#chapters").html(old+html);
    });

}

function readChapter(id,price){
    console.log("readChapter "+id+",price="+price);
    window.location.href = "chapter.html?"+id;
}


/*
this.count = 0;
        this.id = "";
        //该作品所属的书名
        this.bookname = "";
        //收费多少，为0是不收费
        this.price = 0;
        //本章题目，可以为空
        this.title = "";
        //本章内容
        this.content = "";
        //本章阅读数
        this.readednum = 0;
        this.wordsize = 0;
        this.timestamp = 0;
        this.author = "";
*/

function edit(){
    if(!wallet_address){
        toast("没有刷新到你的钱包地址，请重试");
        return;
    }
    if(!wallet_address === book.author){
        toast("你不是本文作者，无权修改");
    }else{
        window.location.href = "editpage.html?"+book.id;
    }

}

function save(){
    uploadToWallet("followBook",JSON.stringify([book.id]),0,function(suc,res){
        if(suc){
            toast("收藏成功");
        }else{
            toast("收藏失败："+res);
        }
    });
}

function fork(){
    uploadToWallet("fork",JSON.stringify([book.id]),0,function(suc,res){
        if(suc){
            toast("fork成功");
        }else{
            toast("fork失败："+res);
        }
    });
}

