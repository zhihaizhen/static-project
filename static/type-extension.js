
function supportOlderBrowsers () {

    Object.defineProperty(HTMLElement.prototype, 'classList', {

        get: function() {

            var ctrSelf = this;

            function update(fn) {

                return function(value) {
                    var classes = ctrSelf.className.split(/\s+/g),
                        index = classes.indexOf(value);
 
                    fn(classes, index, value);
                    ctrSelf.className = classes.join(" ");
                }
            }
 
            return {

                add: update(function(classes, index, value) {

                    if (!~index) {
                        classes.push(value);
                    }
                }),
 
                remove: update(function(classes, index) {

                    if (~index) {
                        classes.splice(index, 1);
                    }
                }),
 
                toggle: update(function(classes, index, value) {

                    if (~index) {
                        classes.splice(index, 1);
                    }
                    else {
                        classes.push(value);
                    }
                }),
 
                contains: function(value) {
                    return !!~ctrSelf.className.split(/\s+/g).indexOf(value);
                },
 
                item: function(i) {
                    return ctrSelf.className.split(/\s+/g)[i] || null;
                }
            };
        }
    });
}


/**
 * 扩展Date类和Array类
 */
function extendTypes() {
    
    /**
     * language built-in type extensions
     */

    function summarizeFiled(arr, predicate) {

        var total = 0;
        var is_func = typeof predicate == 'function';

        for (var idx = 0; idx < arr.length; idx++) {
            var ele = arr[idx];
            total += is_func ? predicate(ele) : ele;
        }

        return total;
    }

    function groupByMembers(arr, predicate) {

        if (typeof predicate != 'function') {
            return {};
        }

        var map = {};
        for (var idx = 0; idx < arr.length; idx++) {
            var ele = arr[idx];
            var key = predicate(ele);
            if (map[key] == undefined) {
                map[key] = [];
            }
            map[key].push(ele);
        }

        return map;
    }

    function removeMembers(arr, predicate, only_first) {

        if (typeof predicate != 'function') {
            return arr;
        }

        var pending_removing_idxes = [];
        for (var idx = 0; idx < arr.length; idx++) {
            if (predicate(arr[idx]) === true) {
                pending_removing_idxes.push(idx);
                if (only_first === true) {
                    break;
                }
            }
        }
        // remove expected element one by one
        while (pending_removing_idxes.length > 0) {
            arr.splice(pending_removing_idxes.pop(), 1);
        }

        return arr;
    }

    function findMaxMember(arr, predicate) {

        if (arr.length == 0) {
            throw new Error('length equals 0');
        } 
        else if (arr.length == 1) {
            return predicate(arr[0]);
        }

        var max = predicate(arr[0]);
        for (var idx = 1; idx < arr.length; idx++) {
            if (max < predicate(arr[idx])) {
                max = predicate(arr[idx]);
            }
        }
        return max;
    }

    function findMinMember(arr, predicate) {

        if (arr.length == 0) {
            throw new Error('length equals 0');
        } 
        else if (arr.length == 1) {
            return predicate(arr[0]);
        }

        var min = predicate(arr[0]);
        for (var idx = 1; idx < arr.length; idx++) {
            if (min > predicate(arr[idx])) {
                min = predicate(arr[idx]);
            }
        }

        return min;
    }

    /**
     * @param {Array} arr 
     * @param {Function} predicate 
     */
    function distinctArray(arr, predicate) {

        var is_func = typeof predicate == 'function';
        var distincted = [];

        for (var idx = 0; idx < arr.length; idx++) {

            var ele = arr[idx];
            if (distincted.indexOf(is_func ? predicate(ele) : ele) < 0) {
                distincted.push(is_func ? predicate(ele) : ele);
            }
        }

        return distincted;
    }

    /**
     * format current DateTime instance into a string
     * @param {String} pattern 
     */
    Date.prototype.format = function (pattern) {

        if (pattern == undefined || pattern == null) {
            pattern = 'yyyy-MM-dd hh:mm:ss';
        }
    
        var datetime = this;
        var o = {
    
            'M+': datetime.getMonth() + 1,
            'd+': datetime.getDate(),
            'h+': datetime.getHours(),
            'm+': datetime.getMinutes(),
            's+': datetime.getSeconds(),
            'q+': Math.floor((datetime.getMonth() + 3) / 3),
            S: datetime.getMilliseconds(),
        };
    
        if (/(y+)/.test(pattern)) {
            pattern = pattern.replace(RegExp.$1, (datetime.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
    
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(pattern)) {
                pattern = pattern.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
            }
        }
    
        return pattern;
    }

    /**
     * extend Array prototype
     */

    Array.prototype.orderBy = function(delegate) {
        return this._orderBy(delegate, 'asc');
    };

    Array.prototype.orderByDescending = function(delegate) {
        return this._orderBy(delegate, 'desc');
    };

    Array.prototype._orderBy = function(delegate, direction) {

        if (this.length <= 1) {
            return this;
        }

        var isFunction = typeof delegate == 'function';
        var tmp;
        for (var i = 0; i < this.length - 1; i++) {
            for (var j = i + 1; j < this.length; j++) {

                var first = this[i];
                var next = this[j];
                var result;
                if (direction == 'asc') {
                    result = isFunction ? delegate(first) > delegate(next) : first > next;
                } 
                else {
                    result = isFunction ? delegate(first) < delegate(next) : first < next;
                }
                if (result) {
                    tmp = this[i];
                    this[i] = this[j];
                    this[j] = tmp;
                }
            }
        }
        return this;
    };

    Array.prototype.sum = function(predicate) {
        return summarizeFiled(this, predicate);
    };

    Array.prototype.groupBy = function(predicate) {
        return groupByMembers(this, predicate);
    };

    Array.prototype.remove = function(predicate, only_first) {
        return removeMembers(this, predicate, only_first);
    };

    Array.prototype.max = function(predicate) {
        return findMaxMember(this, predicate);
    };

    Array.prototype.min = function(predicate) {
        return findMinMember(this, predicate);
    };

    Array.prototype.distinct = function(predicate) {
        return distinctArray(this, predicate);
    };

    Array.prototype.merge = function(others) {

        if (others instanceof Array) {
            others.forEach(x => this.push(x));
        }
        else {
            this.push(others);
        }

        return this;
    };

    Array.prototype.clear = function() {
        this.length = 0;
    };

    if (!('classList' in document.documentElement)) {
        supportOlderBrowsers();
    }
}

extendTypes();

// module.exports = { extendTypes };