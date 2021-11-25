(function () {
    /**
     * 按钮控件，只是为了给按钮添加icon
     * btn-search 查询
     * btn-export 导出
     * btn-import 导入
     * btn-reset 重置
     * btn-create 新建
     * btn-delete 删除
     * btn-frozen 冻结
     * btn-unfrozen 解冻
     * btn-save 保存
     * btn-submit 提交
     * btn-cancel 取消
     * btn-preview 预览
     * btn-approval 批量审批
     * btn-pwdreset 密码重置
     * btn-detail 管理明细
     * @date 2018-02-01
     * @auth heyangyang
     */
    $.fn.layButton = function () {
        $(this).each(function () {
            var self = $(this);
            var html = self.html();
            var span = $('<span></span>').html('&nbsp;&nbsp;' + html);
            var icon = $('<i class="iconfont"></i>');
            if ($('i', self).length > 0) return;
            
            self.click(function() {
            	var lastClickTime = self.data('lastClickTime');
            	if(lastClickTime && (Date.now() - lastClickTime < 800)){
                    //layer.msg('点击太快，请慢点操作', {time: 1000});
            		throw "点击太快，请慢点操作!";
            	}
            	self.data('lastClickTime', Date.now());
                Joyin.elementId = self.attr('id');
            });
            
            if (self.hasClass('btn-search')) {
                if(IS_SHOW_BTN_ICON != "02"){
                    icon.addClass('icon-search');
                }
            }
            else if (self.hasClass('btn-export')) {
                icon.addClass('icon-export');
            }
            else if(self.hasClass('btn-import')){
                icon.addClass('icon-import');
            }
            else if (self.hasClass('btn-reset')) {
                if(IS_SHOW_BTN_ICON != "02"){
                    icon.addClass('icon-reset');
                }
            }
            else if (self.hasClass('btn-create')) {
                icon.addClass('icon-found');
            }
            else if (self.hasClass('btn-config')) {
                icon.addClass('icon-configure');
            }
            else if (self.hasClass('btn-delete')) {
                icon.addClass('icon-delete');
            }
            else if (self.hasClass('btn-frozen')) {
                icon.addClass('icon-lock');
            }
            else if (self.hasClass('btn-unfrozen')) {
                icon.addClass('icon-unlock');
            }
            else if (self.hasClass('btn-save')) {
                icon.addClass('icon-save');
            }
            else if (self.hasClass('btn-submit')) {
                icon.addClass('icon-submit');
            }
            else if (self.hasClass('btn-cancel')) {
                icon.addClass('icon-delete');
            }
            else if (self.hasClass('btn-preview')) {
                icon.addClass('icon-preview');
            }
            else if (self.hasClass('btn-approval')) {
                icon.addClass('icon-approval');
            }
            else if (self.hasClass('btn-pwdreset')) {
                icon.addClass('icon-password-reset');
            }
            else if(self.hasClass('btn-filter')) {
                icon.addClass('icon-btn-filter');
            }
            else if(self.hasClass('btn-top')){
                icon.addClass('icon-top-arrow');
            }
            else if(self.hasClass('btn-down')){
                icon.addClass('icon-down-arrow');
            }
            else if(self.hasClass('btn-downing')){
                icon.addClass('icon-turn-downing');
            }
            else if(self.hasClass('btn-detail')){
                icon.addClass('icon-detail');
            }
            else if(self.hasClass('btn-print')){
                icon.addClass('icon-print');
            }
            else {
                var i = self.data('icon');
                if (i) {
                    icon = $('<i></i>').addClass(i);
                }
            }
            self.empty().append(icon).append(span);
        });
    };

    /**
     * 列表按钮区域
     */
    $.fn.buttonArea = function() {
        $(this).each(function () {
            var self = $(this)
                , filter = self.attr('filter')
                , exp = self.attr('export')
                , position = self.attr('position');
            if(self.data('inited')) return;
            // 角色权限
            var searchAuth = false, exportAuth = false;
            _.each(purviewElements, function(ele) {
                // 查询权限
                if(ele.indexOf('_search') != -1) {
                    searchAuth = true;
                }
                // 导出权限
                if(ele.indexOf('_export') != -1) {
                    exportAuth = true;
                }
            });

            // 添加筛选按钮
            if(filter !== 'false' && searchAuth) {
                var filterBtn = $('<a class="layui-btn layui-btn-sm btn-filter"></a>');
                filterBtn.attr('id', pageId + '_btn_filter')
                    .text(JoyinUtil.getLabel('SysCommon.filter')).prependTo(self);
                // 筛选按钮添加事件
                filterBtn.click(function() {
                    var $form = $(this).parent().next('.joyin-form-wrap');
                    $form.toggleClass('joyin-filter-form');
                    $form.prev().css('float', 'none');
                    if(!$form.hasClass('joyin-filter-form') && $form.is(':hidden')) {
                        $form.removeAttr('style');
                    }
                }).mouseenter(function() {
                    $(this).parent().next('.joyin-form-wrap').show();
                });
                filterBtn.parent().next(".joyin-form-wrap").click(function(event){
                    event=event||window.event;
                    event.stopPropagation();
                });
            }
            //筛选区域展示控制
            if(FILTER_AREA_SHOW && FILTER_AREA_SHOW == '01'){
                var $form = $(".joyin-form-wrap");
                $form.toggleClass('joyin-filter-form', false);
                $form.prev().css('float', 'none');
            }
            if(exp !== 'false' && exportAuth) {
                // 只出导出按钮的画面
                var showExportBtnGroup = true;
                if (notShowExportByColumnPage) {
                    var notShowExportByColumnPageArr = notShowExportByColumnPage.split(",");
                    $(notShowExportByColumnPageArr).each(function (i, notShowExportByColumnPageId) {
                        if (notShowExportByColumnPageId == pageId) {
                            showExportBtnGroup = false;
                        }
                    });
                }
                
                // 只有导出按钮
                if ((exportType === '02' && exportSelectedRow === '02') || !showExportBtnGroup) {
                    var exportBtn = $('<a class="layui-btn layui-btn-sm btn-export btn-default"></a>');
                    exportBtn.attr('id', pageId + '_btn_export')
                        .text(JoyinUtil.getLabel('SysCommon.export')).appendTo(self);
                }
                else {
                    // 显示导出所有列和导出选中行所有列
                    if (exportType === '02' && exportSelectedRow === '01') {
                        var exportBtn = $('<div class="btn-select-wrapper" style="margin-left: 10px"></div>')
                        ,selectGroup = '<a class="layui-btn layui-btn-sm btn-select"><i class="iconfont icon-export"></i> ' + JoyinUtil.getLabel('SysCommon.export') + '<i class="iconfont icon-down"></i></a>'
                        ,exportAll = $('<a href="javascript:;">导出全部列</a>').attr('id', pageId + '_btn_export')
                        ,exportAllCheck = $('<a href="javascript:;">导出选中行全部列</a>').attr('id', pageId + '_btn_exportCheck')
                        exportBtn.append(selectGroup).append($('<ul class="btn-select-wrap" style="width: 70px; min-width: 85px; display: none;"></ul>').append($('<li></li>').append(exportAll)).append($('<li></li>').append(exportAllCheck)));
                        exportBtn.appendTo(self);
                        exportAllCheck.on('click', function() {
                            exportAll.trigger('click');
                        });
                    }// 显示导出所有列和导出选中行所有列
                    if (exportType === '01' && exportSelectedRow === '02') {
                        var exportBtn = $('<div class="btn-select-wrapper" style="margin-left: 10px"></div>')
                        ,selectGroup = '<a class="layui-btn layui-btn-sm btn-select"><i class="iconfont icon-export"></i> ' + JoyinUtil.getLabel('SysCommon.export') + '<i class="iconfont icon-down"></i></a>'
                        ,exportAll = $('<a href="javascript:;">导出全部列</a>').attr('id', pageId + '_btn_export')
                        ,exportExcel = $('<a href="javascript:;">导出显示列</a>').attr('id', pageId + '_btn_exportExcelByColumns')
                        exportBtn.append(selectGroup).append($('<ul class="btn-select-wrap" style="width: 70px; min-width: 85px; display: none;"></ul>').append($('<li></li>').append(exportAll)).append($('<li></li>').append(exportExcel)));
                        exportBtn.appendTo(self);
                        exportExcel.on('click', function() {
                            exportAll.trigger('click');
                        });
                    }
                    // 显示导出所有列和导出显示列和导出选中行所有列和导出选中行显示列
                    if (exportType === '01' && exportSelectedRow === '01') {
                        var exportBtn = $('<div class="btn-select-wrapper" style="margin-left: 10px"></div>')
                            ,selectGroup = '<a class="layui-btn layui-btn-sm btn-select"><i class="iconfont icon-export"></i> ' + JoyinUtil.getLabel('SysCommon.export') + '<i class="iconfont icon-down"></i></a>'
                            ,exportAll = $('<a href="javascript:;">导出全部列</a>').attr('id', pageId + '_btn_export')
                            ,exportExcel = $('<a href="javascript:;">导出显示列</a>').attr('id', pageId + '_btn_exportExcelByColumns')
                            ,exportAllCheck = $('<a href="javascript:;">导出选中行全部列</a>').attr('id', pageId + '_btn_exportCheck')
                            ,exportExcelCheck = $('<a href="javascript:;">导出选中行显示列</a>').attr('id', pageId + '_btn_exportCheckExcelByColumns');
                        exportBtn.append(selectGroup).append($('<ul class="btn-select-wrap" style="width: 120px; min-width: 85px; display: none;"></ul>').append($('<li></li>').append(exportAll)).append($('<li></li>').append(exportExcel)).append($('<li></li>').append(exportAllCheck)).append($('<li></li>').append(exportExcelCheck)));
                        exportBtn.appendTo(self);
                        exportExcel.on('click', function() {
                            exportAll.trigger('click');
                        });
                        exportAllCheck.on('click', function() {
                            exportAll.trigger('click');
                        });
                        exportExcelCheck.on('click', function() {
                            exportAll.trigger('click');
                        });
                    }
                }
            }
            if(position === 'right') {
                // 将按钮右对齐
                self.css('text-align', 'right');
            }
            self.data('inited', true);
        });
    };

    /**
     * 列表查询条件区域
     */
    $.fn.conditionArea = function() {
        $(this).on('click', function(e) {
            if(!$(e.target).is('.input-dateRangeSelect') && !$(e.target).is('.input-dateSelect')) {
                $('.layui-laydate').remove();
            }
        }).each(function () {
            var self = $(this)
                , btns = $('<div class="form-search-btns"></div>')
                , line = self.attr('line') || 2
                , items = self.find('.layui-form-item')
                , searchBtn
                , resetBtn;
            // 行数
            if(!isNaN(line)) {
                line = parseInt(line);
            }

            // 角色权限
            var searchAuth = false;
            _.each(purviewElements, function(ele) {
                // 查询权限
                if(ele.indexOf('_search') != -1) {
                    searchAuth = true;
                }
            });
            // 添加查询按钮
            if(items.length >= 1 && searchAuth) {
                searchBtn = $('<a class="layui-btn layui-btn-sm btn-search"></a>');
                searchBtn.attr('id', pageId + '_btn_search')
                    .text(JoyinUtil.getLabel('SysCommon.search'))
                    .appendTo(btns);
                searchBtn
                    .wrap('<div class="layui-form-item"></div>')
                    .wrap('<div class="layui-inline"></div>')
                    .click(function() {
                        searchBtn.parents('.joyin-filter-form').hide();
                    });
            }
            // 添加重置按钮
            if(items.length >= Math.min(line, 2) && searchAuth) {
                resetBtn = $('<a class="layui-btn layui-btn-sm btn-reset btn-default"></a>');
                resetBtn.attr('id', pageId + '_btn_reset')
                    .text(JoyinUtil.getLabel('SysCommon.reset'))
                    .appendTo(btns);
                resetBtn
                    .wrap('<div class="layui-form-item"></div>')
                    .wrap('<div class="layui-inline"></div>')
                    .click(function() {
                        location.reload();
                    });
            }
            // 添加更多按钮
            if(items.length > line) {	
                var other = self.find('.layui-form-item:gt(' + (line-1) + ')');
                var moreBtn = $('<i class="iconfont icon-downarrow"></i>');
                if(searchAuth) {
                    if(line >= 2) {
                        resetBtn.after(moreBtn);
                    }
                    else {
                        searchBtn.after(moreBtn);
                        resetBtn.hide();
                    }
                }
                else {
                    btns.append(moreBtn);
                }
                moreBtn
                    .wrap('<a style="margin-left:5px;float:right;"></a>')
                    .click(function() {
                        other.toggle();
                        line == 1 && resetBtn.toggle();
                        moreBtn.toggleClass('icon-downarrow').toggleClass('icon-uparrow');
                        $('.layui-table').each(function() {
                        	var table = $(this).data('joyintable');
                        	table && table.$element.next().is(':visible') && table.fullHeight();
                        });
                    });
                other.hide();
            }
            // 添加按钮区域
            self.prepend(btns);
        });
    };
}());

(function ($) {
    function fnAdjustAjaxParam(keyword, options) {
        var object = {page: options.pager ? options.pager.currentPage : 1};
        if (options.parentIds) {
            var parentIdArr = options.parentIds.split(",");
            $(parentIdArr).each(function (i, parentId) {
                var $val;
                if ($.isArray($("#" + parentId).val())) {
                    $val = $("#" + parentId).val().join(',');
                } else {
                    $val = $("#" + parentId).val();
                }
                object[$("#" + parentId).attr("name")] = $val;
            });
            object["param"] = options.inputSelectIgnorecase=='03'?keyword:options.inputSelectIgnorecase=='02'?keyword.toLowerCase():keyword.toUpperCase();
        } else {
            object["param"] = options.inputSelectIgnorecase=='03'?keyword:options.inputSelectIgnorecase=='02'?keyword.toLowerCase():keyword.toUpperCase();
        }
        return {data: object};
    };
    $.fn.associateInput = function () {
        $(this).each(function () {
            if (typeof $(this).attr("disabled") != 'undefined' || $(this).data('bsSuggest')) {
                return;
            }
            $(this).attr('maxlength', 200).after('<div class="input-inline-btn">'
                + '<button type="button" class="btn btn-default dropdown-toggle" data-th-data-toggle="dropdown">'
                + '<span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right" role="menu">'
                + '</ul></div>');
            var effectiveFields = $(this).data("effectivefields");
            if (effectiveFields) {
                effectiveFields = effectiveFields.split(",");
            } else {
                effectiveFields = ['code', 'shortName']
            }
            var elementId = $(this).attr('id');
            var effectiveFieldsAlias = $(this).data("effectivefieldsalias");
            var showBtn = false;
            var delayUntilKeyup = true;
            var idField = $(this).data("idfield");
            var keyField = $(this).data("keyfield");
            var linkId = $(this).data("linkedids");
            var suggestCode = $(this).data("code");
            var stationCode = $(this).data("rolestationcode");
            var type = $(this).data("type");
            var url = $(this).data("url");
            var parentIds = $(this).data("parentids");
            var callBack = $(this).data("callback");
            var inputSelectIgnorecase = $(this).attr('inputSelectIgnorecase')||input_select_ignorecase||'03';
            $(this).bsSuggest({
                url: JoyinUtil.getRealPath(url, elementId),
                parentIds: parentIds,
                effectiveFieldsAlias: effectiveFieldsAlias,
                effectiveFields: effectiveFields,
                fnAdjustAjaxParam: fnAdjustAjaxParam,
                inputSelectIgnorecase: inputSelectIgnorecase,
                ignorecase: true,
                showHeader: true,
                showBtn: showBtn,
                delayUntilKeyup: delayUntilKeyup,
                getDataMethod: "url",
                allowNoKeyword: false,
                listStyle: {
                	'max-height': '300px'
                },
                idField: idField,
                keyField: keyField,
                processData: function (json) {// url 获取数据时，对数据的处理，作为 getData 的回调函数
                    var i, len, data = {value: []};
                    if (!json || (_.isArray(json) && json.length == 0) || (json.root && json.root.length == 0)) {
                        return false;
                    }
                    if(json.root) {
                    	data = json;
                    	data.value = json.root;
                    }
                    else {
                    	data.value = json;
                    }
                    return data;
                }
            }).on('onSetSelectValue', function (e, keyword, data) {
                window.__cancelled = true;
                setTimeout(function() {
                    window.__cancelled = false;
                }, 100);
                var $hidden = $("#" + $(this).attr("id") + "_hidden");
                if ($hidden.length === 0) {
                    $hidden = $('<input type="hidden">').attr('id', $(this).attr("id") + "_hidden");
                    $hidden.insertAfter($(this));
                }
                $(this).data('selected', data);
                $hidden.val(data.hidCode);
                if (linkId && $("#" + linkId)) {
                    $("#" + linkId).val(data.linkValue);
                }
                $(this).trigger('change');
                if (callBack) {
                    var func = eval(callBack);
                    new func(data);
                }
            });
            // add by 何阳阳  20161209 start
            $(this).change(function () {
                if (!$(this).val()) {
                    $(this).data('selected', {});
                    var elementId = '#' + $(this).attr("id") + '_hidden';
                    if ($(elementId).length > 0) {
                        $(elementId).val('');
                    }
                    if (linkId && $('#' + linkId)) {
                        $('#' + linkId).val('');
                    }
                }
            });
            // add by 何阳阳  20161209 end
        });
    };
})(jQuery);

/*按钮组下拉选项*/

(function ($) {
    $.fn.btnSelect=function (text,array,done) {
        var html=$(this).html(text);
        var childs=$(this).next(".layui-nav-child");
        $(childs).html("");
        for(var i=0;i<array.length;i++){
            var str = "<dd><a href='javascript:;'>"+array[i]+"</a></dd>";
            $(childs).append(str);
        }
        $(".layui-nav-child").on("click","dd a",function(){
            if($.isFunction(done)){
                return done($(this))
            }else {
                return;
            }
        });
    };
})(jQuery);

/**
 * 弹出框和AJAX
 */
!function (global, $) {
    var isClick = true;
    function assertClick() {
        if(isClick) {
            isClick = false;
            //定时器
            setTimeout(function() {
                isClick = true;
            }, 1000);//一秒内不能重复点击
        }
        else {
            throw "点击太快，请慢点操作!";
        }
    }
    var JoyinTemp = function () {
        var elementId = '';
        var isTodoList = false;
        return {
            signTodoList: function () {
                isTodoList = true;
            },
            /**
             * 初始化dialog对话框
             *
             * @param title
             *            对话框title
             * @param url
             *            dialog URL
             * @param width
             *            dialog宽度
             * @param height
             *            dialog高度
             * @param paramObj
             *            新页面初始化参数
             * @param callback
             *            画面关闭时的回调函数
             * @param btns 按钮 {name1:function1, name2:function2}
             */
            dialog: function (title, url, width, height, paramObj,
                              callback, btns) {
                var param = [];
                if (paramObj) {
                    $.each(paramObj, function (key, val) {
                        param.push(key + '=' + encodeURIComponent(paramObj[key]));
                    });
                }
                var paraStr = param.join('&');
                if (url && paraStr && url.indexOf('?') == -1) {
                    paraStr = '?' + paraStr;
                }
                var $width = $(window).width();
                var realWidth;
                if (!width) {
                    realWidth = 0.5 * $width + 'px';
                } else if ((width + '').indexOf('%') != -1) {
                    realWidth = (parseFloat(width) / 100) * $width + 'px';
                } else {
                    realWidth = parseFloat(width) + 'px';
                }
                if(url && url.indexOf(basePath) != 0 && url.indexOf('/') == 0) {
                    url = JoyinUtil.getRealPath(url);
                }
                var option = {
                    type: 2,
                    title: title,
                    shade: 0.8,
                    resize: false,
                    area: [realWidth, height || '90%'],
                    content: url + paraStr,
                    end: function () {
                        if ($.isFunction(callback)) {
                            callback.call(callback, top.returnData);
                            top.returnData = null;
                        }
                    }
                };
                if (btns) {
                    option.btn = [];
                    option.btnAlign = 'c';
                    for (var k in btns) {
                        option.btn.push(k);
                        if (option.btn.length == 1) {
                            option.yes = btns[k];
                        }
                        else {
                            option['btn' + option.btn.length] = btns[k];
                        }
                    }
                }
                return layer.open(option);
            },
            /**
             * 初始化confirm弹出窗
             *
             * @param message
             *            弹出窗title
             * @param yesMethod
             *            确定按钮回调函数
             * @param noMethod
             *            取消按钮回调函数
             */
            confirm: function (message, yesMethod, result, noMethod) {
                var index = layer.confirm(message, {
                    id: 'JOY_confirm' + Math.random(),
                    icon: 3,
                    btn: ['确认', '取消']
                }, function () {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(yesMethod)) {
                        yesMethod(result);
                    }
                }, function () {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(noMethod)) {
                        noMethod(result);
                    }
                });
            },
            confirmMulti: function (message, btnArr, method1, method2, method3) {
                var index = layer.confirm(message, {
                    icon: 3,
                    btn: btnArr || ['确认', '取消']
                }, function () {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(method1)) {
                        method1();
                    }
                }, function () {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(method2)) {
                        method2();
                    }
                }, function () {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(method3)) {
                        method3();
                    }
                });
            },
            /**
             * 初始化promp弹出窗
             *
             * @param message
             *            弹出窗title
             * @param formType
             *            【0，1，2】输入框类型
             * @param callback
             *            回调函数
             * @returns
             */
            prompt: function (message, formType, callback, initValue, maxlength) {
                var index = layer.prompt({
                    title: message,
                    value: initValue,
                    formType: formType,
                    maxlength: maxlength
                }, function (result) {
                    assertClick();
                    layer.close(index);
                    if ($.isFunction(callback)) {
                        callback(result);
                    }
                });
            },

            /**
             * 初始化alert弹出窗
             *
             * @param message
             *            弹出信息
             * @param closeMethod
             *            关闭回调函数
             * @param iconType
             *            图标类型 1: 2:叉 3：问好
             * @returns
             */
            alert: function (message, iconType, callback, result) {
                setTimeout(function() {
                    var index = layer.alert(message, {
                        icon: iconType || 1,
                        closeBtn: 0
                    }, function () {
                        assertClick();
                        layer.close(index);
                        if (callback && typeof callback === "function") {
                            callback(result);
                        }
                    });
                }, 300);
            },

            /**
             * alertError消息框
             *
             * @param message
             *            错误消息
             * @param callback
             *            回调函数
             * @returns
             */
            error: function (message, callback) {
                var index = layer.alert(message, {
                    icon: 2,
                    closeBtn: 0,
                    area: ["400px", "160px"],
                    maxHeight: 230
                    // 按钮
                }, function () {
                    assertClick();
                    layer.close(index);
                    if (callback && typeof callback === "function") {
                        callback();
                    }
                });
            },

            /**
             * alertWarning消息框
             *
             * @param message
             * @param closeMethod
             * @returns
             */
            warn: function (message, closeMethod) {
                this.alert(message, 7, closeMethod);
            }
            , showSelectUserDialog: function (multiselect, from, nodeId, moduleId, type, initSelected, callback) {
                var paramStr = 'multiselect=false';
                var path = JoyinUtil.getRealPath('workflow/userSelect/init');
                var callbackFunc = function () {};
                if (arguments.length > 0 && arguments.length < 8) {
                    if ($.isFunction(multiselect)) {
                        callbackFunc = multiselect;
                    } else if ($.isFunction(from)) {
                        callbackFunc = from;
                    } else if ($.isFunction(nodeId)) {
                        callbackFunc = nodeId;
                    } else if ($.isFunction(moduleId)) {
                        callbackFunc = moduleId;
                    } else if ($.isFunction(type)) {
                        callbackFunc = type;
                    } else if ($.isFunction(initSelected)) {
                        callbackFunc = initSelected;
                    } else if ($.isFunction(callback)) {
                        callbackFunc = callback;
                    }
                    var param = {};
                    if (typeof multiselect === 'string' || typeof multiselect === 'boolean') {
                        param['multiselect'] = multiselect;
                    }
                    if (from == 'default'){
                        param['default'] = 'default';
                        from = 'workflow'
                    }
                    if (typeof from === 'string') {
                        param['from'] = from;
                    }
                    if (typeof nodeId === 'string') {
                        param['nodeId'] = nodeId;
                    }
                    if (typeof moduleId === 'string') {
                        param['moduleId'] = moduleId;
                    }
                    if (typeof type === 'string') {
                        param['type'] = type;
                    }
                    // 处理人选择画面显示的处理人
                    if(window.showUserIds) {
                        param.showUserIds = window.showUserIds;
                    }
                }
                var height = '400px';
                var btns = {};
                var dialogIndex = -1;
                btns[JoyinUtil.getLabel('userselect.btn.submit')] = function () {
                    var executeDialogResult = JoyinUtil.executeDialogMethod(dialogIndex, 'setUser');
                    if (executeDialogResult != -1) {
                        layer.close(dialogIndex);
                        window.workflowLoadingIndex = layui.layer.open({type:3});
                    }
                };
                btns[JoyinUtil.getLabel('userselect.btn.cancel')] = function () {
                    layer.close(dialogIndex);
                };
                if (typeof initSelected === 'object') {
                    window.params = $.extend({}, param, initSelected);
                }
                else {
                    window.params = param;
                }
                if (from === 'workflow') {
                    dialogIndex = this.dialog(JoyinUtil.getLabel('userselect.title.user'), path, '600px', height, param, function (params) {
                        if (params && _.isArray(params)) {
                            callbackFunc.call(callbackFunc, params[0], params[1], params[2], params[3]);
                        }
                    }, btns);
                } else {
                    dialogIndex = this.dialog(JoyinUtil.getLabel('userselect.title'), path, '600px', height, param, function (params) {
                        if (params && _.isArray(params)) {
                            callbackFunc.call(callbackFunc, params[0], params[1], params[2], params[3]);
                        }
                    }, btns);
                }
            },
            /**
             * 普通ajax请求，必须是Post请求
             */
            ajax: function (url, param, callback, errorCallback) {
                var elementIdForLog = Joyin.getElementId(url);
                if (!param) {
                    param = {};
                }
                param.elementIdForLog = elementIdForLog || Joyin.elementId;
                param.pageIdForLog = pageId;
                param.isTodoList = isTodoList;
                // “保存”、“提交”操作时，记录画面修改值
//                if(param.elementIdForLog && (param.elementIdForLog.indexOf('_submit') != -1 || param.elementIdForLog.indexOf('_save') != -1)) {
//                    if (param.elementIdForLog.indexOf('_submit') != -1 && param.businessInfo) {
//                        JoyinUtil.setModifyFormData(JSON.parse(param.businessInfo));
//                    } else {
//                        JoyinUtil.setModifyFormData(param);
//                    }
//                }
                if(url && url.indexOf(basePath) != 0 && url.indexOf('/') == 0) {
                    url = JoyinUtil.getRealPath(url);
                }
                $.ajax({
                    type: "POST", url: url, data: param, success: function (result) {
                        Joyin.processResult(result, callback, errorCallback);
                    }
                });
            },
            /**
             * 同步ajax请求，必须是Post请求
             */
            ajaxSync: function (url, param, callback) {
                var elementId = Joyin.getElementId(url);
                if (!param) {
                    param = {};
                }
                param.logElementId = elementId;
                param.elementIdForLog = elementId;
                param.pageId = pageId;
                param.isTodoList = isTodoList;
                // “保存”、“提交”操作时，记录画面修改值
//                if(param.elementIdForLog && (param.elementIdForLog.indexOf('_submit') != -1 || param.elementIdForLog.indexOf('_save') != -1)) {
//                    if (param.elementIdForLog.indexOf('_submit') != -1 && param.businessInfo) {
//                        JoyinUtil.setModifyFormData(JSON.parse(param.businessInfo));
//                    } else {
//                        JoyinUtil.setModifyFormData(param);
//                    }
//                }
                if(url && url.indexOf(basePath) != 0 && url.indexOf('/') == 0) {
                    url = JoyinUtil.getRealPath(url);
                }
                $.ajax({
                    type: "POST", url: url, data: param, async: false, success: function (result) {
                        Joyin.processResult(result, callback);
                    }
                });
            },
            /**
             * 参数是json字符串的ajax请求，必须是Post请求
             */
            ajaxJson: function (url, param, callback, sync, errorCallback) {
                var elementIdForLog = Joyin.getElementId(url);
                if (url && url.indexOf("pageIdForLog") == -1) {
                    if (url.indexOf("?") != -1) {
                        if (pageId) {
                            url += "&pageIdForLog=" + pageId + "&elementIdForLog=" + elementIdForLog;
                        }

                    } else {
                        if (pageId) {
                            url += "?pageIdForLog=" + pageId + "&elementIdForLog=" + elementIdForLog;
                        }
                    }
                }
                // 是否为待办事项标识
                if (param) {
                    url += (url.indexOf("?") != -1 ? '&' : '?') + 'isTodoList=' + isTodoList;
                }
                param = JSON.stringify(param);
                if(url && url.indexOf(basePath) != 0 && url.indexOf('/') == 0) {
                    url = JoyinUtil.getRealPath(url);
                }
                // “保存”、“提交”操作时，记录画面修改值
//                if(elementIdForLog && (elementIdForLog.indexOf('_submit') != -1 || elementIdForLog.indexOf('_save') != -1)) {
//                    var data = JSON.parse(param);
//                    if (elementIdForLog.indexOf('_submit') != -1 && data.businessInfo) {
//                        JoyinUtil.setModifyFormData(JSON.parse(data.businessInfo));
//                    } else {
//                        JoyinUtil.setModifyFormData(data);
//                    }
//                }
                if (sync != undefined && !sync) {
                    sync = false;
                } else {
                    sync = true;
                }

                $.ajax({
                    type: "POST",
                    url: url,
                    dataType: "json",
                    contentType: "application/json",
                    async: sync,
                    data: param,
                    success: function (result) {
                        Joyin.processResult(result, callback, errorCallback);
                    }
                });
            },
            processResult: function (result, callback, errorCallback) {
                var showMessage = function (message, messageType) {
                    // 如果是错误消息，则不执行回调函数
                    if (result && result.statuCode != 200) {
						JoyinUtil.disableButton(Joyin.elementId, false);
                        return JoyinUtil.showMessage(message, messageType, errorCallback, result);
                    }
                    if(messageType === 'confirm' && typeof errorCallback != 'undefined' && $.isFunction(errorCallback)) {
                        return JoyinUtil.showMessage(message, messageType, callback, result, errorCallback);
                    }
                    JoyinUtil.showMessage(message, messageType, callback, result);
                };

                var multiMessage = function(list, i, callback, result) {
                    if (i < list.length) {
                        JoyinUtil.showMessage(list[i].message, list[i].messageType, function () {
                            multiMessage(list, i + 1, callback, result);
                        });
                    } else if ($.isFunction(callback)) {
                        if (!result.data) {
                            result.data = '';
                        }
                        callback(result);
                    }
                };

                // message 排序，根据画面中元素的先后次序排序
                var sortMessage = function (messageList) {
                    if (_.isArray(messageList)) {
                        var fields = [];
                        $(document.forms[0] || 'body').find(':input:visible:not(:button), table:visible').each(function (i, item) {
                            var name = $(item).attr('name');
                            if (name) fields.push(name);
                        });
                        messageList.sort(function (a, b) {
                            var sort = fields.indexOf(a.field) - fields.indexOf(b.field);
                            if (sort === 0) {
                                sort = (a.order || 0) - (b.order || 0);
                                if (sort === 0) {
                                    if (a.rowId && b.rowId) {
                                        sort = parseInt(a.rowId) - parseInt(b.rowId);
                                    }
                                }
                            }
                            return sort;
                        });
                    }
                };
                //个性化字段必填error check
                var checkPersonalFields = function(result) {
                    var personalFieldErrors = [];
                    var personalFields = $(document.forms[0] || 'body').find(':input[id^="personalField_"]');
                    // 查找label
                    var _findPrevLabel = function(element, level) {
                        var $el = element.prev();
                        if(!$el.is('label') && level > 0) {
                            $el = $el.find('label');
                            if($el.length === 0) {
                                return _findPrevLabel(element.parent(), level-1);
                            }
                        }
                        return $el.text().replace(/\*/g, '');
                    };
                    personalFields.filter(function(){
                        return $(this).prop('required') && !$(this).val();
                    }).each(function(i, item) {
                        var personalField = $(item);
                        personalFieldErrors.push({
                            field: personalField.attr('name'),
                            message: '请输入'+ _findPrevLabel($(personalField), 3) + '。',
                            order: i
                        });
                    });
                    if (personalFieldErrors.length > 0) {
                        result.statuCode = 500;
                        result.messageType = 'error';
                        if(_.isArray(result.errorList)) {
                            result.errorList = result.errorList.concat(personalFieldErrors);
                        }
                        else {
                            result.errorList = personalFieldErrors;
                        }
                    }
                };
                // 清空所有错误
                $('.errors').removeClass('errors');
                // string类型的错误消息
                if (result && typeof result.message === 'string') {
                    return showMessage(result.message, result.messageType);
                }
                // 保存或者是提交按钮的校验方法,才执行个性化字段必填验证
                if($('#' + Joyin.elementId).is('.btn-save,.btn-submit')){
                    checkPersonalFields(result);
                }
                // 提示确认消息
                if (result && (!result.errorList || result.errorList.length == 0) && result.joyinMessages && result.joyinMessages.length > 0) {
                    return multiMessage(result.joyinMessages, 0, callback, result)
                }
                // 后台valid错误消息
                if (result && result.errorList && result.errorList.length) {
                    var messages = '';
                    if (!result.sortable) {
                        // 如果未开启后台排序，则进行前台排序
                        sortMessage(result.errorList);
                    }
                    $.each(result.errorList, function (i, msg) {
                        var field = msg.field;
                        var message = msg.message;
                        var rowId = msg.rowId;
                        var componentName = msg.componentName;
                        if (field) {
                            var fieldId = '';
                            if (field.indexOf('\.') != -1) {
                                fieldId = field.substring(field.indexOf('\.') + 1);
                            } else {
                                if(componentName) {
                                    fieldId = componentName + '_' + field;
                                }
                                else {
                                    fieldId = field;
                                }
                            }
                            var $el = $('#' + fieldId);
                            if ($el.length === 0) {
                                $el = $(':input[name="' + (componentName ? componentName + '.' + field : field) + '"]');
                            }
                            if ($el.length === 0) {
                                $el = $('*[name="' + (componentName ? componentName + '.' + field : field) + '"]');
                            }
                            if ($el.is('.input-select')) {
                                $el = $el.find(' ~ .select2').find('.select2-selection');
                            }
                            if ($el.is('.input-checkbox')) {
                                $el = $el.next('ul.layui-checkbox-u').find('li.layui-chcekbox');
                            }
                            if ($el.is('table')) { // grid验证错误处理
                                $el = $($el[0]);
                                var title = $el.attr('title') || $el.attr('name');
                                title = JoyinUtil.getMessage(title);
                                var rows = $el.next().find('.layui-table-main').find('tr');
                                $el = $el.next().find('.layui-table-main').find('.layui-table');
                                if (rowId) {
                                    var row = $el.find('tr[data-index="' + rowId + '"]');
                                    var column = msg.column;
                                    if (column !== 'rowId') {
                                        row.find('td[data-field="' + column + '"]').addClass('errors');
                                    }
                                }
                                var rowIndex = 0;
                                rows.each(function (i, tr) {
                                    if ($(tr).attr('data-index') === rowId) {
                                        rowIndex = i + 1;
                                    }
                                });
                                message = message.replace('tableName', title).replace('rowIndex', rowIndex);
                            }
                            $el.addClass('errors');
                        }
                        if (messages) {
                            messages = messages + '<br>';
                        }
                        messages = messages + '<span>' + (i + 1) + '.&nbsp;' + message + '</span>';
                    });
                    showMessage(messages, result.messageType);
                    return;
                }
                // 导入文件验证消息处理
                //添加一级判断在ie9中对于undefine的变量进行indexof会导致出错
                if($('iframe').length > 0 && $('iframe').attr('src') && $('iframe').attr('src').indexOf('framework/fileUpload/init') != -1) {
                    if($.isArray(result)) {
                        this.showCheckResult(result);
                    }
                    else {
                        //防止在进行导入前check时进行了两次的弹框
                        if(result.data != 'noInfoShowOut'){
                            $('iframe').length > 0 && $('iframe')[0].contentWindow.JoyinUtil.hideLoading();
                            this.alert(JoyinUtil.getMessage('FW_I_0001'));
                        }

                    }
                }
                if ($.isFunction(callback)) {
                    callback(result);
                }
            }
            ,showCheckResult: function(result) {
                if(result.length === 0) {
                    $('iframe').length > 0 && $('iframe')[0].contentWindow.JoyinUtil.hideLoading();
                    return this.alert(JoyinUtil.getMessage('FW_I_0002'));
                }
                $('iframe').each(function(i, frame) {
                    // 文件上传控件
                    if($(frame).attr('src').indexOf('framework/fileUpload/init') != -1) {
                        if($.isFunction(frame.contentWindow.showErrorMessage)) {
                            frame.contentWindow.showErrorMessage.call(frame.contentWindow, result);
                        }
                    }
                });
            }
            /**
             * 模拟表单提交，导出excel
             * 当使用公共导出模板时注意事项：
             *    1) 多个TAB页共存时，只能导出当前显示的表格。
             *    2) 如果画面有多个表格同展示，为了能正确定位要导出的表格，在不需要被导出的表格上指定none-export属性。
             * @param url 提交的请求url
             * @param paramObj 提交请求的参数对象
             * @param callback 导出成功后的回调函数
             * @param 回调函数延迟执行时间（默认为1000毫秒），设置为0时，回调函数不生效
             */
            , exportExcel: function (url, paramObj, callback, millisecond) {
                if(url && url.indexOf(basePath) != 0 && url.indexOf('/') == 0) {
                    url = JoyinUtil.getRealPath(url);
                }
                var form = $("<form action='" + url + "' method='POST'></form>");
                $(document.body).append(form);
                paramObj.colsData = [];
                // 获取当前画面所有显示的带有lay-filter且没有none-export属性的表格。
                let tables = $('table.joyin-table:not([none-export])');
                // 遍历所有需导出的表格
                tables.each(function () {
                    let joyintable = $(this).data('joyintable'),
                        filter = joyintable ? joyintable.filter : $(this).attr('lay-filter'), tblData = {}, cols = [];
                    // 只获取获取表头
                    var tabs = $('div.layui-table-box > div.layui-table-header > table.layui-table th', 'div[lay-id="' + filter + '"]:visible');
                    if(paramObj.multipleSheet){
                        tabs = $('div.layui-table-box > div.layui-table-header > table.layui-table th', 'div[lay-id="' + filter + '"]');
                    }
                    tabs.each(function(i, e) {
                        var head = $(e), col = head.data(), name = head.text();
                        if(name && col.field && col.field != 'operation') {
                            cols.push({
                                field: col.field,
                                name: name
                            });
                        }
                    });
                    tblData.cols = cols;
                    tblData.tableId = $(this).attr('id');
                    tblData.name = $(this).attr('name');
                    if(cols.length > 0) {
                        paramObj.colsData.push(tblData);
                    }
                });

                if (pageId) {
                    paramObj.pageId = pageId;
                }
                var event = JoyinUtil.getEvent();
                if ((elementId || elementId === '') && event && event.currentTarget && $(event.currentTarget).attr('id') && $(event.currentTarget).attr('id') != elementId) {
                    elementId = $(event.currentTarget).attr('id');
                }
                if (elementId) {
                    paramObj.elementId = elementId;
                }
                if ($(document.body).find('table:visible') && $(document.body).find('table:visible').attr('id')) {
                	paramObj.tableId = $(document.body).find('table:visible').attr('id');
                }
                else {
                	paramObj.tableId = $('table').attr('id');
                }
                if(elementId.indexOf("_btn_exportCheck")!=-1 || elementId.indexOf("_btn_exportCheckExcelByColumns")!=-1) {
                    paramObj.selectData = $('#'+paramObj.tableId).joyintable().getAllCheckedRows();
                    if (paramObj.selectData.length==0) {
                        Joyin.error(JoyinUtil.getMessage("COMMON_E_0002"));
                        return;
                    }
                }
                for (var key in paramObj) {
                    var value = paramObj[key];
                    if (value) {
                        form.append("<input name='" + key + "' value='" + ((key === 'colsData' || key === 'selectData') ? JSON.stringify(value) : value) + "'/>");
                    }
                }
                form.submit();
                form.remove();
                // 模板下载时不出进度条
                if(url !== 'downloadTemplate') {
                    // 显示导出文件进度条
                    JoyinProgress.showInDialog('exportProcessBar');
                }
                if ($.isFunction(callback)) {
                    setTimeout(callback, millisecond || 1000);
                }
            }
            /**
             * 上传文件
             * options参数说明
             *    type: 默认drag
             *      singleImage 单个图片上传，
             *      mutiImage 多图片上传，
             *      allowFile 允许上传指定后缀名的文件，
             *      noAutoUpload 选择文件后不自动上传文件
             *      drag 允许拖拽文件上传
             *      list 批量上传文件，同时显示文件列表
             *    size: 文件大小限制，单位是KB
             *    size: 允许上传的文件数。 当type指定为允许批量上传的类型时，该参数有效
             *    auto: 选择文件后是否自动上传，默认为false。当type为noAutoUpload或list时，该参数不生效
             *    hideTpl: 是否隐藏模板下载按钮（如果显示，则下载当前pageId对应的模板文件）
             *    width: 文件上传画面的宽度
             *    height: 文件上传画面的高度
             * uploadCallback 上传成功后的回调函数，接收参数为上传后的文件名（多个文件名会是一个数组）
             * callback 子画面关闭后调用
             */
            , uploadFile: function(options, uploadCallback, callback) {
                var uploadType = 'drag';
                var opt = {type:uploadType, hideTpl:false, auto: false, height: '530px', width: '750px', pageId: pageId};
                if($.isFunction(options)) {
                    if($.isFunction(uploadCallback)){
                        callback = uploadCallback;
                    }
                    uploadCallback = options;
                }
                if(!$.isFunction(options) && _.isObject(options)){
                    opt = $.extend({}, opt, options);
                }
                window.uploadCallback = uploadCallback || function(){};
                this.dialog(JoyinUtil.getLabel('FwFileUpload.title'), JoyinUtil.getRealPath('framework/fileUpload/init'), opt.width, opt.height, opt);
            }
            /**
             * 关闭顶层窗口
             */
            , closeTopWindow: function () {
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            },
            /**
             * 获取elementId
             */
            getElementId: function (url) {
                // 如果是导入控件
                if(JoyinUtil.hasUploadFrame() && url.indexOf('check') == -1){
                    return Joyin.elementId;
                }
                // 非导入控件
                var event = JoyinUtil.getEvent();
                var elementId = "";
                if (!event) {
                    return elementId;
                }
                if (event.currentTarget) {
                    elementId = $(event.currentTarget).attr('id');
                }
                if (event.srcElement && !elementId) {
                    elementId = $(event.srcElement).attr('id');
                    // 消息框
                    if(!elementId && ($(event.srcElement).parent().is('.layui-layer-btn') || $(event.srcElement).parent().is('.layui-btn'))) {
                        elementId = Joyin.elementId;
                    }
                }
                if (elementId) {
                    Joyin.elementId = elementId;
                }
                return elementId;
            },
            /**
             * 打印共通
             * @param options 提交请求的参数对象
             * options 参数说明(templateHtml:模板html,data:待装入模板的数据)
             */
            printTemplate: function (options) {
                var laytpl = layui.laytpl;
                var getTpl = options.templateHtml;
                laytpl(getTpl).render(options.data, function(html){
                    WebBrowser;
                    $('#_tempPrint').html(html);
                    $('#_tempPrint').printArea({
                        popClose : true,
                        mode : "popup",
                        extraCss :false
                    });
                    $('#_tempPrint').empty();
                });
            }
        }
    };
    global.Joyin = JoyinTemp();
}(window, window.jQuery);

/**
 * Created by zhengyan on 2018/1/10 0010.
 */
//1.type:控件选择类型,year年选择器,month年月选择器,date日期选择器,time时间选择器,datetime    日期时间选择器
//2.range - 开启左右面板范围选择,默认值：false
//3.calendar - 是否显示公历节日默认值：false
//4.showBottom - 是否显示底部栏默认值：true
//5.btns - 工具按钮默认值：['clear', 'now', 'confirm']
//6.format - 自定义格式默认值：yyyy-MM-dd
(function ($) {
    //按钮开关控制是否显示按钮
    var btnInit = null;
    var isShowBottom = false;
    if(DATE_SELECT_BTN_CTR&&DATE_SELECT_BTN_CTR=="01"){
        btnInit = ['clear', 'confirm'];
        isShowBottom = true;
    }
    var defaultOptions = {
        lang: 'cn'
        , type: 'date'
        , calendar: false
        , autoChoose: true
        , closeStop: 'body'
        , showBottom: isShowBottom
        , btns:btnInit
        , ready: function() {
            // 修正日期控件的位置
            var clientWidth = document.documentElement.clientWidth;
            var offset = $('.layui-laydate').offset();
            var fullWidth = $('.layui-laydate').width() + offset.left;
            var width = fullWidth - clientWidth;
            if(width > 0) {
                $('.layui-laydate').css('left', offset.left - width)
            }
        }
        ,change: function(value, date, endDate){
            if(!isShowBottom && (endDate != null && endDate != undefined && !$(event.target).is('.laydate-icon'))){
                if($($(this)[0].elem).hasClass('edit-widget')) return;
                if (event.srcElement.tagName != 'TD') return;
                $($(this)[0].elem).val(value).trigger('change');
                $('.layui-laydate').remove();
            }
        }
        //, btns: ['clear', 'confirm']
    };
    $.fn.textDate = function (range, format) {
        var laydate = layui.laydate;
        //this是调用这个函数的对象，已经不是通过 class input-dateSelect得到的jquery对象代表的dom
        $(this).each(function () {
            var initValue = $(this).val(),
                self = $(this),
                options = $(this).data('option');
            if(self.data('laydate')) {
            	return;
            }
            try {
                options = new Function("return " + options)();
            } catch (e) {
            }
            if(!options) options = {};
            if(!options.done || !$.isFunction(options.done)) {
                options.done = function(value, date, endDate) {
                    self.trigger('change');
                };
            }

            //时间图标
            if(self.parent().find('.time-icon').length == 0) {
            	var $timeIcon = $("<div class='time-icon'><i class='iconfont icon-date'></i></div>");
            	$timeIcon.click(function() {
                	if(self.data('laydate')) {
                		setTimeout(function() {
                			self.trigger('focus');
                		},10);
                	}
            	}).appendTo(self.parent());
            }
            
            if(typeof options.single === 'undefined') {
            	options.single = DATE_SELECT_ALLOW_SINGLE && DATE_SELECT_ALLOW_SINGLE === '01';
            }
            
            // 开启单边选择
            if(range && options.single) {
            	if(typeof options.showBottom === 'undefined' ) options.showBottom = true;
            	if(typeof options.btns === 'undefined' ) options.btns = ['clear', 'confirm'];
            }
            var _date = laydate.render($.extend({
                elem: this
                , range: range
                , format: format
                , value: initValue ? initValue : dateTextType && dateTextType=='01' ? range ? platDate + ' - ' + platDate : platDate : initValue
                , isInitValue: range && options.single ? false : !!initValue
            }, defaultOptions, options));
            self.data('laydate', _date);
            if(typeof options.readonly !== 'undefined' && options.readonly === true) {
            	self.prop('readonly', true).on('keyup', function(e) {
                    // 退格键或删除键
                    if(e.keyCode === 8 || e.keyCode === 46) {
                        self.val('').trigger('change');
                    }
                });
            }
            else {
                // 添加输入提示
            	var tips = '[2017-01-01]';
            	if(range) {
            		if(options.single) {
            			tips = '[2017-01-01 -]或[- 2099-01-01]';
            		}
            		else {
            			tips = '[2017-01-01 - 2017-02-01]';
            		}
            	}
            	self.attr('title', '日期格式 ' + tips).attr('autocomplete', 'off');
            	// 绑定事件
                self.on({
                	change: function() {
                		var val = self.val();
                		if(val) {
                			var isOk = false;
                			if(range) {
                				if(options.single) {
                					isOk = /\d{4}-\d{1,2}-\d{1,2} -\s*/.test(val);
                				}
                				else {
                					isOk = /\d{4}-\d{1,2}-\d{1,2} - \d{4}-\d{1,2}-\d{1,2}/.test(val);
                				}
                			}
                			else {
                				isOk = /\d{4}-\d{1,2}-\d{1,2}/.test(val);
                			}
                			self.toggleClass('errors', !isOk);
                			if(!isOk) {
                				setTimeout(function() {
                					self.val('').trigger('change');
                				}, 10);
                			}
                		}
                	}
                	,focus: function() {
                		self.data('oldplaceholder', self.attr('placeholder'));
                		self.attr('placeholder', tips);
                	}
                	,blur: function() {
                		self.attr('placeholder', self.data('oldplaceholder'));
                	}
                });
            }
            
            if(typeof self.attr("placeholder") === 'undefined') {
            	self.attr('placeholder', range ? '请选择日期区间' : '请选择日期');
            }
        });
    };
    $.fn.startDate = function () {
        var v = $(this).val(), _date = $(this).data('laydate'), range = _date.config.range;
        var values = v.split(' ' + range + ' ');
        return v ? ($.trim(values[0]) || '1900-01-01') : '';
    };
    $.fn.endDate = function () {
        var v = $(this).val(), _date = $(this).data('laydate'), range = _date.config.range;
        var values = v.split(' ' + range + ' ');
        return v ? ($.trim(values[1]) || '2099-12-31') : '';
    };
//
//    $('body').on('click', '.time-icon', function() {
//    	var elem = $(this).prev();
//    	if(elem.data('laydate')) {
//    		setTimeout(function() {
//    			elem.trigger('focus');
//    		},10);
//    	}
//    });
}(jQuery));

/**
 * Created by zhengyan on 2018/1/4 0004.
 */
(function ($) {

    function getFormatValue(moneyInput) {
        var moneyType = moneyInput.attr("data-fixtype") || 2;
        var moneyPattern = moneyInput.attr("data-pattern");
        var textRange = moneyInput.attr("data-textrange") || 2;
        var moneyValue = moneyInput.val();
        var precision = 0;//确定格式化后保留几位小数
        var moneyUnit = moneyInput.attr("unit");
        //只有输入的不是数字，小数点，负号全部为空
        if ((isNaN(moneyValue) || !moneyValue) && moneyValue != '-') {//11.a 11.
            moneyValue = moneyValue.replace(/[^\d\.\-]+/g, "");
            if (moneyValue == "") {
                return '';
            }
        }
        if (moneyPattern) {
            //对格式化进行处理
            var dotIndex = moneyPattern.lastIndexOf(".");//获取moneyPattern中小数点的位置
            if (dotIndex != -1) {
                precision = moneyPattern.length - dotIndex - 1;
            }
        }
        precision = textRange ? textRange : precision;
        return JoyinUtil.formatNumber(moneyValue, precision, moneyUnit, moneyType);
    }

    /*数值类文本框控件*/
    /*1. data-pattern:格式化表达式
     2. data-fixtype：对于小数的处理(1：取整；2：四舍五入；3：向上取整；4:向下取整)
     3. unit：单位，数值类型（格式化后的数据将会除以该单位） 默认值 1
     4. data-textrange:具体保留几位小数*/
    $.fn.textMoney = function () {
        // 如果有参数
        // $('#moneyInput').textMoney('getFormatValue')
        if(arguments && arguments.length === 1) {
            var fun = arguments[0];
            if(fun === 'getFormatValue') {
                return getFormatValue($(this));
            }
            return $(this).val();
        }
        $(this).each(function () {
            $(this).off('focus').on('focus', function () {
                var value = $(this).val();
                $(this).val(value.replace(/,/g, ""));
            }).off('blur').on('blur', function () {
                $(this).val(getFormatValue($(this)));
            }).off('input').on('input', function() {
                var moneyValue = $(this).val();
                if(moneyValue != '') {
                    //只有输入的不是数字，小数点，负号全部为空
                    if (isNaN(moneyValue) && moneyValue != '-') {
                        // moneyValue = moneyValue.replace(/[^\d\.\-]+/g, "");
                        // $(this).val(moneyValue);
                        $(this).val((moneyValue.match(/(\-)?\d+(\.\d+)?/) || [''])[0]);
                    }
                }
            });
            if($(this).val() && !$(this).data('selfformat')) {
                $(this).trigger('blur');
            }
        })
    }
}(jQuery));

/**
 * Created by zhengyan on 2018/1/8 0008.
 */
(function ($) {

    function getFormatValue(numberInput) {
        var numberFixtype = numberInput.attr("data-fixtype") || 2;
        var numberPattern = numberInput.attr("data-pattern");
        var numberVal = numberInput.val();
        var textRange = numberInput.attr("data-textrange") || 2;
        var precision = 0;//确定格式化后保留几位小数
        if ((isNaN(numberVal) || !numberVal) && numberVal != '-') {
            numberVal = numberVal.replace(/[^\d\.\-]+/g, "");
            if (numberVal == "") {
                return '';
            }
        }
        //对data-pattern进行处理
        if (numberPattern) {
            //data-pattern存在时，要获得小数点的位数，要知道整数部分有几位，还有小数部分有几位
            var patternDot = numberVal.lastIndexOf(".");//获取小数点的位置,索引是从0开始
            if (patternDot != -1) {
                precision = numberVal.length - patternDot - 1;
            }
        }
        precision = textRange ? textRange : precision;
        return JoyinUtil.formatNumber(numberVal, precision, 1, numberFixtype);
    }

    /*数值类文本框控件
    1. data-pattern:格式化表达式
    2. data-fixtype：对于小数的处理(1：取整；2：四舍五入；3：向上取整；4:向下取整)
    3. data-textrange:具体保留几位小数*/
    $.fn.textNumber = function () {
        // 如果有参数
        // $('#moneyInput').textNumber('getFormatValue')
        if(arguments && arguments.length === 1) {
            var fun = arguments[0];
            if(fun === 'getFormatValue') {
                return getFormatValue($(this));
            }
            return $(this).val();
        }
        $(this).each(function () {
            $(this).off('focus').on('focus', function () {
                var value = $(this).val();
                $(this).val(value.replace(/,/g, ""));
            }).off('blur').on('blur', function () {
                $(this).val(getFormatValue($(this)));
            }).off('input').on('input', function() {
                var moneyValue = $(this).val();
                if(moneyValue != '') {
                    //只有输入的不是数字，小数点，负号全部为空
                    if (isNaN(moneyValue) && moneyValue != '-') {
                        // moneyValue = moneyValue.replace(/[^\d\.\-]+/g, "");
                        // $(this).val(moneyValue);
                        $(this).val((moneyValue.match(/(\-)?\d+(\.\d+)?/) || [''])[0]);
                    }
                }
            });
            if($(this).val() && !$(this).data('selfformat')) {
                $(this).trigger('blur');
            }
        })
    }
}(jQuery));

/**
 * Created by zhengyan on 2018/1/18 0018.
 */
/*
  1. data-url：ajax请求后台url
  2. initValue：默认值（可选）
  3. childrenIds,parentIds用于联想框的id
  4. multiple下拉框的多选
  5. placeholder模糊查询输入框中的提示信息（可选）
  6. data-result初始化model中获取，el表达式
* */
$(function ($) {
    var ajaxResult = [], OPTION_ALL_ID = '_all';
    var displayHasSelectedTitle = function (element) {
        var next = element.find(' ~ .select2')//element.next();
        var parentWidth = next.width();
        var options = next.find(".select2-selection__choice");
        var clear = next.find(".select2-selection__clear");
        var clearWidth = 10;
        if (clear && clear.length > 0) {
            clearWidth = clear.width();
        }
        var optionWidth = 0;
        $.each(options, function (i, item) {
            optionWidth += $(item)[0].scrollWidth;
        });
        var selectedLength = 0;
        var title = "";
        if (parentWidth - 50 - optionWidth - (options.length + 1) * 10 <= 0) {
            var lis = next.find(".select2-selection__rendered").find("li");
            var selectLis = lis.filter(function (i, item) {
                return !!$(item).attr("title")
            }).each(function (i, item) {
                var data = $(item).data('data');
                if(!data) return;
                if(data.id === OPTION_ALL_ID) {
                    data.selected = false;
                }
                else if ($(item).attr("title")) {
                    data.selected = true;
                    selectedLength++;
                    title += $(item).attr("title") + ","
                }
            });
            selectLis.first().before("<li class='select2-selection__choice' title='" + title.substring(0, title.length - 1)
                + "'>已选" + selectedLength + "项</li>");
            selectLis.remove();
        }
    };
    var oldMatcher = function (element) {
        var newMatcher = function (term, text, child) {
            var inputVal = term;
            if (typeof text != 'undefined' && text && text.indexOf(inputVal) >= 0) {
                return true;
            }
            var nowObj;
            var $child = element.children('[value="' + child.id + '"]');
            $child.each(function () {
                nowObj = $(this);
            });
            if (nowObj) {
                var mka = nowObj.attr("mka") || $child.html();
                var mkb = nowObj.attr("mkb") || $child.toPinyin();
                var mkc = nowObj.attr("mkc") || '';
                if (mka.toLowerCase().indexOf(inputVal.toLowerCase()) >= 0
                    || mkb.toLowerCase().indexOf(inputVal.toLowerCase()) >= 0
                    || mkc.toLowerCase().indexOf(inputVal.toLowerCase()) >= 0) {
                    return true;
                }
            }
            return false;
        }

        function wrappedMatcher(params, data) {
            var match = $.extend(true, {}, data);
            if (params.term == null || $.trim(params.term) === '') {
                return match;
            }
            if (data.children) {
                for (var c = data.children.length - 1; c >= 0; c--) {
                    var child = data.children[c];
                    var doesMatch = newMatcher(params.term, child.text, child)
                        || newMatcher(params.term, child.id, child);
                    if (!doesMatch) {
                        match.children.splice(c, 1);
                    }
                }
                if (match.children.length > 0) {
                    return match;
                }

            }
            if (newMatcher(params.term, data.text, data)
                || newMatcher(params.term, data.id, data)) {
                return match;
            }
            return null;
        }

        return wrappedMatcher;
    }

    /**
     * 复选下拉框选择所有出发事件
     * @param 当前控件id
     */
    var setAllChecked = function($e, $this) {
        if (($e.params.data && $e.params.data.id === OPTION_ALL_ID)
            || ($e.params.args && $e.params.args.data && $e.params.args.data.id === OPTION_ALL_ID)) {
            var selected = $e.params.args.data.selected;
            var resultOptArr = $($e.delegateTarget).data("result");
            if (!resultOptArr) {
                $($e.delegateTarget).data("result", ajaxResult);
                resultOptArr = ajaxResult;
            }
            var allOptIds = [];
            if(!selected) {
                $(resultOptArr).each(function(i, opt){
                    if (opt.id !== OPTION_ALL_ID) {
                        allOptIds.push(opt.id);
                    }
                });
            }
            $this.val(allOptIds).trigger("change");
        }
    };

    var sortOptions = function(formatOption, optArray) {
        if(formatOption) {
            return _.sortBy(optArray, 'id', 'text');
        }
        return _.sortBy(optArray, 'text');
    };
    
    var inputSelect = function ($this) {
        if(!$this.is('.input-select')) {
            return false;
        }
        if($this.data('select2')) {
            return true;
        }
        var elementId = $this.attr('id');
        var dataUrl = $this.attr("data-url");
        var placeholder = $this.attr("placeholder");
        var results = $this.data("result") || {};
        var initValue = $this.attr("initValue");
        var allowClear = $this.attr("allowClear");
        var childrenIds = $this.attr("childrenIds");
        var parentIds = $this.attr("parentIds");
        var multiple = $this.attr("multiple");
        var showSearch = $this.attr('searchable');
        var postData = $this.attr('data-postData');
        var inputSelectIgnorecase = $this.attr('inputSelectIgnorecase')||input_select_ignorecase||'03';
        if (postData) {
            postData = JSON.parse(postData);
        }
        var formatOption = $this.attr("formatoption") === "false" ? false : true;
        var showAll = $this.attr("showAll") === "true" ? true : false;
        var autosort = $this.attr("autosort") === "false" ? false : true;
        var noparent = $this.attr("noparent") === "false" ? false : true;
        var options = {
            placeholder: placeholder || '',
            language: "zh-CN",
            allowClear: !allowClear || allowClear == "true",
            closeOnSelect: !multiple,
            multiple: multiple,
            selectOnClose: false,
            maximumInputLength: 200,
            minimumResultsForSearch: 10,
            matcher: oldMatcher($this),
            sorter: function(optArray) {
                return autosort ? sortOptions(formatOption, optArray) : optArray;
            }
        };
        if(showSearch == 'false') {
            options.minimumResultsForSearch = -1;
        }
        if (formatOption) {
            options.templateResult = function(repo) {
                if (repo.id && repo.id !== OPTION_ALL_ID) {
                    return repo.id + ":" + repo.text;
                } else {
                    return repo.text;
                }
            };
        }
        // 解决 下拉框无法被清空的BUG
        if($this.is('select') && !options.multiple && options.allowClear) {
            $this.prepend('<option></option>');
        }
        if (initValue && dataUrl) {
            var dataObj = {initValue: initValue};
            if (postData) {
                $.extend(dataObj, postData);
            }
            if(multiple) {
                dataObj.length = initValue.split(',').length;
            }
            if (parentIds) {
                var parentArray = parentIds.split(",");
                $.each(parentArray, function (i, item) {
                    var parent = $("#" + item);
                    var parentValue = parent.val();
                    if ($.isArray(parentValue)) {
                        parentValue = parentValue.join(",");
                    }
                    dataObj[parent.attr("name")] = parentValue;
                })
            }
            $.ajax({
                url: JoyinUtil.getRealPath(dataUrl, elementId),
                type: 'post',
                async: false,
                data: dataObj
            }).done(function (data) {
                data = data.root||data;
                if (data && $.isArray(data)) {
                    results.results = data;
                }
            });
        }
        if (dataUrl) {
            options.ajax = {
                url: JoyinUtil.getRealPath(dataUrl, elementId),
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    var query = {
                        search: params.term?inputSelectIgnorecase=='03'?params.term:inputSelectIgnorecase=='02'?params.term.toLowerCase():params.term.toUpperCase():params.term,
                        page: params.page || 1,
                        length: params.length || 20
                    };
                    if(autosort) {
                        if(formatOption) {
                            query['key'] = 'id asc,';
                            query['order'] = 'text asc';
                        }
                        else {
                            query['key'] = 'text';
                            query['order'] = 'asc';
                        }
                    }
                    if (postData) {
                        $.extend(query, postData);
                    }
                    if (parentIds) {
                        var parentArray = parentIds.split(",");
                        $.each(parentArray, function (i, item) {
                            var parent = $("#" + item);
                            var parentValue = parent.val();
                            if ($.isArray(parentValue)) {
                                parentValue = parentValue.join(",");
                            }
                            query[parent.attr("name")] = parentValue;
                        });
                    }
                    return query;
                },
                processResults: function (data, params) {
                	ajaxResult = data;
                    data = data.root || data;
                    params.page = params.page || 1;
//                	// 添加全选功能
//                    if(showAll && options.multiple) {
//                    	data.length > 0 && data.unshift({'id': OPTION_ALL_ID, 'text': '全部'});
//                    }
                    return {
                        results : data,
                        pagination: {
                            more: (params.page * 20) < (ajaxResult.records || ajaxResult.length)
                        }
                    };
                }
            }
        }
        if (results && JSON.stringify(results) != "{}") {
            if ($.isArray(results.results)) {
                options.data = results.results;
                if (!initValue){
                    $.each(results.results,function(i,data){
                        if (data.object && typeof data.object === 'string'){
                            initValue = data.object;
                            return false;
                        }
                    });
                }
            }
            else {
            	if(typeof results === 'string') {
            		results = $.parseJSON(results);
            	}
                if ($.isArray(results)) {
                    options.data = results;
                    if (!initValue){
                        $.each(results,function(i,data){
                            if (data.object && typeof data.object === 'string'){
                                initValue = data.object;
                                return false;
                            }
                        });
                    }
                }
            }
        }

        if(!dataUrl && options.data && _.isArray(options.data)) {
            if (parentIds) {
                var _results = [], _resultsNoParent = [], parentValue;
                var parentArray = parentIds.split(",");
                $.each(parentArray, function (i, item) {
                    var parent = $("#" + item);
                    var selected = parent.data('select2') ? parent.select2('data') : (parent.data('sd') || parent.data());
                    if(selected && selected[0] && selected[0].col) {
                        parentValue = parent.val();
                        if ($.isArray(parentValue)) {
                            parentValue = parentValue.map(function(v) {
                                return selected[0].col + '.' + v;
                            }).join(",");
                        }
                        else {
                            parentValue = selected[0].col + '.' + parentValue;
                        }
                    }
                });
                if(parentValue) {
                    _.each(options.data, function(res) {
                        if(res.parentId && _.indexOf(res.parentId.split(','), parentValue) != -1) {
                            _results.push(res);
                        }
                        else if(!res.parentId) {
                            _resultsNoParent.push(res);
                        }
                    });
                }
                else {
                    if(noparent) _results = options.data;
                }
                options.data = _results.length > 0 ? _results : _resultsNoParent;
            }
        }


        // 查看模式
        if(typeof pageModel !== 'undefined' && pageModel === PAGE_MODEL_REFERENCE
            && (!$this.data('ignore') || $this.data('ignore') == 'false')) {
            $this.attr('disabled', 'disabled');
        }

        // 添加全选功能
        if(showAll && options.multiple) {
            options.data && options.data.unshift({'id': OPTION_ALL_ID, 'text': '全部'});
        }

        var select2Object = $this.select2(options);
        if (initValue) {
            var showField = $this.data('showField'), values = [], _valueArray = initValue.split(',');
            if(dataUrl && $this.hasClass('edit-widget') && showField) {
                if (options.data && $.isArray(options.data)) {
                    _.each(options.data, function(d) {
                        if(_valueArray.indexOf(d[showField]) != -1) {
                            values.push(d['id']);
                        }
                    });
                    select2Object.val(values);
                }
            }
            else {
                select2Object.val(_valueArray);
            }

            var selectSpan = $this.next();
            if(!selectSpan.is(':hidden')) {
            	if(!selectSpan.is('span.select2-container')) {
            		selectSpan = selectSpan.next();
            	}
            	var $container = $('#select2-' + elementId + '-container');
            	$container.text('');
            	selectSpan.css({'z-index':'3', maxWidth: selectSpan.width()});
            	$container.text($container.attr('title'));
            }
        }
        select2Object.on("change", function () {
            var event = JoyinUtil.getEvent();
            var isClear = false;
            if($(event.srcElement).is('.select2-selection__clear')) {
            	isClear = true;
            }
            if (childrenIds) {//p5
                var childrenArray = childrenIds.split(",");
                $.each(childrenArray, function (i, item) {
                    // 联动子项
                    var _val = $this.val(), _child = $("#" + item), _data = [], _initValue = [];
                    // 业务组件尚未加载时不触发
                    if(_child.length === 0) {
                    	return;
                    }
                    var selected = $this.data('select2') ? $this.select2('data') : $this.data();
                    var _results = _child.data("result");
                    var initFirst = inputSelect(_child);
                    var cellIndex = item.indexOf('_cell_');
                    // 如果child不是select2控件，直接清空
                    if(!_child.data('select2') && item && cellIndex != -1) {
                        _child.val('');
                        // 如果是表格行内编辑，则清空对应单元格
                        var tField = item.substr(0, cellIndex), trIndex = item.substr(cellIndex+6);
                        var tableView = $this.parents('.layui-table-view');
                        if(tableView.length > 0) {
                            var filter = tableView.prev().data('joyintable').filter;
                            $('table.layui-table tr[data-index=' + trIndex + ']', tableView).find('td[data-field=' + tField +']').find('div.layui-table-cell').empty();
                            _.each(layui.table.cache, function(k, key) {
                                var values = layui.table.cache[key];
                                if(key.indexOf(filter) == 0 && _.isArray(values) && values.length > trIndex) {
                                    delete values[trIndex][tField];
                                }
                            });
                        }
                        return;
                    }
                    var _opt = _child.data('select2').options.options, _oldVal = _child.val();
                    // 如果控件首次初始化，无需联动处理，否则会导致初始值丢失
                    if(!initFirst) {
                    	return;
                    }
                    if(isClear) {
                        if(typeof _results === 'string') {
                            _results = JSON.parse(_results);
                        }
                        if(!noparent) {
                            _results = [];
                        }
                        // 清空原始值
                        _child.select2('destroy').empty();
                    	_child.select2($.extend(_opt, {data: _results})).val([]).trigger('change');
                    	return;
                    }
                    if(_val) {
                        if(typeof _results === 'string') {
                            _results = JSON.parse(_results);
                        }
                        var _valArray = typeof _val === 'string' ? _val.split(',') : _val;

                        if(selected && _results && _.isArray(selected) && selected.length > 0) {
                            var _col = selected[0].col, _tempArray = [];
                            _.each(_valArray, function(_val) {
                                _.each(_results, function(v) {
                                    let vString = JSON.stringify(v);
                                    // 如果数据字典项的parentId未指定，或者指定的parentId中包含当前选中的值
                                    var _isVal = v.parentId && (v.parentId === _val || v.parentId.split(',').indexOf(_col + '.' + _val) != -1);
                                    // etliu 20200316 modify 如果数据字典项的parentId未指定，则不显示该选项
                                    if(!_tempArray.includes(vString) && (/*!v.parentId || */_isVal)) {
                                        _data.push(v);
                                        _tempArray.push(vString);
                                    }
                                });
                            });
                        }
                        // 清空原始值
                        _child.select2('destroy').empty();
                        if(_opt.allowClear && !_opt.multiple) {
                        	_child.append('<option></option>');
                        }
                    	_child.select2($.extend(_opt, {data: _data}));
                        if(_oldVal) {
                        	if(typeof _oldVal === 'string') {
                        		_oldVal = _oldVal.split(',');
                        	}
                        	_.each(_data, function(d) {
                        		if(_oldVal.indexOf(d.id) != -1) {
                        			_initValue.push(d.id);
                        		}
                        	});
                        }
                    }
                    // TODO 此控件联动时，如果当前控件值为空，不管子控件是否有初始值，子控件都会被置空（这是一个BUG）。
                    _child.val(_initValue.length == 0 ? '' : _initValue).trigger('change');
                });
            }
            setTimeout(function () {
                displayHasSelectedTitle($this)
            }, 10);
        }).trigger('change');
        //nihuai@2018/3/30
        //解决由于搜索区域悬浮后，下拉列表显示不完整问题
        select2Object.on('select2:open', function(e){
        	var selectSpan = $(this).next();
        	if(!selectSpan.is('span.select2-container')) {
        		selectSpan = selectSpan.next();
        	}
        	selectSpan.css({'z-index':'3', maxWidth: selectSpan.width()});
            $('body').css('overflow-x', 'hidden');
        }).on('select2:close', function(e){
            $('body').css('overflow-x', 'auto');
        });
        // 全选事件
        if(showAll) {
            select2Object.on("select2:selecting", function(e) {
                setAllChecked(e, select2Object);
            });
            select2Object.on("select2:unselecting", function(e) {
                setAllChecked(e, select2Object);
            });
        }
        $this.children().each(function (i, child) {
            var htmword = $(child).html();
            var pyword = $(child).toPinyin();
            var supperword = "";
            pyword.replace(/[A-Z]/g, function (word) {
                supperword += word
            });
            $(child).attr("mka", (htmword).toLowerCase());
            $(child).attr("mkb", (pyword).toLowerCase());
            $(child).attr("mkc", (supperword).toLowerCase());
        });
    };
    var setValue = function($this, value) {
    	
    };
    $.fn.textSelect = function () {
    	// 如果有参数
    	// $('#testSelect').textSelect('setValue','01')
    	if(arguments && arguments.length > 1) {
    		var fun = arguments[0];
    		if(fun === 'setValue') {
    			$(this).select2('destroy').attr('initValue', arguments[1]).textSelect();
    		}
    		return;
    	}

        $(this).each(function () {
            inputSelect($(this));
        });
    };
}(jQuery));

/**
 * Created by zhengyan on 2018/1/29 0029.
 */
/*
1. data-url：文件上传的路径。
2. id：必填，上传文件控件ID
3. data-allowfiletype：允许上传的文件的类型，竖线分隔。（可选，默认值 doc|docx|xls|xlsx|ppt）
4. data-inline：是否行内上传模式
5. data-width,data-height：指定拖拽区域大小
6. data-bind-action,可选，不提供自动生成确认上传按钮
7. data-showdelete 显示删除按钮(默认false）
8. data-callback  上传文件后的回调函数
9. name 指定name属性后，序列化方法将可以获取上传后文件的ID
*/
$(function ($) {

	var removeFileFromServer = function(fileNo, callback) {
		Joyin.confirm('请确认是否要删除该文件？', function() {
			Joyin.ajax(JoyinUtil.getRealPath('framework/remove/' + fileNo), {}, callback);
		});
	};
	
    $.fn.uploadFile = function () {
        var upload = layui.upload;

        $(this).each(function () {
        	if($(this).data('uploader')) {
        		return;
        	}

        	var uploadedFiles = {}, initFiles = [], files = {};
        	var deleteFile = function(fileNo) {
        		delete uploadedFiles[fileNo];
        		delete files[fileNo];
        	};
        	
            var options = $(this).data('option');
            var datas = $(this).data('data') || [];
            try {
                options = new Function("return " + options)();
            } catch (e) {
                options = {};
            }
            options = options || {};
            var url = options.url || JoyinUtil.getRealPath('framework/fileUpload/uploadFile');
            var allowfiletype = options.allowFileType || ''/* || 'doc/docx/xls/xlsx/ppt'*/; // 允许任何类型的文件
            var showdelete = options.showDelete;
            var inline = options.inline;
            var auto = options.autoUpload;
            var muit = options.muiltiple;
            var type = options.type || 'drag'; // 展现类型 drag/list
	        var width = options.width;
	        var height = options.height;
	        var bindAction = options.bindAction;
	        var callback = options.callback;
	        var disabled = $(this).attr('disabled') === 'disabled';
	        var _this = this;
	        var elemId = $(this).attr('id');
	        var uploadBtn, width, height, fileListView;

            if(typeof callback === 'string') {
                callback = eval(callback);
            }

            var elem = $(this)[0];
            if(muit && type == 'list') {
                var $table = $('<table class="layui-table"></table>')
                    ,$thead = $('<thead><tr><th>文件名</th><th>大小</th><th>状态</th>' + (disabled ? '' : '<th>操作</th>') + '</tr></thead>')
                    ,$thr = $('<tr></tr>')
                    ,$tbody = $('<tbody></tbody>')
                    ,$action = $('<button type="button" class="mult-file-btn layui-btn layui-btn-normal">选择多文件</button>')
                    ,$bindAction = $('<button type="button" class="mult-file-btn layui-btn">开始上传</button>');
                $table.append($thead.append($thr)).append($tbody);
                if(!disabled) {
                    $(this).append($action);
                    if(typeof auto != undefined && auto === false) {
                        $bindAction.css('margin-left', '10px');
                        $(this).append($bindAction);
                    }
                }
                $(this).append($table);
                fileListView = $tbody;
                elem = $action[0];
                bindAction = bindAction || $bindAction;
                $(this).toggleClass('layui-upload', true);
            }
            else {
                if (inline) {
                    $(this).addClass('layui-btn layui-btn-normal layui-btn-xs');
                    $(this).html('<i class="layui-icon">&#xe67c;</i>选择文件');
                    if (!bindAction) {
                        $(this).after('<span class="layui-btn layui-btn-xs">开始上传</span>');
                        uploadBtn = $(this).next();
                    }
                }
                else {
                    $(this).addClass('layui-upload-drag');
                    $(this).css({'width': width, 'height': height, 'padding-left': '5px', 'padding-right': '5px'});
                    $(this).html('<i class="layui-icon">&#xe67c;</i><p>点击上传，或将文件拖拽到此处</p>');
                    if (!bindAction && typeof auto != undefined && auto === false) {
                        $(this).after('<span class="layui-btn btn-full" style="vertical-align: top">开始上传</span>');
                        uploadBtn = $(this).next();
                    }
                }
            }

        	initFiles = datas || [];
        	// 设置初始值
        	if(initFiles && initFiles.length > 0) {
        		if(muit && type == 'list') {
        			for(var i = 0; i < initFiles.length; i++) {
        				var file = initFiles[i];
                		var tr = $(['<tr id="upload-'+ file.fileNo +'">'
        				            ,'<td><div class="layui-table-cell">'
        				            ,'<a href="'
        				            , JoyinUtil.getRealPath('/framework/download/' + file.fileNo)
        				            ,'">'
        				            ,file.fileName
        				            ,'</a></div></td>'
        				            ,'<td>'+ (file.size/1014).toFixed(1) +'kb</td>'
        				            ,'<td>上传成功</td>'
        				            ,(disabled ? '' : '<td><button data-no="' + file.fileNo + '" class="layui-btn layui-btn-mini layui-btn-danger file-delete">删除</button></td>')
        				            ,'</tr>'].join(''));
        				tr.find('.file-delete').on('click', function(){
        					var _btn = $(this), fileNo = _btn.data('no');
        					removeFileFromServer(fileNo, function() {
        						var tmpFiles = [];
        						_.each(initFiles, function(f) {
        							if(f.fileNo !== fileNo) {
        								tmpFiles.push(f);
        							}
        						});
        						initFiles = tmpFiles;
        						_btn.parents('tr').remove();
        					});
        					return false;
        				});
        				fileListView.append(tr);
        			}
        		}
        		else {
        			if(!muit) {
        				$(_this).hide();
        			}
        			var style = {
                        width: '14px',
                        height: '14px',
                        position: 'absolute',
                        color: '#000',
                        display: 'none'
                    };
                    style['margin-top'] = '-27px';
                    style['left'] = '50%';
                    style['top'] = '50%';
                    $.each(initFiles, function(i, file) {
                    	var name = file.fileName;
                        var $el = $('<div class="layui-upload-drag" style="width:' + width + 'px;height:' + height + 'px;padding-left: 5px;padding-right: 5px;"></div>')
                        .mouseover(function () {
                            $(this).css('background', '#ccc');
                            $down.show();
                            if($close) {
                            	$close.show();
                            }
                        }).mouseout(function () {
                            $(this).css('background', 'none');
                            $down.hide();
                            if($close) {
                            	$close.hide();
                            }
                        });
                        var $name = $('<div></div>').html(name);
                        $el.append($name);
                        if(!disabled) {
                        	var $close = $('<div><i class="layui-icon">&#x1006;</i></div>')
                        	.css(style).css('margin-left', '-50px').on('click', function () {
                        		removeFileFromServer(file.fileNo, function() {
            						var tmpFiles = [];
            						_.each(initFiles, function(f) {
            							if(f.fileNo !== file.fileNo) {
            								tmpFiles.push(f);
            							}
            						});
            						initFiles = tmpFiles;
            						$el.remove();
            						$(_this).show();
                        		});
                        	});
                        	$el.append($close);
                        }
                    	var $down = $('<div><a href="' + JoyinUtil.getRealPath('/framework/download/' + file.fileNo) + '"><i class="layui-icon">&#xe601;</i></a></div>')
                    		.css(style).css('margin-left', disabled ? '-25px' : 0);
                    	$el.append($down);

                       	if(muit) {
                       		$el.addClass('upload-muiltiple');
                       	}
                        $(_this).after($el);
                    });
        		}
        	}

            if(disabled) {
            	if(type !== 'list') {
            		$(this).addClass('layui-disabled').hide();
            		$(this).siblings('span.btn-full').remove();
            	}
            	else {
            		fileListView.find('button.file-delete').remove();
            	}
            	return;
            }
            $(this).data('getSelectedFiles', function() {
            	var tmpArray = [];
            	_.each(uploadedFiles, function(file) {
            		if(_.isArray(file)) {
                    	_.each(file, function(f) {
                    		tmpArray.push(f);
                    	});
            		}
//            		else {
//            			tmpArray.push(file);
//            		}
            	});
            	_.each(initFiles, function(file) {
            		if(_.isArray(file)) {
                    	_.each(file, function(f) {
                    		tmpArray.push(f);
                    	});
            		}
            		else {
            			tmpArray.push(file);
            		}
            	});
            	return tmpArray;
            });
            
            var _upload = upload.render({
                elem: elem
                , accept: 'file'
                , exts: allowfiletype
                , multiple: muit
                , number: muit ? 0 : 1
                , auto: auto
                , size: maxFileSize // 限制文件大小，单位 KB
                , bindAction: bindAction || uploadBtn
                , url: url
                , method: 'post'
                , choose: function (obj) {
                    //将每次选择的文件追加到文件队列
                    files = obj.pushFile();
                    var names = [];
                    var _file = $(_this).siblings(':file');
                    if(muit && type == 'list') {
        				// 读取本地文件
        				obj.preview(function(index, file, result){
        					var tr = $(['<tr id="upload-'+ index +'">'
        					            ,'<td><div class="layui-table-cell">'+ file.name +'</div></td>'
        					            ,'<td>'+ (file.size/1014).toFixed(1) +'kb</td>'
        					            ,'<td>等待上传</td>'
        					            ,'<td>'
        					            ,'<button class="layui-btn layui-btn-mini file-reload layui-hide">重传</button>'
        					            ,'<button class="layui-btn layui-btn-mini layui-btn-danger file-delete">删除</button>'
        					            ,'</td>'
        					            ,'</tr>'].join(''));

        					// 单个重传
        					tr.find('.file-reload').on('click', function(){
        						obj.upload(index, file);
        					});

        					// 删除
        					tr.find('.file-delete').on('click', function(){
        						var ff = $(tr).data('file');
        						if(ff) {
        							removeFileFromServer(ff.fileNo, function() {
        								deleteFile(index); // 删除对应的文件
            							$(tr).remove();
        							});
        						}
        						else {
        							deleteFile(index); // 删除对应的文件
        							$(tr).remove();
        						}
            					return false;
        					});
        					fileListView.append(tr);
        				});
        				return;
                    }
                    $.each(files, function (i, file) {
                        if (uploadedFiles[i]) {
                            delete files[i];
                        }
                        else {
                        	uploadedFiles[i] = file;
                            names.push(file.name);
                        }
                    });
                    // 添加IE8支持
                    if (names.length === 0) {
                        names.push(_file.val());
                    }
                    if (inline) {
                        $(".layui-upload-file").after("<span class='layui-inline layui-upload-choose'>" + names.join(',') + "</span>")
                        if (showdelete) {
                            $(".remove-btn").show();
                            $(".remove-btn").click(function () {
                                $(".layui-upload-choose").remove();
                            })
                        }
                    } else {
                        var style = {
                            width: '14px',
                            height: '14px',
                            position: 'absolute',
                            color: '#000',
                            display: 'none'
                        };
                        style['margin-left'] = '-25px';
                        style['margin-top'] = '-27px';
                        style['left'] = '50%';
                        style['top'] = '50%';
                        $.each(names, function(i, name) {
                            var $el = $('<div class="layui-upload-drag" style="width:' + width + 'px;height:' + height + 'px;padding-left: 5px;padding-right: 5px;"></div>')
                                .mouseover(function () {
                                    $(this).css('background', '#ccc');
                                    if($close) {
                                        $close.show();
                                    }
                                }).mouseout(function () {
                                    $(this).css('background', 'none');
                                    $close.hide();
                                });
                            var $name = $('<div></div>').html(name);
                        	var $close = $('<div><i class="layui-icon">&#x1006;</i></div>').css(style).on('click', function () {
        						var ff = $el.data('file');
        						if(ff) {
        							removeFileFromServer(ff.fileNo, function() {
        								//deleteFile(ff.fileNo); // 删除对应的文件
                						var tmpFiles = {};
                						_.each(uploadedFiles, function(f, k) {
                							if(f[0] && f[0].fileNo !== ff.fileNo) {
                								tmpFiles[k] = f;
                							}
                							else {
                								delete files[k];
                							}
                						});
                						uploadedFiles = tmpFiles;
        								$el.remove();
        								$(_this).show();
        							});
        						}
                            });
//                        	var $down = $('<div class="layui-hide file-down"><a href="' + JoyinUtil.getRealPath('/framework/download/' + file.fileNo) + '"><i class="layui-icon">&#xe601;</i></a></div>').css(style);
                            $el.append($close);
//                        	$el.append($down);
                            $el.append($name);
                            if(muit) {
                                $el.addClass('upload-muiltiple');
                            }
                            $(_this).after($el);
                        });
                        if(!muit) {
                        	$(_this).hide();
                        }
                    }
                    _file.val('');
                }
                , before: function (obj) {
                    this.data={'pageId':pageId};
                    if(!muit) {
                        layer.load();
                        //调用进度条
                        JoyinProgress.showInDialog('uploadFileProgressBar');
                    }
                }
                , done: function (res, file, upload) {//上传完毕回调
                    layer.closeAll('loading');
                    uploadedFiles[file] = res;
                    if(muit && type == 'list') {
                    	if(res!= null){
                    		var tr = fileListView.find('tr#upload-'+ file)
                    		,tds = tr.children();
                    		tds.eq(0).find('.layui-table-cell').html('<a href="' + JoyinUtil.getRealPath('/framework/download/' + res[0].fileNo) + '">' + tds.eq(0).text() + '</a>');
                    		tds.eq(2).html('<span style="color: #5FB878;">上传成功</span>');
                    		// tds.eq(3).html(''); //清空操作
                    		tr.data('file', res[0]);
                    		delete files[file]; //删除文件队列已经上传成功的文件
                    	}
                    	else {
                    		this.error(file, upload);
                    	}
                    }
                    else {
//                    	$(_this).siblings('.layui-upload-drag').find('.file-down').each(function() {
//                    		$(this).prev().css('margin-left', '-50px');
//                    		$(this).css('margin-left', 0).removeClass('layui-hide');
//                    	});
                    	$(_this).siblings('.layui-upload-drag').data('file', res[0]);
                    }
                    if ($.isFunction(callback)) {
                        callback(res);
                    }
                    else {
                    	JoyinProgress.clearDefault('uploadFileProgressBar');
                    }
                }
                , error: function (index, upload) {//请求异常回调
                    layer.closeAll('loading');
                    if(files) delete files[index]; //删除文件队列已经上传成功的文件
                    if(muit && type == 'list') {
                        var tr = fileListView.find('tr#upload-'+ index)
                            ,tds = tr.children();
                        tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
//                        tds.eq(3).find('.file-reload').removeClass('layui-hide'); // 显示重传
                    }
                    else {
                        layer.msg('文件上传异常，请稍后重试！');
                    }
                }
            });
            $(this).data('uploader', _upload);
        });
    };
}(jQuery));


/**
 * Created by zhengyan on 2018/2/2 0002.
 */
//data-nameArray  用来传的数组
$(function ($) {
    $.fn.download = function () {
        $(this).each(function () {
            var nameArray = $(this).data("nameArray");
            for (var i = 0; i < nameArray.length; i++) {
                $(this).append("<a href='" + nameArray[i].url + "'><i class='layui-icon'>&#xe601;" + nameArray[i].name + "</i></a>");
            }
        })
    }
}(jQuery));

/**
 * Created by nihuai on 2018/3/30.
 * 少量下拉菜单单选时改成checkbox样式
 */
$(function ($) {
    var inputCheckBox = function(_self, result, initValue, multiple){
        _self.hide();
        var divStr = '<ul class="layui-checkbox-u">';
        if(multiple) {
        	initValue = initValue.split(',');
        }
        for(var i =0; i< result.length; i++){
            divStr += '<li class="layui-chcekbox';
            var _id = result[i].id;
            // 复选
            if(multiple && _.isArray(initValue) && initValue.indexOf(_id) != -1) {
                divStr += ' laytable-checkbox-selected';
            }
            // 单选
            else if(_id === initValue){
            	divStr += ' laytable-checkbox-selected';
            }
            divStr += '" data-value="'+result[i].id+'">'+result[i].text+'</li>';
        }
        divStr += '</ul>';
        _self.parent().append(divStr);
        if(initValue){
            _self.val(initValue);
        }
        _self.prop('disabled') ? _self.next().addClass('disabled') : bindClick(_self, multiple);
        _self.data('inputCheckBoxed', true);

        _self.change(function() {
        	var value = _self.val();
            offClick(_self);
            if(_self.prop('disabled')) {
                _self.next().addClass('disabled');
            }
            else {
                bindClick(_self, multiple);
            }
            _self.next().find('li').removeClass('laytable-checkbox-selected');
            // 复选
            if(multiple) {
            	value = value.split(',');
            	_self.next().find('li').filter(function() {
            		var $li = $(this);
            		if(value.indexOf($li.data('value').toString()) != -1) {
            			$li.addClass('laytable-checkbox-selected');
            		}
            	});
            }
            // 单选
            else {
            	_self.next().find('li[data-value="' + value + '"]').addClass('laytable-checkbox-selected');
            }
        });
    };

    var bindClick = function(_self, multiple) {
        _self.next().removeClass('disabled').find('li').off('click').bind('click',function(){
        	// 复选
        	if(multiple) {
        		var _val = _self.val()
        		    , _value = []
        		    , slected = $(this).hasClass('laytable-checkbox-selected')
        		    , data = $(this).data('value');
        		if(_val) {
        			_val = _val.split(',');
        		}
        		if(slected) {
        			_.each(_val, function(v) {
        				if(v !== data && _value.indexOf(v) == -1) {
        					_value.push(v);
        				}
        			});
        		}
        		else {
        			_.each(_val, function(v) {
        				if(_value.indexOf(v) == -1) {
        					_value.push(v);
        				}
        			});
    				if(_value.indexOf(data) == -1) {
    					_value.push(data);
        			}
        		}
    			_self.val(_value.join(',')).trigger('change');
        	}
        	// 单选
        	else {
        		if(!$(this).hasClass('laytable-checkbox-selected')){
        			_self.val($(this).data('value')).trigger('change');
        		}
        		else {
        			_self.val('').trigger('change');
        		}
        	}
        });
    };

    var offClick = function(_self) {
        _self.next().addClass('disabled').find('li').off('click');
    };

    $.fn.inputCheckBox = function (param) {
        $(this).each(function () {
            var $elem = $(this);
            if(!$elem.data('inputCheckBoxed')) {
                var result = $elem.data("result");
                var initValue = $elem.attr("initValue");
                var multiple = $elem.attr('multiple') || false;

                // 查看模式
                if(pageModel && pageModel === PAGE_MODEL_REFERENCE && (!$elem.data('ignore') || $elem.data('ignore') === 'false')) {
                	$elem.prop('disabled', true);
                }
                if(result && $.isArray(result)){
                    inputCheckBox($elem, result, initValue, multiple);
                }
            }
        });
    }
}(jQuery));

/**
 * Created by peijiajun on 2018/7/6.
 * 带图标的输入框
 */
$(function ($) {
    $.fn.inputFuzzyText = function (param) {
        $(this).each(function () {
            var self = $(this);
            var icon = $('<a class="iconinput"><i class="iconfont icon-search"></i></a>');
            var callback = eval(self.attr("data-eventfunc"));
            self.wrap('<div class="input-btn-append"></div>')
            self.attr('autocomplete','off').parent().append(icon);
            icon.click(function(){
                if($.isFunction(callback)){
                    callback.call(icon, self.val());
                }
            });
            self.bind('keydown',function(event){
                if(event.keyCode == "13") {
                    if($.isFunction(callback)){
                        callback.call(icon, self.val());
                    }
                }
            });
        });
    }
}(jQuery));

/**
 * Created by peijiajun on 2018/7/4.
 */
(function ($) {
    var treeLevel=1;
    $.fn.joyinMixTree = function (options) {
        var leftAtagClick=function(self,treeId,iconQ){
            iconQ.parent().click(function() {
                iconQ.toggleClass('icon-downarrow').toggleClass('icon-uparrow');
                $.fn.zTree.getZTreeObj(treeId).expandAll(iconQ.hasClass('icon-downarrow'));
            });
        };
        var showztreemenuNum=function(b,childnodes,lev,ztreeobj,expFlag) {
            if(b){
                var rootnodes = ztreeobj.getNodes();
                showztreemenuNum(false,rootnodes,lev,ztreeobj,expFlag);//递归
            }else{
                var len=-1;
                if(childnodes!=null&&(len=childnodes.length)!=null&&len>0){
                    if(!expFlag){
                        if(treeLevel<childnodes[0].level){
                            treeLevel=childnodes[0].level;
                        }
                    }
                    else{
                        if(lev<=childnodes[0].level){
                            return;
                        }
                    }
                    for (var i = 0; i < len; i++) {
                        if(expFlag){
                            ztreeobj.expandNode(childnodes[i], true, false, false, true);
                        }
                        var child=childnodes[i].children;
                        showztreemenuNum(false,child,lev,ztreeobj,expFlag);//递归
                    }
                }
            }
        };
        var rightAtagClick=function(self,objDiv,treeId){
            self.find('div').find('a:last').hover(function(event){
                var ztree=$.fn.zTree.getZTreeObj(treeId);
                showztreemenuNum(true,ztree,100,ztree,false);
                var _levVal = [];
                for(var i=1;i<=treeLevel;i++){
                    _levVal.push("<li>"+i+"</li>")
                }
                objDiv.find('ul:first').empty().append(_levVal.join(''));

                var top=$(this).offset().top+22;
                var left=$(this).offset().left - $(this).width() / 2;
                objDiv.css({
                    top: top,
                    left: left,
                    width:"35px",
                    visibility:"visible",
                    background:"#fff",
                    border:"1px solid #ccc",
                    'text-align':'center'
                });
            },function(){
                objDiv.css({"visibility": "hidden"});
            });

            objDiv.hover(function(){
                $(this).css({"visibility": "visible"});
            },function(){
                $(this).css({"visibility": "hidden"});
            });

            objDiv.find('ul:first').on('click','li',function(){
                var ztree=$.fn.zTree.getZTreeObj(treeId);
                var level=$(this).html();
                ztree.expandAll(false);
                showztreemenuNum(true,ztree,level,ztree,true);
            })
        };

        var getFixElements = function(options) {
            if(options.clas=='add'||options.clas=='addsub'){
                return 'icon-found';
            }
            if(options.clas=='edit'){
                return 'icon-edit';
            }
            if(options.clas=='del'){
                return 'icon-delete';
            }
            return '';
        };
        /**
         * 添加全选按钮
         */
        var addCheckAllBtn = function(rootDiv, id) {
            var filter = id + '_all';
            var checkBox = $('<input type="checkbox" lay-skin="primary" lay-filter="' + filter + '">');
            rootDiv.prepend(checkBox);
            layui.form.render();
            layui.form.on('checkbox(' + filter + ')', function(obj) {
                var treeObject = $.fn.zTree.getZTreeObj(id + '_tree');
                if(obj.othis.hasClass('layui-form-checked')) {
                    treeObject && treeObject.checkAllNodes(true);
                }
                else {
                    treeObject && treeObject.checkAllNodes(false);
                }
            });
            checkBox.next('.layui-form-checkbox').css({
                'margin-top': -5,
                'margin-left': 5
            });
        };

        /*
         * 创建树控件的HTML结构
         * add by 何阳阳 2018-08-04
         */
        var createTreeDom = function(treeElement) {
            var self = $(treeElement);
            //添加头部div
            var rootTitle=$(treeElement).data("roottitle");
            var atag = '<a class="mixtree-head"></a>';
            var span = $('<span></span>').html('&nbsp;' + rootTitle);
            var iconQ = $('<i class="iconfont icon-downarrow"></i>');
            var iconH = $('<i class="iconfont icon-showorder fsize18"></i>');
            var rootDiv = $("<div class='mixtree-div'></div>");
            self.empty().append(rootDiv.append(iconQ));
            iconQ.wrap(atag).after(span);
            iconH.appendTo(rootDiv).wrap($(atag).css({float:"right","padding-right":"5px"}));

            var id = self.attr("id");
            var checkAll = self.data('checkall');
            var rLevelId = id + "_rLevel";
            var levelHtml = "<div id='"+rLevelId+"' class='rMixMenu treeMenu'><ul></ul></div>";
            $("body").after(levelHtml);
            leftAtagClick(self, id+"_tree" ,iconQ);
            rightAtagClick(self,$("#" + rLevelId),id+"_tree");

            // 添加内容部分
            var contentDiv = $('<div></div>');
            contentDiv.css({
                height: self.height()
                ,width: '100%'
                ,overflow: 'auto'
            });
            self.height('auto').append(contentDiv);

            if(typeof checkAll === 'undefined' || checkAll === 'true' || checkAll === true) {
                addCheckAllBtn(rootDiv, id);
            }
            return contentDiv;
        };

        $(this).each(function () {
            var contentDiv = createTreeDom(this);
            var id = $(this).attr("id");
            var canEdit = $(this).data("canedit");
            var checkable = $(this).data("checkable");
            var showIcon = $(this).data("icon");
            var chkStyle = $(this).data("chkstyle");
            var url = $(this).attr("url");
            var checkOnClick = options.checkOnClick;
            var html = "<ul id='" + id + "_tree' class='ztree'></ul>";
            var treeData = $(this).data("result");
            var rMenuId = id + "_rMenu";
            var optpanelR = $.extend({}, $.fn.joyinMixTree.defaults, {});
            if(options && options.col) {
                optpanelR.col = options.col;
            }
            contentDiv.append(html);
            if (canEdit == '1') {
                //构造右键面板
                var panelR=optpanelR.col;
                if(panelR && $.isArray(panelR)) {
                    var _rightVal = [];
                    _rightVal.push("<div  id= '" + rMenuId+ "' class='rMixMenu'><ul>");
                    $.each(panelR, function(i, arrEntry) {
                        var clasValue=getFixElements(arrEntry);
                        if(clasValue==''){
                            return true;
                        }
                        _rightVal.push("<li class='"+arrEntry.clas+"'><i class='iconfont "+clasValue+"'></i>&nbsp"+arrEntry.text+"</li>");
                    });
                    _rightVal.push("</ul></div>");
                    $("body").after(_rightVal.join(''));
                }
            }
            var rMenuDom = $("#" + rMenuId);
            var setting = {
                view: {
                    dblClickExpand: false,
                    showIcon:  typeof showIcon === 'undefined' || showIcon === 'true' || showIcon === true
                },
                check: {
                    enable: typeof checkable === 'undefined' || checkable === 'true' || checkable === true,
                    chkStyle: chkStyle || 'checkbox'
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pId",
                        rootPid: ""
                    }
                },
                callback: {
                    beforeClick: function(treeId, treeNode) {
                        if(checkOnClick) {
                            tree.zTree.checkNode(treeNode, !treeNode.checked, true, true);
                        }
                        return true;
                    },
                    onAsyncSuccess: function () {
                        JoyinUtil.hideLoading(this);
                        // 取消全选状态
                        $(':checkbox[lay-filter="' + id + '_all"]').next('.layui-form-checked').trigger('click');
                        if (typeof options.onTreeLoadSuccess != 'undefined' && options.onTreeLoadSuccess && $.isFunction(options.onTreeLoadSuccess)) {
                            options.onTreeLoadSuccess.call(options.onTreeLoadSuccess, arguments);
                        }
                    },
                    onRightClick: function (event, treeId,
                                            treeNode) {
                        if (treeNode && !treeNode.noR) {
                            //暂时取消右键功能
                            tree.zTree.selectNode(treeNode);
                            tree.showRMenu("node", event.clientX, event.clientY, treeNode);
                        }
                    }
                }
            }
            var tree = {
                setting: options && options.setting ? $.extend(true, setting, options.setting) : setting,
                zTree: "",
                addCount: 0,
                rMenuId: rMenuId,
                rMenuDom: rMenuDom,
                showRMenu: function (type, x, y, treeNode) {
                    tree.rMenuDom.show();
                    if (type == "root") {
                        tree.rMenuDom.find(".del").hide();
                    } else {
                        tree.rMenuDom.find(".del").show();
                    }
                    var top = parseFloat(y) + parseFloat(document.documentElement.scrollTop);
                    if (top + 190 > document.documentElement['clientHeight']) {
                    	top = top - 190;
                    }
                    var left = parseFloat(x) + parseFloat(document.documentElement.scrollLeft)
                    tree.rMenuDom.css({"top": top + "px", "left": left + "px", "visibility": "visible"});

                    $("body").one("mousedown", tree.onBodyMouseDown);
                },reloadTree:function(){
                    if (url) {
                        setting.async = {
                            type: "post",
                            dataType: "json",
                            url: url,
                            enable: true,
//                             contentType: "application/json",
                            autoParam: ["id"]
                        }
                        tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting);
                    } else {
                        tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting, treeData);
                    }
                },hideRMenu: function () {
                    tree.rMenuDom.hide();
                }, onBodyMouseDown: function (event) {
                    if (!(event.target.id == tree.rMenuId
                        || $(event.target).parents("#" + tree.rMenuId).length > 0)) {
                        tree.rMenuDom.css({"visibility": "hidden"});
                    }
                }, addTreeNode: function (e) {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var parenNode = zTree.getSelectedNodes()[0].getParentNode();
                    var clas = $(e.currentTarget).attr('class');
                    var optCol=optpanelR.col;
                    if(optCol && $.isArray(optCol)) {
                        var curEntry = null;
                        $.each(optCol,function(i,entry){
                            if(entry.clas == clas){
                                curEntry=entry;
                                return false;
                            }
                        })
                        if(curEntry==null){
                            return;
                        }
                        if(typeof curEntry.isdefine != 'undefined' && curEntry.isdefine && curEntry.isdefine==true){
                            if (typeof options.onTreeAddFunction != 'undefined' && options.onTreeAddFunction && $.isFunction(options.onTreeAddFunction)) {
                                options.onTreeAddFunction.call(options.onTreeAddFunction, function(){
                                    tree.reloadTree();
                                });
                            }
                        }
                        else{
                            Joyin.prompt(curEntry.text,0,function(resValue){
                                var nodeName = resValue;
                                if (!nodeName) {
                                    return;
                                }
                                tree.ajaxAddTreeNode(parenNode, nodeName);
                            });
                        }
                    }

                }, addSubTreeNode: function (e) {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var parenNode = zTree.getSelectedNodes()[0];
                    var clas = $(e.currentTarget).attr('class');
                    var optCol=optpanelR.col;
                    if(optCol && $.isArray(optCol)) {
                        var curEntry=null;
                        $.each(optCol,function(i,entry){
                            if(entry.clas==clas){
                                curEntry=entry;
                                return false;
                            }
                        })
                        if(curEntry==null){
                            return;
                        }
                        if(typeof curEntry.isdefine != 'undefined' && curEntry.isdefine && curEntry.isdefine==true){
                            if (typeof options.onTreeAddSubFunction != 'undefined' && options.onTreeAddSubFunction && $.isFunction(options.onTreeAddSubFunction)) {
                                options.onTreeAddSubFunction.call(options.onTreeAddSubFunction, parenNode.id,parenNode.name,function(){
                                    tree.reloadTree();
                                });
                            }
                        }
                        else{
                            Joyin.prompt(curEntry.text,0,function(resValue){
                                var nodeName = resValue;
                                if (!nodeName) {
                                    return;
                                }
                                tree.ajaxAddTreeNode(parenNode, nodeName);
                            });
                        }
                    }

                }, ajaxAddTreeNode: function (parenNode, nodeName) {
                    var newNode = {name: nodeName};
                    var addNode = function() {
                        var zTree = tree.zTree;
                        if (parenNode) {
                            newNode.checked = parenNode.checked;
                            zTree.addNodes(parenNode, newNode);
                        } else {
                            zTree.addNodes(null, newNode);
                        }
                    };
                    if(options["addUrl"]) {
                        $.ajax({
                            url: options["addUrl"],
                            data: {parenId: parenNode ? parenNode.id : "", name: nodeName},
                            success: function (data) {
                                if (data && data.success) {
                                    addNode();
                                }
                            }
                        })
                    }
                    else {
                        addNode();
                    }

                }, expandTreeNode: function () {
                    tree.hideRMenu();
                    if (tree.zTree.getSelectedNodes()[0]) {
                        tree.zTree.expandNode(tree.zTree.getSelectedNodes()[0])
                    }
                }, removeTreeNode: function () {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var nodes = zTree.getSelectedNodes();
                    var delParentWithChild = false;
                    if (nodes && nodes.length > 0) {
                        if (nodes[0].children && nodes[0].children.length > 0) {
                            var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
                            Joyin.confirm(msg, function() {
                                tree.ajaxDelNode(nodes[0], true);
                            });
                        }
                        else {
                            tree.ajaxDelNode(nodes[0], delParentWithChild);
                        }
                    }
                }, editTreeNode: function () {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var updateNode = zTree.getSelectedNodes()[0];
                    if (!updateNode) {
                        return;
                    }
                    var optCol=optpanelR.col;
                    if(optCol && $.isArray(optCol)) {
                        var curEntry=null;
                        $.each(optCol,function(i,entry){
                            if(entry.clas=='edit'){
                                curEntry=entry;
                                return false;
                            }
                        })
                        if(curEntry==null){
                            return;
                        }
                        if(typeof curEntry.isdefine != 'undefined' && curEntry.isdefine && curEntry.isdefine==true){
                            if (typeof options.onTreeEditFunction != 'undefined' && options.onTreeEditFunction && $.isFunction(options.onTreeEditFunction)) {
                                options.onTreeEditFunction.call(zTree, updateNode, function(){
                                    tree.reloadTree();
                                });
                            }

                        }
                        else{
                            Joyin.prompt(curEntry.text,0,function(resValue){
                                var nodeName = resValue;
                                if (!nodeName) {
                                    return;
                                }
                                tree.ajaxEditTreeNode(updateNode, nodeName);
                            });
                        }
                    }
                },
                ajaxEditTreeNode: function (updateNode, nodeName) {
                    if(options["editUrl"]) {
                        $.ajax({
                            type: "post",
                            url: options["editUrl"],
                            data: {id: updateNode.id, name: nodeName},
                            success: function (data) {
                                updateNode.name = nodeName;
                                tree.zTree.updateNode(updateNode);
                            }
                        });
                    }
                    else {
                        updateNode.name = nodeName;
                        tree.zTree.updateNode(updateNode);
                    }
                }, ajaxDelNode: function (node, delParentWithChild) {
                    if(options["delUrl"]) {
                        $.ajax({
                            type: "post",
                            url: options["delUrl"],
                            data: {id: node.id},
                            success: function (data) {
                                if (data && data.success) {
                                    tree.zTree.removeNode(node);
                                }
                            }
                        });
                    }
                    else {
                        var optCol=optpanelR.col;
                        if(optCol && $.isArray(optCol)) {
                            var curEntry=null;
                            $.each(optCol,function(i,entry){
                                if(entry.clas=='edit'){
                                    curEntry=entry;
                                    return false;
                                }
                            })
                            if(curEntry==null){
                                return;
                            }
                            tree.zTree.removeNode(node);
                            if(typeof curEntry.isdefine != 'undefined' && curEntry.isdefine && curEntry.isdefine==true){
                                if (typeof options.onTreeDelFunction != 'undefined' && options.onTreeDelFunction && $.isFunction(options.onTreeDelFunction)) {
                                    options.onTreeDelFunction.call(tree.zTree, node);
                                }

                            }
                        }
                    }
                },
                bindMenuEvent: function () {
                    var rMenu = tree.rMenuDom;
                    rMenu.find(".add").on("click", tree.addTreeNode)
                    rMenu.find(".addsub").on("click", tree.addSubTreeNode)
                    rMenu.find(".expand").on("click", tree.expandTreeNode)
                    rMenu.find(".del").on("click", tree.removeTreeNode)
                    rMenu.find(".edit").on("click", tree.editTreeNode)
                }
            }
            setting.callback["onRename"] = tree.onRename;
            tree.bindMenuEvent();
            JoyinUtil.showLoading(this);
            if (url) {
                setting.async = {
                    type: "post",
                    dataType: "json",
                    url: url,
                    enable: true,
//                    contentType: "application/json",
                    autoParam: ["id"]
                }
                tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting);
            } else {
                tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting, treeData);
            }
        })


    };
    $.fn.joyinMixTree.defaults={
        col:[
            {text:'增加节点',clas:'add'},
            {text:'编辑节点',clas:'edit'},
            {text:'删除节点',clas:'del'},
            {text:'增加子节点',clas:'addsub'}
        ]
    };
}(jQuery));

/**
 * Created by zhengyan on 2018/2/5.
 */
(function ($) {
    $.fn.joyinTree = function (options) {
        $(this).each(function () {
            var id = $(this).attr("id");
            var canEdit = $(this).data("canedit");
            var checkable = $(this).data("checkable");
            var showIcon = $(this).data("icon");
            var chkStyle = $(this).data("chkstyle");
            var url = $(this).attr("url");
            var checkOnClick = options.checkOnClick;
            var html = "<ul id='" + id + "_tree' class='ztree' style=' overflow:auto;'></ul>"
            $(this).append(html);
            var treeData = $(this).data("result");
            var rMenuId = id + "_rMenu";
            if (canEdit == '1') {
                var menuHtml = "<div id= '" + rMenuId
                    + "' class='rMenu'><ul>" + "<li  class='add'>增加节点</li>"
                    + "<li  class='edit'>编辑节点</li>"
                    + "<li  class='del'>删除节点</li>"
                    + "<li class='expand'>展开节点</li></ul>" + "</div>";
                $("body").after(menuHtml);
            }
            var rMenuDom = $("#" + rMenuId);
            var setting = {
                view: {
                    dblClickExpand: false,
                    showIcon:  typeof showIcon === 'undefined' || showIcon === 'true' || showIcon === true
                },
                check: {
                    enable: typeof checkable === 'undefined' || checkable === 'true' || checkable === true,
                    chkStyle: chkStyle || 'checkbox'
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pId",
                        rootPid: ""
                    }
                },
                callback: {
                    beforeClick: function(treeId, treeNode) {
                        if(checkOnClick) {
                            tree.zTree.checkNode(treeNode, !treeNode.checked, true, true);
                        }
                        return true;
                    },
                    onAsyncSuccess: function () {
                        JoyinUtil.hideLoading(this);
                        if (typeof options.onTreeLoadSuccess != 'undefined' && options.onTreeLoadSuccess && $.isFunction(options.onTreeLoadSuccess)) {
                            options.onTreeLoadSuccess.call(options.onTreeLoadSuccess, arguments);
                        }
                    },
                    onRightClick: function (event, treeId,
                                            treeNode) {
                        if (treeNode && !treeNode.noR) {
                            //暂时取消右键功能
                            tree.zTree.selectNode(treeNode);
                            tree.showRMenu("node", event.clientX, event.clientY, treeNode);
                        }
                    }
                }
            }
            var tree = {
                setting: setting,
                zTree: "",
                addCount: 0,
                rMenuId: rMenuId,
                rMenuDom: rMenuDom,
                showRMenu: function (type, x, y, treeNode) {
                    tree.rMenuDom.show();
                    if (type == "root") {
                        tree.rMenuDom.find(".del").hide();
                    } else {
                        tree.rMenuDom.find(".del").show();
                    }
                    var top = parseFloat(y) + parseFloat(document.documentElement.scrollTop)
                    var left = parseFloat(x) + parseFloat(document.documentElement.scrollLeft)
                    tree.rMenuDom.css({"top": top + "px", "left": left + "px", "visibility": "visible"});

                    $("body").one("mousedown", tree.onBodyMouseDown);
                }, hideRMenu: function () {
                    tree.rMenuDom.hide();
                }, onBodyMouseDown: function (event) {
                    if (!(event.target.id == tree.rMenuId
                        || $(event.target).parents("#" + tree.rMenuId).length > 0)) {
                        tree.rMenuDom.css({"visibility": "hidden"});
                    }
                }, addTreeNode: function () {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var parenNode = zTree.getSelectedNodes()[0];
                    var nodeName = prompt("please enter node name!");
                    if (!nodeName) {
                        return;
                    }
                    tree.ajaxAddTreeNode(parenNode, nodeName);

                }, ajaxAddTreeNode: function (parenNode, nodeName) {
                    var newNode = {name: nodeName};
                    $.ajax({
                        type: "post",
                        url: options["addUrl"],
                        data: {parenId: parenNode ? parenNode.id : "", name: nodeName},
                        success: function (data) {
                            if (data && data.success) {
                                var zTree = tree.zTree;
                                if (parenNode) {
                                    newNode.checked = zTree.getSelectedNodes()[0].checked;
                                    zTree.addNodes(zTree.getSelectedNodes()[0], newNode);
                                } else {
                                    zTree.addNodes(null, newNode);
                                }
                                alert("添加成功！");
                            } else {
                                alert("添加失败！");
                                return;
                            }

                        }
                    })

                }, expandTreeNode: function () {
                    tree.hideRMenu();
                    if (tree.zTree.getSelectedNodes()[0]) {
                        tree.zTree.expandNode(tree.zTree.getSelectedNodes()[0])
                    }
                }, removeTreeNode: function () {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var nodes = zTree.getSelectedNodes();
                    var delParentWithChild = false;
                    if (nodes && nodes.length > 0) {
                        if (nodes[0].children && nodes[0].children.length > 0) {
                            var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
                            if (confirm(msg) == false) {
                                return;
                            }
                            delParentWithChild = true;
                        }
                        tree.ajaxDelNode(nodes[0], delParentWithChild);
                    }
                }, editTreeNode: function () {
                    tree.hideRMenu();
                    var zTree = tree.zTree;
                    var updateNode = zTree.getSelectedNodes()[0];
                    if (!updateNode) {
                        return;
                    }
                    var nodeName = prompt("please enter node name!");
                    if (!nodeName) {
                        return;
                    }
                    tree.ajaxEditTreeNode(updateNode, nodeName);
                },
                ajaxEditTreeNode: function (updateNode, nodeName) {
                    $.ajax({
                        type: "post",
                        url: options["editUrl"],
                        data: {id: updateNode.id, name: nodeName},
                        success: function (data) {
                            if (data && data.success) {
                                updateNode.name = nodeName;
                                tree.zTree.updateNode(updateNode);
                                alert("编辑成功！");
                            } else {
                                alert("编辑失败！");
                            }
                        }
                    })
                }, ajaxDelNode: function (node, delParentWithChild) {
                    $.ajax({
                        type: "post",
                        url: options["delUrl"],
                        data: {id: node.id},
                        success: function (data) {
                            if (data && data.success) {
                                tree.zTree.removeNode(node);
                                alert("删除成功！");
                            } else {
                                alert("删除失败！");
                            }
                        }
                    })
                },
                bindMenuEvent: function () {
                    var rMenu = tree.rMenuDom;
                    rMenu.find(".add").on("click", tree.addTreeNode)
                    rMenu.find(".expand").on("click", tree.expandTreeNode)
                    rMenu.find(".del").on("click", tree.removeTreeNode)
                    rMenu.find(".edit").on("click", tree.editTreeNode)
                }
            }
            setting.callback["onRename"] = tree.onRename;
            tree.bindMenuEvent();
            JoyinUtil.showLoading(this);
            if (url) {
                setting.async = {
                    type: "post",
                    dataType: "json",
                    url: url,
                    enable: true,
//                    contentType: "application/json",
                    autoParam: ["id"]
                }
                tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting);
            } else {
                tree.zTree = $.fn.zTree.init($("#" + id + "_tree"), setting, treeData);
            }
        })
    };
    $.fn.reloadTree = function(params) {
        $(this).each(function () {
            var treeId = $(this).attr('id') + "_tree";
            var treeObject = $.fn.zTree.getZTreeObj(treeId);
            params = params || {};
            if(treeObject) {
                $.fn.zTree.init($("#" + treeId), $.extend(true,{},treeObject.setting, {async:{otherParam: params}}));
            }
        });
    };
    $.expandTree = function (treeId, button) {
        var btn = $(button);
        var flag = true;
        if (btn.attr("expandOrCollapse")) {
            var html = btn.html();
            if (html == "折叠") {
                flag = false;
                btn.html("展开");
            } else {
                btn.html("折叠");
                flag = true;
            }
        }
        $.fn.zTree.getZTreeObj(treeId + "_tree").expandAll(flag);
    };
}(jQuery));

/**
 * Created by zhangnian on 2018/7/26
 */
//data-process  进度条--调用方法
//type 1:进度条控件(假) 2:进度条控件(真) 3:进度条弹框(真)
$(function ($) {

    /**
     * 显示进度条控件，该进度条为共通进度条，显示在表格最底部
     * @callback 进度条完成后的回调函数
     */
    function showProgressBar(callback) {
        var commonProgerssBar = $('#commonProgerssBar');
        layui.element.progress('progressBar', '0%');
        commonProgerssBar.show().find('div.layui-progress-bar').html('0%');
        startProgressBar(commonProgerssBar, 'progressBar', callback);
    }

    /**
     * 显示进度条控件，该进度条为共通进度条，显示在表格最底部
     * @callback 进度条完成后的回调函数
     */
    function forceFinishProgressBar() {
        var commonProgerssBar = $('#commonProgerssBar');
        var precent = parseInt(commonProgerssBar.find('div.layui-progress-bar').html());
        var intval = setInterval(function() {
            precent += 10;
            precent = Math.max(precent, 100);
            if(precent > 100) {
                commonProgerssBar.hide();
                clearInterval(intval);
                intval = null;
            }
            layui.element.progress('progressBar', precent + '%');
            commonProgerssBar.find('div.layui-progress-bar').html(precent + '%');
        }, 100);
    }
    
    function clearProgressBar(barId) {
        $.get(JoyinUtil.getRealPath('common/' + pageId + '/clear/' + barId));
    }

    /**
     * 进度条开始
     * @callback 进度完成后的回调
     */
    function startProgressBar($progerssBar, barId, callback) {
        if($progerssBar && $progerssBar.length > 0) {
            // 显示导出文件进度条
            var processing = setInterval(function() {
                $.ajax({
                    url: JoyinUtil.getRealPath('common/' + pageId + '/percent/' + barId),
                    type: 'get',
                    success: function(percent) {
                        if(!isNaN(percent) && percent < 0.99 && percent >= 0) {
                            var percentText = parseInt(percent * 100) + '%';
                            layui.element.progress(barId, percentText);
                            $progerssBar.find('.layui-progress-bar').text(percentText);
                        }
                        else {
                            finish(0, callback);
                        }
                    },
                    error: function() {
                        finish(1, callback);
                    }
                });
            }, 800);
            // 进度条完成
            var finish = function(status, callback) {
                layui.element.progress(barId, '100%');
                $progerssBar.find('.layui-progress-bar').text('100%');
                setTimeout(function() {
                    clearInterval(processing);
                    processing = null;
                    if(callback && $.isFunction(callback)) {
                        callback.call($progerssBar, status, $progerssBar);
                    }
                }, 1000);
            };
        }
    }

    //进度条--调用方法
    var progressBarMethod = function (barId, methodName, autoclose) {
        methodName = methodName || '0';
        // 展示虚拟进度条
        if(methodName == '1'){
            var commonProgerssBar = $('#commonProgerssBar');
            layui.element.progress(barId, '0%');
            commonProgerssBar.show().find('div.layui-progress-bar').html('0%');
            var n = 0;
            var processing = setInterval(function(){
                n = n + Math.random()*10|0;
                if(n > 100){
                    n = 100;
                }
                layui.element.progress(barId, n+'%');
                commonProgerssBar.find('div.layui-progress-bar').html(n+'%');
                if(n == 100 && autoclose){
                    clearInterval(processing);
                    processing = null;
                    commonProgerssBar.hide();
                }
            }, 100);
        }
        // 展示共通进度条
        else if(methodName == '2') {
            showProgressBar();
        }
        else{
            // 弹框进度条
            var processIndex = layer.open({
                type: 1
                ,title: false //不显示标题栏
                ,closeBtn: false
                ,area: '300px;'
                ,shade: 0.6
                ,id: 'JOY_process' //设定一个id，防止重复弹出
                ,moveType: 1 //拖拽模式，0或者1
                ,content: '<div class="layui-progress layui-progress-big" lay-showpercent="true" lay-filter="' + barId + '"><div class="layui-progress-bar" lay-percent="0%">0%</div></div>'
                ,success: function(layero){
                    layero.css('background', 'transparent');
                    // 开始进度条
                    startProgressBar(layero, barId, function() {
                        layer.close(processIndex);
                    });
                }
            });
        }
    }
    //进度条--控件
    $.fn.progressBarInit = function(){
        $(this).each(function () {
            //构造进度条div
            var key = $(this).attr("data-key");
            var width = $(this).attr("data-width") || '100%';
            var start = $(this).attr("data-start");
            var hide = $(this).attr("data-hide");
            var objProgressBar = $('<div class="layui-progress-bar" lay-percent="0%">0%</div>');
            $(this).attr('lay-filter', key).width(width).addClass('layui-progress layui-progress-big').append(objProgressBar);
            if(start && start != 'false') {
                startProgressBar($(this), key);
            }
            if(hide && hide == 'true') {
                $(this).hide();
            }
        });
    };

    window.JoyinProgress = {
        // 虚拟进度条
        showInvented : function(autoclose) {
            if(typeof autoclose == 'undefined') {
                autoclose = true;
            }
            progressBarMethod('progressBar', '1', autoclose);
        }
        // 公共进度条
        , showCommon: function(autoclose) {
            if(typeof autoclose == 'undefined') {
                autoclose = true;
            }
            progressBarMethod('progressBar', '2', autoclose);
        }
        // 公共进度条完成
        , hideCommon: function() {
            forceFinishProgressBar();
        }
        // 弹框进度条
        , showInDialog : function(barId) {
            barId = barId || 'dialogProgressBar';
            progressBarMethod(barId, '0', true);
        }
        // 消除进度条
        , clearDefault: clearProgressBar
    };
}(jQuery));

/* ****************************************************
 * workflow 功能
 * ****************************************************/
var isTodoList = false;
/**
 * 工作流处理
 */
(function ($, global) {
    var users = [];
    var roles = [];
    var elementId = '';
    var pageUrl = '';
    var isLastTask = false;

    // 获取新建或修改时业务画面的操作类型（新建，修改）
    function _getSaveOperType() {
        if (pageModel !== 'undefined' && pageModel === PAGE_MODEL_EDIT) {
            return 'modify';
        }
        return 'new';
    }

    function disableButton(type) {
        if(type === 'revoke') return;
        JoyinUtil.disableButton(Joyin.elementId, true);
    }

    // 选择用户
    function selectUser(elementId, pid, param, callback) {
        users = [];
        roles = [];
        elementId = elementId;
        if (!elementId) {
            return Joyin.warn('未指定画面元素ID');
        }
        if($.isFunction(param)) {
            callback = param;
            param = '';
        }
        var data = {
            processInstanceId: $('#processInstanceId').val() || '',
            taskId: $('#wfl_taskId').val() || '',
            pageId: (pid || pageId),
            elementId: elementId
        };
        if(typeof param === 'string') {
            data.businessInfo = param;
        } else {
            data.businessInfo = JSON.stringify($.extend({}, param));
        }
        Joyin.ajax(JoyinUtil.getRealPath('workflow/nextTask'), data, function (result) {
            var data = result.data || {};
            if (data.nodeId && data.nodeId == 'endEvent') {
                JoyinWorkFlow.doSubmit({'endEvent': true}, function() {
                	if($.isFunction(callback)) {
                        callback.call(callback, null, null);
                    }
                });
                return;
            }
            if (!data.nodeId && !isLastTask) {
                if($.isFunction(callback)) {
                    callback.call(callback);
                }
                return;
            }
            if (!data.nodeId || !data.moduleId || !data.type) {
                Joyin.alert(JoyinUtil.getMessage('WFL_W00003', data.moduleId, data.nodeId));
                return;
            }
            var nodeData = JSON.parse(data.nodeData);
            if(nodeData && data.businessEntity) {
                if(typeof param === 'string') {
                    nodeData.businessInfo = param;
                } else {
                    nodeData.businessInfo = JSON.stringify($.extend({}, param));
                }
                nodeData.businessEntity = data.businessEntity;
                // 由于批量审批时param为空，所以必须传递流程相关参数
                nodeData.workflowId = data.workflowId;
            }
            Joyin.showSelectUserDialog(true, 'workflow', data.nodeId, data.moduleId, /*data.type*/'user',nodeData,function () {
                if (arguments && arguments.length >= 2) {
                    var type = arguments[0];
                    var selectedObject = arguments[1];
                    if (type === 'user') {
                        $.each(selectedObject, function (i, user) {
                            users.push(user.userName);
                        });
                    } else if (type === 'role') {
                        $.each(selectedObject, function (i, role) {
                            roles.push(role.roleId);
                        });
                    }

                    if ($.isFunction(callback)) {
                        callback.call(callback, users, roles);
                    }
                }
            });
        });
    }

    // 撤销 提交 撤销没有保存
    function doRevoke(url, formElement, elementId, pid, callback) {
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
                _submit(url, 'revoke', formElement, elementId, pid, '1', callback);
            });
        } else {
            _submit(url, 'revoke', formElement, elementId, pid, '1', callback);
        }
    }

    // 撤销 提交
    function doRevokeList(url, formElement, elementId, pid, callback) {
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
            	_submitJson(url, 'revoke', formElement, elementId, pid, '1', callback);
            });
        } else {
        	_submitJson(url, 'revoke', formElement, elementId, pid, '1', callback);
        }
    }

    // 新建-修改
    function doSave(url, formElement, elementId, pid, callback, errorCallback) {
        users = [];
        roles = [];
        _submit(url, _getSaveOperType(), formElement, elementId, pid, '0', callback, errorCallback);
    }

    // 新建-修改 批量保存
    function doSaveList(url, formElement, elementId, pid, callback, errorCallback) {
        users = [];
        roles = [];
        _submitJson(url, _getSaveOperType(), formElement, elementId, pid, '0', callback, errorCallback);
    }

    // 新建-修改 提交
    function doSubmit(url, formElement, elementId, pid, callback, errorCallback) {
    	// 宁波银行发现的问题：经办节点之后是条件分支，在经办节点修改金额等触发条件分支的情况，不会弹出选人框。
    	// 不应该直接使用待办事项画面打开的globalLastTask，应该调用接口重置该参数。
    	var data = _getParamter(formElement);
    	if(typeof param === 'string') {
            data.businessInfo = formElement;
        } else {
            data.businessInfo = JSON.stringify($.extend({}, formElement));
        }
    	Joyin.ajaxSync(JoyinUtil.getRealPath('workflow/isLastUserTask'), data, function(result) {
    		isLastTask = result;
        });
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
                _submit(url, _getSaveOperType(), formElement, elementId, pid, '1', callback, errorCallback);
            });
        } else {
            _submit(url, _getSaveOperType(), formElement, elementId, pid, '1', callback, errorCallback);
        }
    }

    // 新建-修改 批量提交
    function doSubmitList(url, formElement, elementId, pid, callback, errorCallback) {
    	// 宁波银行发现的问题：经办节点之后是条件分支，在经办节点修改金额等触发条件分支的情况，不会弹出选人框。
    	// 不应该直接使用待办事项画面打开的globalLastTask，应该调用接口重置该参数。
    	var data = _getParamter(formElement);
    	if(typeof param === 'string') {
            data.businessInfo = formElement;
        } else {
            data.businessInfo = JSON.stringify($.extend({}, formElement));
        }
    	Joyin.ajaxSync(JoyinUtil.getRealPath('workflow/isLastUserTask'), data, function(result) {
    		isLastTask = result;
        });
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
                _submitJson(url, _getSaveOperType(), formElement, elementId, pid, '1', callback, errorCallback);
            });
        } else {
            _submitJson(url, _getSaveOperType(), formElement, elementId, pid, '1', callback, errorCallback);
        }
    }

    function _getParamter(param) {
        var result = {
            status : $('#wfl_status').val(),
            createUser: $('#wfl_createUser').val(),
            createTime: $('#wfl_createTime').val(),
            processInstanceId : $('#processInstanceId').val(),
            workflowId: $('#wfl_workflowId').val(),
            taskId : $('#wfl_taskId').val(),
            type : $('#wfl_type').val(),
            comment : $('#wfl_comment').val(),
            users : users.join(","),
            roles : roles.join(",")
        }
        if(param) {
            if(typeof param === 'string') {
                param = $.parseJSON(param);
            }
            if(_.isObject(param) && !param._sub) {
                result.users = param.users;
                result.roles = param.roles;
            }
            if(param.endEvent) {
                result.endEvent = param.endEvent;
            }
        }
        return result;
    }
    
    function _getPath(path) {
    	var pathname = window.location.pathname;
    	if(pathname && pathname.length > 17) {
    		return pathname.substr(0, pathname.length - 16) + path;
    	}
    	return basePath + path;
    }

    // 删除 提交
    function doDelete(url, formElement, elementId, pid, callback) {
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
                _submit(url, 'delete', formElement, elementId, pid, '1', callback);
            });
        } else {
            _submit(url, 'delete', formElement, elementId, pid, '1', callback);
        }
    }

    // 删除 提交
    function doDeleteList(url, formElement, elementId, pid, callback) {
        if (!isLastTask && needWorkflow !== '02') {
            selectUser(elementId, pid, formElement, function () {
                _submitJson(url, 'delete', formElement, elementId, pid, '1', callback);
            });
        } else {
            _submitJson(url, 'delete', formElement, elementId, pid, '1', callback);
        }
    }

    function _submit(url, operType, formElement, elementId, pid, submit, callback, errorCallback) {
        disableButton(operType);
        var param = _.isObject(formElement) ? formElement : $.serializeToObject($(formElement));
        param.operType = operType; // 操作类型
        param.users = users.join(',');
        param.roles = roles.join(',');
        param.pageId = pid || pageId;
        param.elementId = elementId;
        param.submit = submit || '0';
        param.isTodoList = isTodoList;
        if (isTodoList) {
            // 代办事项保存
            if (submit !== '1') {
                JoyinWorkFlow.doSave(param, callback, errorCallback);
            }
            // 代办事项提交
            else {
                JoyinWorkFlow.doSubmit(param, callback, errorCallback);
            }
        } else {
            Joyin.ajax(url, param, function (result) {
                closeSelf(callback, result);
            }, function(result) {
                doErrorCallback(errorCallback, result);
            });
        }
    }

    function _submitJson(url, type, formElement, elementId, pid, submit, callback, errorCallback) {
        disableButton(type);
        var param = _.isObject(formElement) ? formElement : $.serializeToObject($(formElement));
        var workflowParameter = [];
        workflowParameter.push(type);// 操作类型
        workflowParameter.push(users.join(',')); // 下一步骤处理人
        workflowParameter.push(roles.join(',')); // 下一步骤处理角色
        workflowParameter.push(submit || '0'); // 是否为提交操作
        workflowParameter.push(pid || pageId); // 画面ID
        workflowParameter.push(elementId); // 画面元素ID
        workflowParameter.push(isTodoList); // 是否为来自代办事项
        param.workflowParameter = workflowParameter.join('|');
        param.todoListFlag = isTodoList;
        param.operType = type; // 操作类型
        param.users = users.join(',');
        param.roles = roles.join(',');
        param.pageId = pid || pageId;
        param.elementId = elementId;
        param.submit = submit || '0';
        param.isTodoList = isTodoList;
        if (url) {
            if (url.indexOf("?") != -1) {
                if (url.indexOf("operType") == -1) {
                    url += "&operType=" + type;
                }
            } else {
                url += "?operType=" + type;
            }

            if (elementId) {
                url += "&elementIdForLog=" + elementId;
            }

            if (pageId) {
                url += "&pageIdForLog=" + pageId;
            }
        }

        if (isTodoList) {
            // 代办事项保存
            if (submit !== '1') {
                JoyinWorkFlow.doSave(param, callback, errorCallback);
            }
            // 代办事项提交
            else {
                JoyinWorkFlow.doSubmit(param, callback, errorCallback);
            }
        } else {
            Joyin.ajaxJson(url, param, function (result) {
                closeSelf(callback, result);
            }, true, function (result) {
                doErrorCallback(errorCallback, result);
            });
        }
    }
    
    // 显示异常消息
    function doErrorCallback(errorCallback, result) {
        JoyinUtil.disableButton(Joyin.elementId, false);
        if ($.isFunction(errorCallback)) {
            errorCallback.call(errorCallback, result);
        }
    }

    // 取消
    function closeSelf(callback, result) {
        if (window.name) {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        }
        if ($.isFunction(callback)) {
            callback.call(callback, result);
        }
    }

    function signTodoList(pageUrl) {
        isTodoList = true;
        pageUrl = pageUrl;
        Joyin.signTodoList();
    }

    function getTodoList() {
        return isTodoList;
    }

    function signLastTask() {
        isLastTask = true;
    }

    function setShowUserIds(uids) {
        if (typeof uids !== 'undefined' && uids) {
            if (_.isArray(uids)) {
                global.showUserIds = uids.join(',');
            }
            else {
                global.showUserIds = uids;
            }
        }
    }

    global.WorkFlow = {
        doSave: doSave,
        doSaveList: doSaveList,
        doRevoke: doRevoke,
        doRevokeList: doRevokeList,
        doDelete: doDelete,
        doDeleteList: doDeleteList,
        doSubmit: doSubmit,
        doSubmitList: doSubmitList,
        selectUser: selectUser,
        cancel: closeSelf,
        getTodoList: getTodoList,
        signTodoList: signTodoList,
        signLastTask: signLastTask,
        setShowUserIds: setShowUserIds
    };
}(jQuery, this));

/**
 * 下拉树
 */
(function($, global) {

	function initSelectTree(target) {
		var self = $(target)
		    , id = self.attr('id')
		    , name = self.attr('name')
		    , isMultiple = self.attr('multiple') || false
		    , search = self.attr('searchable')
		    , parentIds = self.attr('parentids')
		    , placeholder = self.attr('placeholder');
		if (!id){
		    return;
        }
    	var results = self.data("result") || [], url = self.data('url');
        if (results && typeof results === 'string') {
    		results = $.parseJSON(results);
        }
        var getOtherParams = function() {
            var params = {};
            if (parentIds) {
                var parentArray = parentIds.split(",");
                $.each(parentArray, function (i, item) {
                    var parent = $("#" + item);
                    var parentValue = parent.val();
                    if ($.isArray(parentValue)) {
                        parentValue = parentValue.join(",");
                    }
                    params[parent.attr("name")] = parentValue;
                })
            }
            if (id){
                var initValue = $("#"+id).attr("initValue");
                if (initValue){
                    params.initValue = initValue;
                }
            }
            if(search === 'true') {
                params.search = $('#' + id + 'Search').val();
            }
            return params;
        };
	    var setting = {
	        view: {
	            dblClickExpand: false,
	            showLine: true
	        },
	        data: {
	            simpleData: {
	                enable: true
	            }
	        },
	        async: {
	        	enable: false,
	        	autoParam: ['id','name','object','checked'], //异步加载时需要自动提交父节点属性的参数
	        	dataType: 'json',
	        	otherParam: getOtherParams,
	        	url: url,
	        	dataFilter: function(treeId, parentNode, childNodes) {
	        		if (!childNodes) return null;
	        		var keyword = $('#' + id + 'Search').val();
	    			for (var i=0, l=childNodes.length; i<l; i++) {
	    				childNodes[i].isHidden = !keyword ? childNodes[i].hidden : ((childNodes[i].name && childNodes[i].name.toLowerCase().indexOf(keyword.toLowerCase())) === -1 || childNodes[i].hidden);
	    				childNodes[i].isParent = childNodes[i].parent;
	    			}
	    			return childNodes;
	        	}
	        },
	        check: {
	            enable: false,
	            chkboxType: {"Y": "ps", "N": "s"},
	            chkStyle: 'checkbox',
	            chkDisabledInherit: true,
	            nocheckInherit: true
	        },
	        callback: {
	            onClick: onClick,
	            onCheck: onCheck,
	            onExpand: onExpand,
	            onAsyncSuccess: onAsyncSuccess
                // onNodeCreated: onNodeCreated
	        }

	    };
	    if (isMultiple) {
	        setting.check.enable = true;
	    }
	    if (url) {
	    	setting.async.enable = true;
//	    	setting.data.simpleData.enable = false;
	    }

	    var html = '<div class="input-selectTree-main">' +
	        '<span class = "select2-container select2-container--default"><span class="select2-selection select2-selection--single">' +
	        '<span class="select2-selection__rendered"><input id="' + id + 'Show"' + 'type = "text" placeholder = "' + placeholder + '" value = "" class = "layui-input" readonly></span>' +
	        '<span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>' +
	        '</span></span>' +
	        '</div>';
	    var searchBar = '<div class="select-tree-search"><input id="' + id + 'Search" class="select-tree-search-field" type="search" tabindex="0" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="textbox"></div>';
	    self.removeAttr('id').removeAttr('name').append(html).parent().append('<div class="tree-content scrollbar">' +
	        '<input hidden id="' + id + '" ' +  (name ? 'name="' + name + '">' : '>') +
	        (search === 'true' ? searchBar : '' ) +
	        '<ul id="' + id + 'Tree" class="ztree scrollbar" style="margin-top:0;"></ul>' +
	        '</div>');
	    self.bind("click", function () {
	        if ($(this).parent().find(".tree-content").css("display") !== "none") {
	            hideMenu();
	        } else {
                var thisTree = $.fn.zTree.getZTreeObj(id + 'Tree'), _params = getOtherParams(parentIds,id);
                if(setting.async.enable && (!_.isEqual(setting.async._otherParam, _params) || thisTree.getNodes().length == 0)) {
                    setting.async._otherParam = _params;
                    $.fn.zTree.init($("#" + id + "Tree"), setting, results);
                }
                setInitValue(thisTree, thisTree.getNodes(), JSON.parse($("#" + id).val() || '{"id": [], "name": []}'));
	            $(this).addClass("layui-form-selected");
	            var offset = $(this).offset();
	            var width = $(this).width() - 2;
	            var height = $(this).height();
	            $(this).parent().find(".tree-content").css({
	                left: /*offset.left + "px"*/0,
	                top: /*offset.top + */height + "px",
                    width: width + 'px',
                    height: (($(this).parents('form').length > 0 ? $(this).parents('form').height() : document.body.clientHeight) - offset.top - height - 5) + 'px'
	            }).slideDown("fast");
	            $("body").on("mousedown", onBodyDown);
	        }
	    });
	    $.fn.zTree.init($("#" + id + "Tree"), setting, results);
	    if(search === 'true') {
        	fuzzySearch(id + 'Tree', '#' + id + 'Search',null,false);
	    }
	}

	function onClick(event, treeId, treeNode) {
	    var zTree = $.fn.zTree.getZTreeObj(treeId);
	    if (zTree.setting.check.enable == true) {
	        zTree.checkNode(treeNode, !treeNode.checked, false);
	        assignment(treeId, zTree.getCheckedNodes());
	    } else {
	        assignment(treeId, zTree.getSelectedNodes());
	        hideMenu();
	    }
	}

	function onCheck(event, treeId, treeNode) {
	    var zTree = $.fn.zTree.getZTreeObj(treeId);
        if (treeNode.checked==true) {
            zTree.expandNode(treeNode, true, true, true,true);
        }
	    assignment(treeId, zTree.getCheckedNodes(true));

	}

	function onExpand(event, treeId, treeNode){
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        var initObj = JSON.parse($("#" + treeId.substr(0, treeId.length-4)).val() || '{"id": [], "name": []}');
        // 设置初始值
        setInitValue(zTree, [treeNode], initObj);
    }

    function onAsyncSuccess(event, treeId, treeNode, nodes) {
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        var initObj = JSON.parse($("#" + treeId.substr(0, treeId.length-4)).val() || '{"id": [], "name": []}');
	    // 展开所有checked节点
        expandCheckedNode(zTree, treeNode ? treeNode.children : zTree.getNodes(), initObj);
    }

    // function onNodeCreated(event, treeId, treeNode) {
    //     var initValue = $("#"+treeId).attr("initValue");
    //     if (initValue) {
    //         var nodeIds = initValue.split(",");
    //         var zTree = $.fn.zTree.getZTreeObj(treeId);
    //         var node=[];
    //         for (var i=0;i<nodeIds.length;i++){
    //             var item = zTree.getNodeByParam("id",nodeIds[i]);
    //             if(item){
    //                 node.push(item);
    //             }
    //         }
    //         for (var i=0;i<node.length;i++) {
    //             zTree.checkNode(node[i], true, true,true);
    //         }
    //     }
    // }

	function hideMenu() {
	    $(".select-tree").removeClass("layui-form-selected");
	    $(".tree-content").fadeOut("fast");
	    $("body").unbind("mousedown", onBodyDown);
	}

	function assignment(treeId, nodes) {
	    var names = [];
	    var ids = [];
	    for (var i = 0, l = nodes.length; i < l; i++) {
	        names.push(nodes[i].name);
	        ids.push(nodes[i].id);
	    }
        treeId = treeId.substring(0, treeId.length - 4);
        $("#" + treeId).val(JSON.stringify({id:ids,name:names}));
        $("#" + treeId + "Show").val(names.join(',')).attr("title", names.join(','));
	}

	function onBodyDown(event) {
	    if (!$(event.target).is('.tree-content') && $(event.target).parents(".tree-content").length === 0) {
	        hideMenu();
	    }
	}

	function setInitValue(treeObj, nodes, initObj) {
	    if(!nodes || nodes.length === 0 || !initObj || !initObj.id || initObj.id.length === 0) return;
        // var oldValue = JSON.parse($("#" + treeId).val() || '{"id": [], "name": []}');
        for(var i=0;i<initObj.id.length;i++) {
            var id = initObj.id[i], name = initObj.name[i];
            _.each(nodes, function(n) {
                if(id === n.id && name === n.name) {
                    treeObj.checkNode(n, true, false);
                    if(n.children){
                        setInitValue(treeObj, n.children, initObj);
                    }
                }
            });
        }
    }

    function expandCheckedNode(treeObj, nodes, initObj) {
        if(!nodes || nodes.length === 0 || !initObj || !initObj.id || initObj.id.length === 0) return;
        for(var i=0;i<initObj.id.length;i++) {
            var id = initObj.id[i], name = initObj.name[i];
            _.each(nodes, function(n) {
                if(id === n.id && name === n.name) {
                    treeObj.expandNode(n, true);
                    treeObj.setting.treeObj.trigger($.fn.zTree.consts.event.EXPAND, [treeObj.setting.treeId, n]);
                    if(n.children){
                        expandCheckedNode(treeObj, n.children, initObj);
                    }
                }
            });
        }
    }

	function fuzzySearch(zTreeId, searchField, isHighLight, isExpand){
		var zTreeObj = $.fn.zTree.getZTreeObj(zTreeId);//get the ztree object by ztree id
		if(!zTreeObj){
            return Joyin.error("fail to get ztree object");
		}
		var nameKey = zTreeObj.setting.data.key.name; //get the key of the node name
		isHighLight = isHighLight===false?false:true;//default true, only use false to disable highlight
		isExpand = isExpand?true:false; // not to expand in default
		zTreeObj.setting.view.nameIsHTML = isHighLight; //allow use html in node name for highlight use

		var metaChar = '[\\[\\]\\\\\^\\$\\.\\|\\?\\*\\+\\(\\)]'; //js meta characters
		var rexMeta = new RegExp(metaChar, 'gi');//regular expression to match meta characters

		// keywords filter function
		function ztreeFilter(zTreeObj,_keywords,callBackFunc) {
			if(!_keywords){
				_keywords =''; //default blank for _keywords
			}

			// function to find the matching node
			function filterFunc(node) {
				if(node && node.oldname && node.oldname.length>0){
					node[nameKey] = node.oldname; //recover oldname of the node if exist
				}
				zTreeObj.updateNode(node); //update node to for modifications take effect
				if (_keywords.length == 0) {
					//return true to show all nodes if the keyword is blank
					zTreeObj.showNode(node);
					zTreeObj.expandNode(node,isExpand || node.open);
					return true;
				}
				//transform node name and keywords to lowercase
				if (node[nameKey] && node[nameKey].toLowerCase().indexOf(_keywords.toLowerCase())!=-1) {
					if(isHighLight){ //highlight process
						//a new variable 'newKeywords' created to store the keywords information
						//keep the parameter '_keywords' as initial and it will be used in next node
						//process the meta characters in _keywords thus the RegExp can be correctly used in str.replace
						var newKeywords = _keywords.replace(rexMeta,function(matchStr){
							//add escape character before meta characters
							return '\\' + matchStr;
						});
						node.oldname = node[nameKey]; //store the old name
						var rexGlobal = new RegExp(newKeywords, 'gi');//'g' for global,'i' for ignore case
						//use replace(RegExp,replacement) since replace(/substr/g,replacement) cannot be used here
						node[nameKey] = node.oldname.replace(rexGlobal, function(originalText){
							//highlight the matching words in node name
							var highLightText = originalText;
							return 	highLightText;
						});
						zTreeObj.updateNode(node); //update node for modifications take effect
					}
					zTreeObj.showNode(node);//show node with matching keywords
					return true; //return true and show this node
				}
				zTreeObj.hideNode(node); // hide node that not matched
				return false; //return false for node not matched
			}

			var nodesShow = zTreeObj.getNodesByFilter(filterFunc); //get all nodes that would be shown
			processShowNodes(nodesShow, _keywords);//nodes should be reprocessed to show correctly
		}

		/**
		 * reprocess of nodes before showing
		 */
		function processShowNodes(nodesShow,_keywords){
			if(nodesShow && nodesShow.length>0){
				//process the ancient nodes if _keywords is not blank
				if(_keywords.length>0){
					$.each(nodesShow, function(n,obj){
						var pathOfOne = obj.getPath();//get all the ancient nodes including current node
						if(pathOfOne && pathOfOne.length>0){
							//i < pathOfOne.length-1 process every node in path except self
							for(var i=0;i<pathOfOne.length-1;i++){
								zTreeObj.showNode(pathOfOne[i]); //show node
								zTreeObj.expandNode(pathOfOne[i],pathOfOne[i].open); //expand node
							}
						}
					});
				}else{ //show all nodes when _keywords is blank and expand the root nodes
					var rootNodes = zTreeObj.getNodesByParam('level','0');//get all root nodes
					$.each(rootNodes,function(n,obj){
						zTreeObj.expandNode(obj,obj.open); //expand all root nodes
					});
				}
			}
		}

		//listen to change in input element
		$(searchField).bind('input propertychange', function() {
			var _keywords = $(this).val();
			searchNodeLazy(_keywords); //call lazy load
		});

		var timeoutId = null;
		// excute lazy load once after input change, the last pending task will be cancled
		function searchNodeLazy(_keywords) {
			if (timeoutId) {
				//clear pending task
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(function() {
				ztreeFilter(zTreeObj,_keywords); //lazy load ztreeFilter function
				$(searchField).focus();//focus input field again after filtering
			}, 500);
		}
	}

	$.fn.selectTreeVal = function(val){
        if (val){
            var domid = $(this).attr('id');
            $("#"+domid+"Show").attr("value",val.name).attr("title",val.name);
            $(this).attr("value", JSON.stringify(val));
            $(this).val(JSON.stringify(val));
            $(this).attr("initValue",val.id.join(","));
        }
    };

	$.fn.selectTree = function() {
        $(this).each(function() {
        	initSelectTree($(this));
        });
	};
}(jQuery, this));

/**
 * 画面分步组件
 */
(function ($, global) {
    /**
     * 跳转到指定步骤
     * @returns
     */
    function jumpToStep(stepContainer, step) {
        stepContainer.find('.step').each(function() {
            if($(this).data('step') == step) {
                $(this).show();
                $(this).find(FORM_INPUT_ELEMENT).data('stephide', false);
                scrollTop();
            }
            else {
                $(this).hide();
                $(this).find(FORM_INPUT_ELEMENT).data('stephide', true);
            }
        });
    }

    function scrollTop() {
        var frames = global.parent.frames, myName = global.name;
        for(var i=0;i<frames.length;i++) {
            if(frames[i].name === myName) {
                return $(frames[i].document).scrollTop(0);
            }
        }
    }

    $.fn.pageStep = function () {
        $(this).each(function() {
            if($(this).find('.pro-module-step').length > 0) {
                return;
            }
            // step 容器
            var stepContainer = $(this);
            var stepItems = stepContainer.find('.step');
            var module = $('<div class="pro-module-step"></div>');
            var stepList = $('<ul class="joyin-clear"></ul>');
            var lis = [], activeStep = 0, length = stepItems.length;
            // 根据step动态创建分步组件
            stepItems.hide().each(function(i, step) {
                var text = $('<a href="javascript:void(0);"></a>').text((i+1) + $(step).attr('title'));
                var li = $('<li></li>').append(text).append(i == 0 ? '<b class="aleft stuff"></b><b class="aright"></b>' : '<b class="aleft"></b><b class="aright"></b>');
                if($(step).attr('active')) {
                    activeStep = i;
                }
                lis.push(li.data('step', i));
                $(step).removeAttr('title');
                // 为每一个步骤之后自动添加“下一步”和“取消”按钮
                var row = $('<div class="layui-row text-center stepbar"></div>');
                var nextBtn = $('<a class="layui-btn layui-btn-sm nextStep" data-ignore="all">下一步</a>');
                var prevBtn = $('<a class="layui-btn layui-btn-sm prevStep" data-ignore="all">上一步</a>');
                var cancelBtn = $('<a class="layui-btn layui-btn-sm btn-cancel"></a>').text(JoyinUtil.getLabel('SysCommon.cancel'));
                if(i < length - 1) {
                    if(i > 0) {
                        row.append(prevBtn.data('step', i));
                    }
                    row.append(nextBtn.data('step', i));
                    row.append(cancelBtn);
                    cancelBtn.layButton();
                    $(step).append(row);
                }
                $(step).data('step', i);
            });

            // 最后一个stepbar添加上一步按钮
            var pBtn = $('<a class="layui-btn layui-btn-sm prevStep" data-ignore="all">上一步</a>');
            $('.stepbar:last', stepContainer).prepend(pBtn.data('step', lis.length-1));

            // 激活小于等于activeStep的所有步骤
            $.each(lis, function(i, li) {
                if(i <= activeStep) {
                    li.addClass('curr');
                }
            });
            // 显示激活的步骤内容
            stepContainer.find('.step:eq(' + activeStep + ')').show();

            // 将生成的步骤添加到画面
            module.append(stepList.append(lis));
            stepContainer.prepend(module);
            stepList.wrap('<div class="joyin-guage"></div>');
//			$('body').css('padding-top', 43);

            setTimeout(function() {
                var top = module.offset().top;
                window.onscroll = function() {
                    if($(window).scrollTop() <= top) {
                        module.css('position','relative');
                    }
                    else {
                    	module.css('position','fixed');
                    }
                };
            });

            // 绑定上一步、下一步的事件处理
            // 下一步
            stepContainer.on('click', '.nextStep', function () {
                var $step = $(this).parents('.step'), step = $(this).data('step');
                $step.hide();
                $step.next().show();
                lis[step+1] && lis[step+1].addClass('curr');

                $step.find(FORM_INPUT_ELEMENT).data('stephide', true);
                $step.next().find(FORM_INPUT_ELEMENT).data('stephide', false);
                scrollTop();
            });
            // 上一步
            stepContainer.on('click', '.prevStep', function() {
                var $step = $(this).parents('.step'), step = $(this).data('step');
                $step.hide();
                $step.prev().show();
                lis[step] && lis[step].removeClass('curr');

                $step.find(FORM_INPUT_ELEMENT).data('stephide', true);
                $step.next().find(FORM_INPUT_ELEMENT).data('stephide', false);
                scrollTop();
            });
            // 步骤导航点击事件
            stepList.find('li').click(function() {
                var s = $(this).data('step');
                // 激活小于等于activeStep的所有步骤
                $.each(lis, function(i, li) {
                    if(i <= s) {
                        li.addClass('curr');
                    }
                    else {
                        li.removeClass('curr');
                    }
                });
                jumpToStep(stepContainer, s);
            });
        });
    };
}(jQuery, this));
