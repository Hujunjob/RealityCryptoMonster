showProgress("正在从区块链拉取文章中...");
getInfo("getBookCount",null,function(result){
    console.log("getBookCount num="+result);
    getBooks(parseInt(result));
});

function getBooks(num){
    getInfo("getBooks",JSON.stringify([0,num]),function(result){
        console.log("getBooks"+JSON.stringify(result));
        var books = result.split(",");
        if(books.length==1){
            hideProgress();
        }
        for(var i=0;i<books.length-1;i++){
            getBook(books[i]);
        }
    });
}

function getBook(id){
    getInfo("getBook",JSON.stringify([id]),function(res){
        console.log("getBook"+JSON.stringify(res));
        addBook(res);
    });
}


function addBook(book){
    hideProgress();
    var name = book.title
    var abstract = book.abstract;
    var url = book.picture;
    if(!url)url = "img/save.png";
    var id = book.id;
    var html  ="<li><a href='singlebook.html?"+id+"'><div class='hui-media-list-img'><img height='80' src='"+url+"' /></div><div class='hui-media-content'><h1>"+name+"</h1><p>"+abstract+"</p></div></a></li>";
    var oldhtml = hui("#ulbooks").html();
    hui("#ulbooks").html(oldhtml+html);
}

