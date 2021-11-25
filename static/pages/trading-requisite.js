window.UserName = '';

if (!window.UserName) {

    /**
     * ltt CHYFJY2  tj  qq1  xbb1  test24
     */
    window.UserName = 'xbb';
    window.RealName = 'xbb';
}

window.ServiceBaseUrl = 'http://192.168.90.119:8080/tams/joyin';

// 工作流相关配置信息
var JoyinLabel = {

    'userselect.title.user': '请选择审批人（至少选择1人）',
    'userselect.btn.submit': '提交',
    'userselect.btn.cancel': '取消'
};

var pageStep = 10;
var purviewElements = ['_edit', '_delete', '_search', '_export'];
var dataPurview = [];
var pageModel = 'new';
var PAGE_MODEL_REFERENCE = '2';
var PAGE_MODEL_EDIT = '1';
var PAGE_MODEL_NEW = '0';
var menuStyle = null;
var spStyle = null;
var DATE_SELECT_BTN_CTR = '01';
var FILTER_AREA_SHOW = '01';
var IS_SHOW_BTN_ICON = '01';
var DATE_SELECT_ALLOW_SINGLE = '01';


/**
 * 工作流-数组或对象遍历
 * @memberOf module:zrender/core/util
 * @param {Object|Array} obj
 * @param {Function} cb
 * @param {*} [context]
 */
function customEach(obj, cb, context) {

    if (!(obj && cb)) {
        return;
    }
    if (obj.forEach && obj.forEach === nativeForEach) {
        obj.forEach(cb, context);
    }
    else if (obj.length === +obj.length) {

        for (var i = 0, len = obj.length; i < len; i++) {
            cb.call(context, obj[i], i, obj);
        }
    }
    else {

        for (var key in obj) {

            if (obj.hasOwnProperty(key)) {
                cb.call(context, obj[key], key, obj);
            }
        }
    }
}


var contentBody = document.getElementById('content-body');
contentBody.style.height = window.innerHeight + 'px';

window.onresize = function() {
    contentBody.style.height = window.innerHeight + 'px';
};