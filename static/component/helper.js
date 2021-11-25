
function isJson(obj) {

    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;

    if (!obj || toString.call(obj) !== '[object Object]') {
        return false;
    }

    var proto = Object.getPrototypeOf(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }

    // Objects with prototype are plain if they were constructed by a global Object function
    var ctor = hasOwn.call(proto, 'constructor') && proto.constructor;
    /*
        make a tolerance on deciding if a function instance can be a [json]
    */
    return typeof ctor === 'function';
}

function extend(args) {

    var arg_len = args.length;
    if (arg_len == 0) {
        return;
    } 
    else if (arg_len == 1) {
        return args[0];
    } 
    else if (args[0] == null || args[0] == undefined) {
        return args[0];
    }

    var last_ele = args[arg_len - 1];
    var has_exclude_keys = arg_len >= 3 && last_ele instanceof Array && last_ele.length > 0;
    var exclude_keys = has_exclude_keys ? last_ele : [];
    var member_count = has_exclude_keys ? arg_len - 1 : arg_len;

    for (var idx = member_count - 1; idx >= 1; idx--) {

        var obj_after = args[idx];
        if (obj_after == null || obj_after == undefined || obj_after instanceof Array) {
            continue;
        }

        for (var key in obj_after) {
            if (has_exclude_keys && exclude_keys.includes(key)) {
                continue;
            }
            var obj_before = args[idx - 1];
            obj_before[key] = obj_after[key];
        }
    }

    return args[0];
}

function deepClone(obj) {

    if (!isJson(obj) && !(obj instanceof Array)) {
        return obj;
    }

    function do_clone(attachable, obj) {

        if (obj instanceof Array) {

            for (var idx = 0; idx < obj.length; idx++) {

                if (obj[idx] instanceof Array) {
                    do_clone((attachable[idx] = []), obj[idx]);
                } 
                else if (isJson(obj[idx])) {
                    do_clone((attachable[idx] = {}), obj[idx]);
                } 
                else {
                    attachable[idx] = obj[idx];
                }
            }
        } 
        else {
            for (var key in obj) {
                if (obj[key] instanceof Array) {
                    do_clone((attachable[key] = []), obj[key]);
                } 
                else if (isJson(obj[key])) {
                    do_clone((attachable[key] = {}), obj[key]);
                } 
                else {
                    attachable[key] = obj[key];
                }
            }
        }
    }

    var attachable = obj instanceof Array ? [] : {};
    do_clone(attachable, obj);
    return attachable;
}

function formatDateTime(date_time, format_str) {

    if (!date_time) {
        return date_time;
    }

    if (/^\d{1,}$/g.test(date_time)) {
        date_time = parseInt(date_time);
    }

    if (typeof date_time == 'number' || typeof date_time == 'string') {
        date_time = new Date(date_time);
    }

    if (format_str == undefined || format_str == null || !format_str) {
        format_str = 'yyyy-MM-dd hh:mm:ss';
    }

    var o = {

        'M+': date_time.getMonth() + 1,
        'd+': date_time.getDate(),
        'h+': date_time.getHours(),
        'm+': date_time.getMinutes(),
        's+': date_time.getSeconds(),
        'q+': Math.floor((date_time.getMonth() + 3) / 3),
        S: date_time.getMilliseconds(),
    };

    if (/(y+)/.test(format_str)) {
        format_str = format_str.replace(RegExp.$1, (date_time.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp('(' + k + ')').test(format_str)) {
            format_str = format_str.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }

    return format_str;
}

function thousands(number, to_integer, precision) {

    if (typeof number != 'number') {
        return number;
    }

    var num_str = to_integer ? parseInt(number).toString() : number.toFixed(precision);
    var parts = num_str.split('.');
    var exp = /\d{1,3}(?=(\d{3})+(\.\d*)?$)/g;
    return parts[0].replace(exp, '$&,') + (parts.length > 1 ? '.' + parts[1].replace(/\,/g, '') : '');
}

/**
 * 安全乘法
 * @param {Number} arg1 
 * @param {Number} arg2 
 */
function safeMul(arg1, arg2) {

	var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try{ m += s1.split(".")[1].length; } catch(e) {}
    try{ m += s2.split(".")[1].length; } catch(e) {}
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
}

const helper = {

    /**
     * judge if a given something is a json-like object
     */
    isJson: function (obj) {
        return isJson(obj);
    },

    /**
     * check if a given value is treated as None
     * @param {*} something
     */
    isNone: function (something) {

        return something === undefined 
            || something === null 
            || (typeof something == 'string' && something.trim().length == 0);
    },

    /**
     * check if a given value is treated as Not None
     * @param {*} something
     */
    isNotNone: function (something) {
        return !this.isNone(something);
    },

    /**
     * check if a given value is treated as Number
     * @param {*} something
     */
    isNumber: function (something) {
       return typeof something === 'number' && !isNaN(something)
    },

    /**
     * extend object a with object b ( a will change possibly, b has no changes )
     * @parameters: extend(a[,b][,c][,d]...)
     * @direction: from d -> c -> b -> a
     */
    extend: function () {
        return extend(arguments);
    },

    /**
     * convert a json<map> values to be an array
     * @param {*} a 
     * @returns {Array}
     */
    dict2Array: function (a) {

        var b, c;
        if (!isJson(a)) return [];
        b = [];
        for (c in a) b.push(a[c]);
        return b;
    },

    /**
     * convert a json<map> keys to be an array
     */
    dictKey2Array: function (a) {
        return !isJson(a) ? [] : Object.keys(a);
    },

    /**
     * convert an array into a json <key/value>
     * you should have the awareness: the given generator should return an unique token for every element of the array
     */
    array2Dict: function (arr, key_gen) {

        if (!(arr instanceof Array) || arr.length == 0) {
            return {};
        }
        var dict = {};
        arr.forEach(ele => { dict[key_gen(ele)] = ele; });
        return dict;
    },

    /**
     * to remove all keys of of a json
     */
    clearHash: function (obj) {

        if (isJson(obj)) {
            try {
                for (let key in obj) {
                    delete obj[key];
                }
            } 
            catch (ex) {
                console.log(ex);
            }
        }
        return obj;
    },

    /**
     * deeply clone an object (both arrary and json are supported)
     */
    deepClone: function (obj) {
        return deepClone(obj);
    },

    /**
     * create a token
     */
    makeToken: function (with_prefix = false) {
        return (with_prefix === true ? 'tk' : '') + Math.random().toString().substr(2) + new Date().getTime().toString().substr(5);
    },

    /**
     * make a random number between a given range and return
     * @param {Number} lower_limit 
     * @param {Number} uppper_limit 
     * @param {Boolean} is_integer defaults = false
     */
    makeRandomNum: function (lower_limit, uppper_limit, is_integer = false) {

        var rd = Math.random() * (uppper_limit - lower_limit + 1) + lower_limit;
        return !!is_integer ? parseInt(rd) : rd;
    },

    /**
     * @param {Date|String|Number} date_time 
     * @param {String} format_str 
     */
    formatDateTime: function (date_time, format_str) {
        return formatDateTime(date_time, format_str);
    },

    /**
     * 安全乘法
     * @param {Number} s1 
     * @param {Number} s2 
     */
    safeMul: function (s1, s2) {
        return safeMul(s1, s2);
    },

    /**
     * thousands a number into an integer
     * @param {Number} num 
     */
    thousands: function (num) {
        return thousands(num, true);
    },

    /**
     * thousands a number into a decimal
     * @param {Number} num 
     */
    thousandsDecimal: function (num, precision) {
        return thousands(num, false, precision >= 2 ? parseInt(precision) : 2);
    },

    /**
     * thousands a number into a Integer
     * @param {Number} num 
     */
    thousandsInteger: function (num) {
        return thousands(num, true);
    },

    /**
     * string to number
     * @param {*} str 
     */
    strToNumber: function(str){
        const num = typeof str === 'string' ? str.replace(/,/g, "") : str;
        return Number(num);
    },

    /**
     * @param {String} stock_code 
     */
    convertStockCodeOut(stock_code) {

        let secs = stock_code.split('.');
        let simple_code = secs[0];
        let market_code = secs[1];

        if (market_code == 'SH') {
            return 'SHSE.' + simple_code;
        }
        else if (market_code == 'SZ') {
            return 'SZSE.' + simple_code;
        }
        else if (market_code == 'SF') {
            return 'SHFE.' + simple_code;
        }
        else if (market_code == 'DCE') {
            return 'DCE.' + simple_code;
        }
        else {
            return stock_code;
        }
    },

    /**
     * @param {String} stock_code 
     */
    convertStockCodeBack(stock_code) {

        let secs = stock_code.split('.');
        let market_code = secs[0];
        let simple_code = secs[1];

        if (market_code == 'SHSE') {
            return 'SH.' + simple_code;
        }
        else if (market_code == 'SZSE') {
            return 'SZ.' + simple_code;
        }
        else if (market_code == 'SHFE') {
            return 'SF.' + simple_code;
        }
        else if (market_code == 'DCE') {
            return 'DCE.' + simple_code;
        }
        else {
            return stock_code;
        }
    },

    /**
     * show a loading
     * @returns {Number} loading index
     */
    showLoading() {
        return layer.load(0, { time: 10 * 1000,  shade: [0.5,'#000000']  });
    },

    /**
     * hide a loading
     * @param {*} load_index loading index (close all loadings if not provided)
     */
    hideLoading(load_index) {
        typeof load_index == 'number' ? layer.close(load_index) : layer.closeAll();
    },

    /**
     * 
     * @param {*} content 
     * @param {*} options 
     * @param {*} end_callback 
     */
    msg: function (content, options, end_callback) {
        layer.msg(content, this.extend({ time: 2000 }, options), end_callback);
    },

    /**
     * show a success message
     * @param {String} content 
     * @param {*} options
     */
    showSuccess: function (content, options) {
        layer.msg(content, this.extend({ icon: 6, time: 2000 }, options));
    },

    /**
     * show an error message
     * @param {String} content 
     * @param {*} options 
     * @param {Function} end_callback 
     */
    showError: function (content, options, end_callback) {
        layer.msg(content, this.extend({ icon: 5, time: 3000 }, options), end_callback);
    },
}

export { helper };