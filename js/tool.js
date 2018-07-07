var chainnetConfig = {
    mainnet: {
        name: "主网",
        contractAddress: "n1jPvwTnXJgQwqEZgAcFZA1uD7FTrLZPuC1",
        host: "https://mainnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/mainnet/pay"
    },
    testnet: {
        name: "测试网",
        contractAddress: "n1esVkfzAtsW8etwvP6sutK5YjLfjNhQF6r",
        host: "https://testnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/pay"
    },
    localnet: {
        name: "本地网",
        contractAddress: "n1kv2a9nTDtGfbtX5cqiZmFgqo4JLo5U57S",
        host: "http://localhost:8685",
        payhost: "http://localhost:8685/api/pay"
    }
}


var chainInfo = chainnetConfig["testnet"];
var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Unit = require("nebulas").Unit;
var Utils = require("nebulas").Utils;

var myneb = new Neb();
myneb.setRequest(new HttpRequest(chainInfo.host));
var nasApi = myneb.api;

var NebPay = require('nebpay');
var nebPay = new NebPay();


var wallet_address = null;
var wallet_balance = -1;

var haswallet = false;

var NebPay = require('nebpay');
var nebPay = new NebPay();



var dappAddress = chainInfo.contractAddress;

var getWalletCallback;


//初始币价
const INIT_COIN_PRICE = 0.0000000099;

function getWalletInfo(callback) {
    console.log("getWalletInfo");
    // if (!checkWallet()) {
    //     callback(false, "没有安装钱包");
    //     return;
    // }
    getWalletCallback = callback;
    nasApi.getNebState().then(function (state) {
        window.addEventListener('message', getMessage);
        window.postMessage({
            "target": "contentscript",
            "data": {},
            "method": "getAccount",
        }, "*");
    });
}

function checkWallet() {
    if (typeof (webExtensionWallet) === "undefined") {
        haswallet = false;
    } else {
        haswallet = true;
    }
    return haswallet;
}

function getMessage(e) {
    if (e.data && e.data.data) {
        console.log("e.data.data:", e.data.data)
        if (e.data.data.account) {
            var address = e.data.data.account;
            this.wallet_address = address;
            console.log("address=" + address);
            u.setStorage("wallet", address);
            nasApi.getAccountState({
                address: address
            }).then(function (resp) {
                var amount = Unit.fromBasic(Utils.toBigNumber(resp.balance), "nas").toNumber()//账号余额
                console.log("余额：" + amount);
                this.wallet_balance = amount;
                hui("#wallet_balance").html(amount);
                getWalletCallback(true, this.wallet_address);
            });
        }
    }
}



var serialNumber;

function uploadToWallet(functionName, jsonstr, value, callback) {
    //检测是否是手机，是否有钱包地址
    if(!getWallet()){
        //没有钱包且是手机
        if(!isPC()){
            hui.confirm('手机端需要安装星云数字钱包，是否已经安装了？', ['否','是'], function(){
                console.log('确认后执行...');
                uploadToWallet0(dappAddress, functionName, jsonstr, value, callback);
            },function(){
                console.log('取消后执行...');
                window.location.href = "https://nano.nebulas.io/";
            });
            return;
        }
    }
    
    uploadToWallet0(dappAddress, functionName, jsonstr, value, callback);
}

function uploadToWallet0(dappAddress, functionName, jsonstr, value, callback) {
    console.log("ischrome=" + isChrome + ",ispc=" + isPC());

    if (!isChrome && isPC()) {
        hui.toast("目前版本只能在Chrome或手机上操作，并安装星云钱包");
        return;
    }

    var to = dappAddress;
    if (!jsonstr) {
        jsonstr = JSON.stringify([]);
    }

    var options = {
        callback: chainInfo.payhost,
        listener: function (res) {
            console.log("test listenr " + res.txhash);
            if (!res.txhash) {
                console.log("test listener error");
                hui.toast('用户取消发送');
            } else {
                checkPayStatus(res.txhash, callback);
            }
        }
    };

    serialNumber = nebPay.call(to, value, functionName, jsonstr, options);

    if (!isPC()) {
        checkPayStatus(null, callback);
    }

    console.log("test serial number=" + serialNumber);

}

function checkPayStatus(txhash, callback) {
    console.log("checkpaystatas " + txhash);
    hui.loading('结果区块链上查询中...');

    if (isPC()) {
        var timerId = setInterval(function () {
            nasApi.getTransactionReceipt({
                hash: txhash
            }).then(function (receipt) {
                console.log("checkPayStatus");
                if (receipt.status == 1) {
                    clearInterval(timerId);
                    var res = receipt.execute_result;
                    callback(true, res);
                    hui.loading(false, true);
                } else if (receipt.status == 0) {
                    clearInterval(timerId);
                    console.log("test fail err=" + receipt.execute_error);
                    hui.loading(false, true);
                    callback(false, receipt.execute_error);
                }
            }).catch(function (err) {
                // console.log("test error"+err);
                clearInterval(timerId);
                hui.loading(false, true);
                hui.toast('发生错误：' + err, 'long');
            });
        }, 5 * 1000);
    } else {
        var timerId = setInterval(function () {
            console.log("queryPayInfo "+(new Date()).getTime());
            nebPay.queryPayInfo(serialNumber).then(function (resp) {
                console.log("test resp " + resp);
                var result = JSON.parse(resp);
                if (result.code == 0) {
                    var data = result.data;
                    var wallet = data.from;
                    u.setStorage("wallet", wallet);
                    if (data.status == 1) {
                        //成功了
                        clearInterval(timerId);
                        var res = data.execute_result;
                        callback(true, res);
                        hui.loading(false, true);
                    } else if (data.status == 0) {
                        clearInterval(timerId);
                        console.log("test fail err=" + data.execute_error);
                        hui.loading(false, true);
                        callback(false, data.execute_error);
                    }
                }
            }).catch(function (err) {
                console.log("error " + err);
                clearInterval(timerId);
                hui.loading(false, true);
                hui.toast('发生错误：' + err, 'long');
            });
        }, 10 * 1000);
    }

}

function getInfo0(dappAddress,funcName, jsonstr, callback){
    if (!jsonstr) {
        jsonstr = JSON.stringify([]);
    }
    myneb.api.call({
        from: dappAddress,
        to: dappAddress,
        value: 0,
        contract: {
            function: funcName,
            args: jsonstr
        },
        gasPrice: 1000000,
        gasLimit: 2000000,
    }).then(function (tx) {
        var arr = JSON.parse(tx.result);
        console.log("getInfo =" + JSON.stringify(arr));
        callback(arr);
    });
}

function getInfo(funcName, jsonstr, callback) {
    getInfo0(dappAddress,funcName,jsonstr,callback);
}

function getWallet() {
    if (!isPC()) {
        return u.getStorage("wallet");
    }
    return this.wallet_address;
}

function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器 
var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器 
var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器 
var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器 
var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器 
var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器 

//定义全局变量函数
var uzStorage = function () {
    var ls = window.localStorage;
    return ls;
};
//定义全局变量u
var u = {};
//设置缓存
u.setStorage = function (key, value) {
    var v = value;
    if (typeof v == 'object') {
        v = JSON.stringify(v);
        v = 'obj-' + v;
    } else {
        v = 'str-' + v;
    }
    var ls = uzStorage();
    if (ls) {
        ls.setItem(key, v);
    }
};
//获取缓存
u.getStorage = function (key) {
    var ls = uzStorage();
    if (ls) {
        var v = ls.getItem(key);
        if (!v) {
            return null;
        }
        if (v.indexOf('obj-') === 0) {
            v = v.slice(4);
            return JSON.parse(v);
        } else if (v.indexOf('str-') === 0) {
            return v.slice(4);
        }
    }
};


if (navigator.userAgent.match(/android/i)) {
    // 通过iframe的方式试图打开APP，如果能正常打开，会直接切换到APP，并自动阻止a标签的默认行为
    // 否则打开a标签的href链接
    var isInstalled;
    //下面是安卓端APP接口调用的地址，自己根据情况去修改

    varifrSrc = 'AppProtocolHeader://camnpr? type=0&id=${com.id}&phone_num=${com.phone_num}';
    var ifr = document.createElement('iframe');
    ifr.src = ifrSrc;
    ifr.style.display = 'none';
    ifr.onload = function () {
        // alert('Is installed.');
        isInstalled = true;
        alert(isInstalled);
        document.getElementById('openApp0').click();
    };
    ifr.onerror = function () {
        // alert('May be not installed.');
        isInstalled = false;
        alert(isInstalled);
    }
    document.body.appendChild(ifr);
    setTimeout(function () {
        document.body.removeChild(ifr);
    }, 1000);
}

function toast(info){
    hui.toast(info);
}

function showProgress(info){
    if(!info || info.length==0)info="正在从区块链拉取数据...";
    hui.loading(info);
}

function hideProgress(){
    hui.loading(false,true);
}

