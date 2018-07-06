
hui.formInit();

function submit(){
    //addBook:function(title,abstract,picture){
    var res = huiFormCheck('#form1');
    //if(hui('#form1').formCheck()){
    if(!res){
        return;
    }
    var data = hui.getFormData('#form1');


    var json = JSON.stringify([data.title,data.absctract,data.logo]);
    //    refreshAccount:function(name,avatar,abstract){
    uploadToWallet("addBook",json,0,function(suc,result){
        if(suc){
            toast("添加成功");
            window.location.href = "mypage.html";
        }else{
            toast("注册失败："+result);
        }
    });
}


hui("#submitBtn").click(function(){
    submit();
});