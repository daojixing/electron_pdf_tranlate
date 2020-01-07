(function msieRefuse() {

    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if (isIE) {
        alert('本软件暂时未实现对ie的支持，请移步基于chrome内核的浏览器（复制网址到其他浏览器）')
    }
})();
 const {ipcRenderer} = require('electron')
const {google, baidu, youdao} = require('translation.js');
google.translate("I")
var preverious = "";
// const fs = require('fs');
// const request = require('request');
var transResEle = document.getElementById('transRes');

function showPop(value) {
    if (value === '') {
        transResEle.style.display = 'none';
    } else {
        transResEle.style.display = 'block';
        transResEle.innerHTML = value;
    }
}

function clickFun(event) {
    // console.time("answer time");
    console.log("点击")
    if (event.target === transResEle) {
        return
    }
    var selected = window.getSelection();
    let selectedText = selected.toString();

    if (selectedText === '' || selectedText.length > 500) {
        showPop('');
    } else {
        if (selectedText == preverious) {
            return;
        }
        preverious = selectedText;
        let url;
        // alert(selectedText)
        var timesmp=(new Date()).valueOf()
        youdao.audio(preverious).then(uri => {
            console.log(uri) // => 'http://tts.google.cn/.......'
            url = uri;
            ipcRenderer.send("audio",url,timesmp)
            // request(url).pipe(fs.createWriteStream('./pdfviewer/web/tts.mp3'))
        })

        console.log(preverious);
        google.translate(preverious).then(res => {
            showPop(preverious + "<br />" + res.result + "<br /> <audio style=\"display:block; margin:5px auto;\" src=\"../../../../MP3/"+timesmp+".mp3\" controls=\"controls\" type=\"audio/mp3\">\n" +
                "    Your browser does not support the audio element.\n" +
                "</audio>");
        });
        // console.timeEnd("answer time");
        // var tran_result=ipcRenderer.sendSync("google",preverious);
        // showPop(preverious+"<br />"+tran_result+"<br /> <audio src=\"https://fanyi.baidu.com/gettts?lan=en&text="+encodeURI(selectedText)+"&spd=3&source=web\" controls=\"controls\" type=\"audio/mpeg\">\n" +
        //     "    Your browser does not support the audio element.\n" +
        //     "</audio>");
    }
}

document.addEventListener('mouseup', clickFun);


// 彩蛋
function remove_s() {
    console.log("remove_s")
    var pdf = document.getElementById("viewer");
    var pdfs = pdf.getElementsByTagName("span");
    for (let key of pdfs) {
        if (!key.hasAttribute("class") && key.hasAttribute("style")) {//元素没有class 而且有style
            if (key.style.getPropertyValue("top") && key.style.getPropertyValue("font-size")) {//有文字大小和top
                let str = key.innerText;
                if (str.charAt(str.length - 1) == "-" || str == "-") {
                    // console.log(key.innerText)
                    // console.log(str)
                    key.innerText = str.substr(0, str.length - 1)
                } else {
                    if (str.charAt(str.length - 1) != "") {
                        key.innerText = str + " ";
                    }
                }

            }
        }
    }
}


(function () {
    'use strict';

    function fire() {
        'use strict'
        var bg = document.getElementsByTagName('canvas');
        var wd = document.querySelectorAll('.page span');
        var timeSep = '300'; //ms
        var timeDurition = 2;
        bg = Array.prototype.slice.call(bg);
        wd = Array.prototype.slice.call(wd);
        document.styleSheets[0].insertRule('.textLayer { opacity: 1; }', document.styleSheets[0].cssRules.length);
        document.styleSheets[0].insertRule('.textLayer > span{ color: black; }', document.styleSheets[0].cssRules.length);
        for (var ind = 0; ind < bg.length; ind++) {
            bg[ind].style.visibility = 'hidden';
        }
        var curInd = 0;
        var killOneByOne = function () {
            let aNode = wd[curInd];
            aNode.style.transition = 'transform ' + timeDurition + 's' + ',opacity ' + timeDurition + 's';
            aNode.style.transform = 'rotate(180deg) scale(0, 0)';
            aNode.style.opacity = '0';
            if (++curInd < wd.length) {
                setTimeout(killOneByOne, timeSep)
            }
        }
        setTimeout(killOneByOne, timeSep)
    }


    var timeSeq = ['X', 'X', 'X', 'X'];
    var xbdl = function (event) {
        'use strict'
        var MININTERVAL = 400;
        var keypressed = String.fromCharCode(event.keyCode);
        timeSeq.push(keypressed);
        timeSeq.shift();
        if (timeSeq.join('') === 'XBDL') {
            fire()
            console.log('彩蛋脚本开始执行，别问我怎么恢复页面，刷新啦~')
        }
    };

    document.addEventListener('keydown', xbdl);
})();

setTimeout(() => {
    console.log('********************************************************************')
    console.log('********************************************************************')
    console.log('********************************************************************')
    console.log('哦豁，你找到一个彩蛋，以此按下xbdl(学不动了)触发自暴自弃行为, 从第一页开始')
    console.log('********************************************************************')
    console.log('********************************************************************')
    console.log('********************************************************************')
}, 3500)