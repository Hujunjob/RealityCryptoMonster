var request = decodeURI(location.search);
var bookid = request.substr(1);
console.log("id="+bookid); 
var book;

getInfo("getBook",JSON.stringify([bookid]),function(res){
    this.book = res;
    initPage();
});


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
function initPage(){
    var name = book.title;
    var author = book.author;
    var chaptercount = book.chaptercount;
    hui("#htitle").html(name+"第"+chaptercount+"章");

}

hui.formInit();
function submit(){
    var res = huiFormCheck('#form1');
// addChapter: function (bookid,price,title,content)
        
    if(!res){
        return;
    }
    var data = hui.getFormData('#form1');
   
    var title = data.title;
    var price = data.price;
    var content = data.content;


    var json = JSON.stringify([book.id,price,title,content]);
    //    refreshAccount:function(name,avatar,abstract){
    uploadToWallet("addChapter",json,0,function(suc,result){
        if(suc){
            toast("提交成功");
            window.location.href = "singlebook.html?"+book.id;
        }else{
            toast("提交失败："+result);
        }
    });
}


hui("#submitBtn").click(function(){
    submit();
});