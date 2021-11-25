
/**
 * JOYIN-Table组件提供对大批量数据的展示，过滤，排序，分页等典型功能
 * 提供多个用户事件编程接口
 */


/**
 * table选项结构
 */
const TableOption = {

    /**
     * <string: required> table名称（用于识别已存储个性设置，包括：表格显示列配置、表格导出列配置等），默认 null
     */
    tableName: null,
    /**
     * <string: optional> table显示性质的名称（用于展示，数据导出等），默认 null
     */
    displayName: null,
    /**
     * <object: optional> 记录在table上的任何值
     */
    tag: null,
    /**
     * <booleaan: optional> 是否固定表头，默认 true
     */
    fixHeader: true,
    /**
     * <number: optional> 分页大小，默认 30
     */
    pageSize: 0,
    /**
     * <number: optional> 表头高度，默认 24
     */
    headerHeight: 0,
    /**
     * <number: optional> 数据行高度，默认 24
     */
    rowHeight: 0,
    /**
     * <optional> 汇总栏行高，默认 24
     */
    footerHeight: 0,
    /**
     * <number: optional> 表格最大高度，默认不设置
     */
    maxHeight: null,
    /**
     * <boolean: optional> 是否支持表格列，随着组件的宽度变化给动态的调整列宽，设置为false可防止列宽发生变化，默认 true
     */
    dynamicColumnWidth: true,
    /**
     * <optional> 排序规则
     */
    defaultSorting: { 
        /**
         * <string: optional> 排序字段名称
         */
        prop: null, 
        /**
         * <string: optional> 排序方向
         */
        direction: null 
    },

    /**
     * <Array<String>: optional> 可参与搜索的数据字段名称（该列表，将和各个字段定义的可搜索列进行合并计算）
     */
    searchables: [],
    /**
     * <function(row_data): optional> 行dom元素class
     */
    rowClassMaker: null,
    /**
     * <function(row_data): optional> 行鼠标选中回调
     */
    rowSelected: null,
    /**
     * <function(all_rows_checked: boolean): optional> 所有行选择列勾选（未勾选）回调
     */
    allRowsChecked: null,
    /**
     * <function(row_check: boolean, row_data: Object, table_row_element: HtmlTableRowElement): optional> 行选择列勾选（未勾选）回调
     */
    rowChecked: null,
    /**
     * <function(row_data): optional> 行双击回调
     */
    rowDbClicked: null,
    /**
     * <function(): optional> 表格数据重新填充回调
     */
    refilled: null,
    /**
     * <function(filtered_records_count: Number): optional>过滤数据回调
     */
    recordsFiltered: null,
    /**
     * <function: optional>(暂未支持) 翻页、改变分页大小完成
     */
    pageTurned: null,
    /**
     * <function(column_bound_property_name: String, header_text: String): optional> 表格列发生排序事件，需要执行的回调方法
     */
    columnSorted: null,
    /**
     * <function(row_datas: Array<Object>, column_bound_property_name: String, header_text: String): optional> 自定义数据列汇总方法
     */
    summarize: null,
    /**
     * <function: optional> 服务器端数据获取方法（如果指定，则为服务器分页，在数据列排序时进行调用）
     */
    serverDataRequester: null,


    
    /**
     * <boolean: optional> 是否对缺省值单元格的内容，用占位符填充，默认true
     */
    showNoValePlaeholder: true,
};

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

/**
 * @param {*} args sequencial arguments (the first shall be extended finally & returned as return value)
 */
function extend() {

    var args = arguments;
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

function makeToken(with_prefix = false) {
    return `tk-${ new Date().getTime().toString().substr(3) }-${ Math.random().toString().substr(8, 10) }`;
}

function convertCamel2Hyphen(naming) {
    return typeof naming != 'string' ? naming : naming.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function clearHash (obj) {

    if (isJson(obj)) {
        try {
            for (let key in obj) {
                delete obj[key];
            }
        } catch (ex) {
            console.log(ex);
        }
    }
    return obj;
}

function isNone (something) {
    return (
        something === undefined ||
        something === null ||
        (typeof something == 'string' && something.trim().length == 0)
    );
}

/**
 * 提取dom元素的属性（确实情况下，可设置默认值）
 * @param {HTMLElement} $node 
 * @param {String} attr_name 
 * @param {*} default_value 
 */
function extractDomAttr($node, attr_name, default_value) {

    if (!($node instanceof HTMLElement)) {
        throw new Error('param [$node] is not an html element');
    }

    var val = $node.getAttribute(attr_name);
    if (val === null && default_value !== null && default_value !== undefined) {
        return default_value;
    }
    else if (typeof val == 'string') {
        val = val.trim();
    }
    return val;
}

/**
 * 某个属性值，是否被认定为bool类型的true
 */
function treateAsTrue(prop_value) {
    return prop_value === '' || prop_value === 'true' || prop_value === '1' || prop_value === true;
}

/**
 * 从上下文对象上，提取指定名称的方法，或者由纯字符串指定的匿名方法
 */
function validateMethod(method_name, context_obj) {
    
    if (typeof method_name == 'function') {
        return method_name;
    }
    else if (typeof method_name != 'string' || method_name.trim().length == 0) {
        return undefined;
    }
    else {
        let clean_name = method_name.trim();
        let method = context_obj[clean_name];
        if (typeof method == 'function') {
            return method;
        }
        try {
            let anonymous_method = eval(clean_name);
            if (typeof anonymous_method == 'function') {
                return anonymous_method;
            }
            else {
                console.error(`the string [${clean_name}] cannot be evaluated as an anonymous function`);
                return undefined;
            }
        }
        catch(ex) {
            console.error(`exception happens from casting the string [${clean_name}] into an anonymous function`, ex);
            return undefined;
        }
    }
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

const helper2 = {

    extend: extend,
    makeToken: makeToken,
    convertCamel2Hyphen: convertCamel2Hyphen,
    clearHash: clearHash,
    isNone: isNone,
};

class StorageProvider {
        
    /**
     * 读写显示列配置
     * @param {String|Number} table_name <required> 全局唯一的table标识
     * @param {Array<String>} header_texts <optional> 标题文字
     */
    static rwDisplayColumn(table_name, header_texts) {
        return this._rwColumn(table_name, 'table-col-display', header_texts);
    }

    /**
     * 读写导出列配置
     * @param {String|Number} table_name <required> 全局唯一的table标识
     * @param {Array<String>} header_texts <optional> 标题文字
     */
    static rwExportColumn(table_name, header_texts) {
        return this._rwColumn(table_name, 'table-col-export', header_texts);
    }

    static _rwColumn(table_name, table_usage, header_texts) {

        var data_key = `${table_usage}-${table_name}`;
        if (header_texts instanceof Array) {
            if (header_texts.length == 0) {
                delete localStorage[data_key];
            }
            else {
                localStorage[data_key] = header_texts.join(',');
            }
        }
        else {
            var setting = (localStorage[data_key] || '').trim();
            return setting.length == 0 ? [] : setting.split(',');
        }
    }
}

class RowProvider {

    /**
     * @param {Number} initial_count 
     */
    constructor(initial_count) {

        this._$rows = [this._createRow()];
        this._$rows.pop();
        this._initialize(initial_count);
    }

    _createRow() {
        return document.createElement('tr');
    }

    _initialize(count) {
        
        var start = 0;
        if (typeof count != 'number' || count > 30) {
            count = 30;
        }
        while (start < count) {
            this._$rows.push(this._createRow());
            start++;
        }
    }

    /**
     * 消耗一个行元素
     */
    borrow() {

        if (this._$rows.length == 0) {
            return this._createRow();
        }
        
        return this._$rows.shift();
    }

    /**
     * 归还一个行元素
     * @param {HTMLTableRowElement} $row 
     */
    return($row) {
        this._$rows.push($row);
    }
}

/**
 * table行数据对象（对原始业务数据进行的一次包装）
 */
class DataSuit {

    constructor(biz_data) {

        /**
         * 原始业务数据
         */
        this.bizdata = biz_data;

        /**
         * 该数据是否被勾选（checkbox勾选）
         * 该标识不放置到TableRow对象上，是因为DataRow仅仅为UI上可见的列表行，无法实现：翻页/排序/过滤，各种操作时对勾选状态进行还原
         */
        this.checked = false;
    }

    /**
     * 设置（更新）当前数据行业务数据
     */
    setData(revised_biz_data) {

        if (this.bizdata === revised_biz_data) {
            return;
        }

        helper2.extend(this.bizdata, revised_biz_data);
    }

    /**
     * 设置是否当前数据行，为勾选状态
     */
    setAsChecked(checked) {
        this.checked = checked === undefined || !!checked;
    }
}

/**
 * table行DOM管理对象（管理左中右三个独立的行）
 */
class RowDomSuit {

    get tableRef() {
        return this.tableRow.tableRef;
    }

    get containCheckCol() {
        return this.tableRow.containCheckCol;
    }

    get checkColArea() {
        return this.tableRow.checkColArea;
    }

    get $tooltip() {
        return this.tableRow.$tooltip;
    }

    /**
     * 
     * @param {TableRow} table_row 
     * @param {Array<TableColumn>} columns 
     * @param {HTMLTableElement} $table 
     * @param {String} row_id 
     */
    constructor(table_row, columns, $table, row_id) {
        
        this.tableRow = table_row;
        this.tableRowId = row_id;
        this.columns = columns;
        this.$table = $table;
        this.$tableRow = this.tableRef.rowProvider.borrow();
        this.$tableRow.id = row_id;
        this.$tableRow.style.height = this.tableRef.settings.rowHeight + 'px';
        /**
         * 上一个，由用户自定义方式生成的class
         */
        this.lastRowClass = null;
        
        // 绑定单击事件
        this.$tableRow.onclick = this.tableRow.handleRowClick.bind(this.tableRow);

        // 绑定双击事件
        if (typeof this.tableRef.eventHandler.rowDbClicked == 'function') {
            this.$tableRow.ondblclick = this.tableRow.handleRowDblClick.bind(this.tableRow);
        }
    }

    /**
     * 渲染一行新数据
     * @param {RowDomSuit} before_which_row_suit 位于哪一条数据之前，未指定，则插入到最后
     * @param {Number} index 位于哪一条数据之前，未指定，则插入到最后
     */
    draw(before_which_row_suit, index) {

        this.$tableRow.innerHTML = this._createRowCellsHtml(index);
        this._resetCustomizedRowClass();
        this._bindEvents4NewRow();

        if (before_which_row_suit) {

            let $which_row = document.getElementById(before_which_row_suit.tableRowId);
            this.$table.tBodies[0].insertBefore(this.$tableRow, $which_row);
        }
        else {
            this.$table.tBodies[0].appendChild(this.$tableRow);
        }
    }

    /**
     * 渲染行数据变化
     * @param {Object} revised_data 
     */
    drawChange(revised_data) {
        
        var members = Object.keys(revised_data);
        var original_row_data = this.tableRow.rowData;

        /**
         * 1. 循环更新每个单元格的内容
         * 2. 按优先级依次处理：模版列，编程列，一般数据绑定列
         */
        this.columns.forEach(col => {

            if (col.isDataCol !== true) {
                // 包含不适用的：选择列，序号列，占位空白列
                return;
            }

            let $data_cell = this._findCellByColumn(col);
            let any_update_happened = false;

            /**
             * 针对不同类型的列，采用不同的方式进行更新
             */

            if (col.isTemplateCol) {

                if (col.hasWatches) {

                    let depens_changed = col.watches.findIndex(memb_name => {
                        return members.indexOf(memb_name) >= 0 && revised_data[memb_name] !== original_row_data[memb_name]; }) >= 0;
    
                    if (!depens_changed) {
                        return;
                    }
    
                    let inner_content = this._generateTemplateContent(col, revised_data);
                    if (col.isHtmlTemplate) {
                        $data_cell.innerHTML = inner_content;
                        this._bindEvents4Cell(col, $data_cell);
                    }
                    else {
                        $data_cell.innerText = inner_content;
                    }
    
                    any_update_happened = true;
                }
            }
            else if (col.isProgramCol) {

                if (col.hasWatches) {

                    let depens_changed = col.watches.findIndex(memb_name => {
                        return members.indexOf(memb_name) >= 0 && revised_data[memb_name] !== original_row_data[memb_name]; }) >= 0;
                        
                    if (!depens_changed) {
                        return;
                    }
                    
                    let cell_content = col.formatter.call(this.tableRef._contextObj, revised_data, revised_data[col.propName], col.propName);
                    if (col.isHtmlContent) {
                        $data_cell.innerHTML = cell_content;
                        this._instantlyBindEvents4Cell(col, $data_cell);
                    }
                    else {
                        $data_cell.innerText = cell_content;
                    }
    
                    any_update_happened = true;
                }
            }
            else if (col.isNormalCol) {

                let has_change = members.indexOf(col.propName) >= 0 && revised_data[col.propName] !== original_row_data[col.propName];
                if (!has_change) {
                    return;
                }

                let new_val = revised_data[col.propName];
                let content_str = this.tableRef._generateSingleValueContent(new_val, col);
                $data_cell.innerText = content_str;
                any_update_happened = true;
            }
            else {
                console.error('joyin table > operation/draw-row-change encounters a column with type not specified', col);
            }

            /**
             * 在有数据发生变更 & 为class name指定了动态生成器
             */
            if (any_update_happened && col.classNameMaker) {

                let new_cls_name = this._makeCellClassName(col, revised_data, revised_data[col.propName]);
                if (new_cls_name && new_cls_name !== $data_cell.className) {
                    $data_cell.className = new_cls_name;
                }
            }
        });

        this._resetCustomizedRowClass();
    }

    /**
     * 隐藏数据行
     */
    hide() {
        this.$tableRow.style.display = 'none';
    }

    /**
     * 显示数据行
     */
    show() {
        this.$tableRow.style.display = 'table-row';
    }

    /**
     * 激活当前行为选中状态
     */
    activate() {
        this.$tableRow.classList.add(this.tableRef.config.clsname.selectedRow);
    }

    /**
     * 取消当前行激活状态
     */
    inactivate() {
        this.$tableRow.classList.remove(this.tableRef.config.clsname.selectedRow);
    }

    _resetCustomizedRowClass() {

        if (!this.tableRef.makers.rowClassMaker) {
            return;
        }

        let cus_class = this.tableRef.makers.rowClassMaker(this.tableRow.rowData) || '';
        if (cus_class == this.lastRowClass) {
            return;
        }

        if (typeof this.lastRowClass == 'string') {
            this.$tableRow.classList.remove(this.lastRowClass);
        }

        if (typeof cus_class == 'string' && cus_class.length > 0) {
            this.lastRowClass = cus_class;
            this.$tableRow.classList.add(cus_class);
        }
    }

    /**
     * 生成新行插入时，完整的数据行DOM结构
     */
    _createRowCellsHtml(index) {

        var cell_htmls = [];
        var the_row_data = this.tableRow.rowData;

        this.columns.forEach(col => {

            if (col.isCheckCol) {
                cell_htmls.push(`<td class="${this.tableRef.config.checkCol}"><span><input type="checkbox"/></span></td>`);
            }
            else if (col.isIndexCol) {
                cell_htmls.push(`<td class="${this.tableRef.config.indexCol}"><span>${ index }</span></td>`);
            }
            else if (col.isEmptyCol) {
                cell_htmls.push(`<td class="column-empty">&nbsp;</td>`);
            }
            else {

                let inner_content;
                if (col.isTemplateCol) {
                    inner_content = this._generateTemplateContent(col);
                }
                else if (col.isProgramCol) {
                    inner_content = col.formatter.call(this.tableRef._contextObj, the_row_data, the_row_data[col.propName], col.propName);
                }
                else if (col.isNormalCol) {
                    let cell_val = the_row_data[col.propName];
                    inner_content = this.tableRef._generateSingleValueContent(cell_val, col);
                }
                else {
                    inner_content = '';
                }

                let field_val = the_row_data[col.propName];
                let class_name = this._makeCellClassName(col, the_row_data, field_val);
                let align = col.align ? ` align="${col.align}"` : '';
                let tag_start = class_name ? `<td class="${class_name}"${align}>` : `<td${align}>`;
                cell_htmls.push(`${tag_start}${inner_content}</td>`);
            }
        });

        return cell_htmls.join('');
    }

    /**
     * 为新生成的数据行绑定事件
     */
    _bindEvents4NewRow() {

        this.columns.forEach(col => {

            if (col.isCheckCol) {
                // checkbox的事件在行对象上单独进行管理
                return;
            }
            else if (col.isEmptyCol || col.isIndexCol) {
                // 无需绑定任何事件
                return;
            }
            else if (col.isTemplateCol && col.isHtmlTemplate) {
            
                let $cell = this._findCellByColumn(col);
                this._bindEvents4Cell(col, $cell);
            }
            else if (col.isProgramCol && col.isHtmlContent) {
            
                let $cell = this._findCellByColumn(col);
                this._instantlyBindEvents4Cell(col, $cell);
            }
            
            if (col.overflowt) {

                let $cell = this._findCellByColumn(col);
                let is_html = col.isProgramCol && col.isHtmlContent || col.isTemplateCol && col.isHtmlTemplate;
                $cell.onmouseover = this.tableRef._showCellTooltip.bind(this.tableRef, is_html);
                $cell.onmouseout = this.tableRef._hideCellTooltip.bind(this.tableRef);
            }
        });
    }

    /**
      * 生成模板列内容字符串
      * @param {TableColumn} col
	  * @param {*} revised_data <optional> 当初始渲染时，无需提供（即为当前行数据本身）；当为更新操作时，则为发生变更的数据增量数据，必须提供
    */
    _generateTemplateContent(col, revised_data) {

        if (!(col instanceof TableColumn)) {
            return '';
        }

        let inner_content = col.templateStr;
        let row_data = revised_data !== null && revised_data !== undefined ? revised_data : this.tableRow.rowData;

        col.watches.forEach(memb_name => {

            let reg = this.tableRef._createRegex(memb_name);
            let val = row_data[memb_name];
            if (val === null || val === undefined) {
                val = '';
            }
            else if (typeof val == 'object') {
                val = '[object]';
            }
            else if (typeof val == 'function') {
                val = '[function]';
            }
            inner_content = inner_content.replace(reg, val);
        });

        return inner_content;
    }

    /**
     * 为单元格绑定控件事件
     * @param {HTMLTableCellElement} $cell
     */
    _constructButtonShelf($cell) {

        var $shelf = $cell.querySelector('.button-shelf');
        if (!$shelf) {
            return;
        }

        var $lock = $shelf.querySelector('.lock-button');
        var $menu_panel = $shelf.querySelector('ul');

        if (!$lock || !$menu_panel) {
            return;
        }

        function hidePanel () {
            $menu_panel.style.display = 'none';
        }

        $lock.onclick = () => {

            var key_panel = '$lastMenuPanel';
            var key_timer = '_hideMenuPanelTimer';

            var $last_panel = this.tableRef[key_panel];            
            if ($last_panel && $last_panel !== $menu_panel) {
                $last_panel.style.display = 'none';
            }

            clearTimeout(this.tableRef[key_timer]);
            this.tableRef[key_panel] = $menu_panel;
            
            if ($menu_panel.style.display != 'block') {

                $menu_panel.style.display = 'block';
                $menu_panel.style.right = $menu_panel.offsetWidth + 10 + 'px';
                this.tableRef[key_timer] = setTimeout(hidePanel, 1000 * 5);
            }
            else {
                $menu_panel.style.display = 'none';
            }
        };

        var $menu_buttons = $menu_panel.querySelectorAll('li > a');
        $menu_buttons.forEach($mb => { $mb.addEventListener('click', hidePanel) });
    }

    /**
     * 为单元格绑定控件事件
     * @param {TableColumn} col 
     * @param {HTMLTableCellElement} $cell
     */
    _bindEvents4Cell(col, $cell) {

        if (col.templateEvents.length == 0) {
            return;
        }

        col.templateEvents.forEach(event_def => {

            let $ctr = $cell.querySelector(event_def.selector);
            if ($ctr != null) {

                $ctr[event_def.eventName] = () => {

                    event_def.handler.call(this.tableRef._contextObj, this.tableRow.rowData, $ctr, $cell);
                    if (this.$lastMenuPanel instanceof HTMLElement) {
                        this.$lastMenuPanel.style.display = 'none';
                    }
                    event.cancelBubble = true;
                };
            }
        });

        this._constructButtonShelf($cell);
    }

    /**
     * 为编程单元格，即时生成的控件，绑定事件
     * @param {TableColumn} col 
     * @param {HTMLTableCellElement} $cell
     */
    _instantlyBindEvents4Cell(col, $cell) {

        var template_events = col._extractEvents($cell);
        if (template_events.length == 0) {
            return;
        }

        template_events.forEach(event_def => {
            let $ctr = $cell.querySelector(event_def.selector);
            if ($ctr != null) {
                $ctr[event_def.eventName] = () => { 
                    event_def.handler.call(this.tableRef._contextObj, this.tableRow.rowData, $ctr, $cell);
                    event.cancelBubble = true;
                };
            }
        });

        this._constructButtonShelf($cell);
    }

    /**
     * 根据列配置，生成单元格class name
     * @param {TableColumn} table_col 
     * @param {Object} row_data 
     * @param {*} field_val 
     */
    _makeCellClassName(table_col, row_data, field_val) {
        
        var class_names = [];
        if (table_col.className) {
            class_names.push(table_col.className);
        }
        if (table_col.overflowt) {
            class_names.push('s-ellipsis');
        }
        if (table_col.classNameMaker) {
            class_names.push(table_col.classNameMaker(field_val, row_data));
        }
        return class_names.length > 0 ? class_names.join(' ') : null;
    }

    /**
     * 根据列查找该行+该列对应的单元格
     * @param {TableColumn} col 
     */
    _findCellByColumn(col) {
        return this.$tableRow.querySelector(`td:nth-child(${col.columnIdx})`);
    }
}

/**
 * table行对象
 */
class TableRow {

    get containCheckCol() {
        return this.tableRef.containCheckCol;
    }

    get checkColArea() {
        return this.tableRef.checkColBelong2Area;
    }

    get $tooltip() {
        return this.tableRef.$tooltip;
    }

    /**
     * 实际的行业务数据
     */
    get rowData() {
        return this.dataSuit.bizdata;
    }

    /**
     * 当前行是否处于选中状态
     */
    get isChecked() {
        return this.dataSuit.checked === true;
    }
    
    /**
     * 
     * @param {JoyinTable} table_ref 
     * @param {Object} row_data 
     * @param {Number|String} row_key 
     */
    constructor(table_ref, row_data, row_key) {

        if (!(table_ref instanceof JoyinTable)) {
            throw new Error('table is not an instance of [JoyinTable]');
        }
        else if (row_data === null || row_data === undefined || typeof row_data != 'object') {
            throw new Error('row data is not a json or an object');
        }
        else if (typeof row_key != 'number' && typeof row_key != 'string') {
            throw new Error('row data key is neither a numbe nor a string');
        }
        
        this.tableRef = table_ref;
        this.rowKey = row_key;
        this.dataSuit = new DataSuit(row_data);
    }

    /**
     * 渲染一行新数据
     * @param {TableRow} beforeRow 位于哪一条数据之前，未指定，则插入到最后
     * @param {*} index 绘制选项
     */
    render(beforeRow, index) {

        if (!this.domSuit) {

            this.domSuit = new RowDomSuit(this, this.tableRef.columns, this.tableRef.$bodyTable, `${this.tableRef.tableId}-${this.rowKey}`);
            this.domSuit.$tableRow.addEventListener('mouseover', this._setHoverEffect.bind(this, true));
            this.domSuit.$tableRow.addEventListener('mouseout', this._setHoverEffect.bind(this, false));
        }

        this.domSuit.draw(beforeRow ? beforeRow.domSuit : null, index);
        if (this.containCheckCol && this.checkColArea === this.tableRef.config.tableAreaName.center) {
            this._setCheckboxRef(this.domSuit);
        }
        
        /**
         * 左边固定表格行
         */

        if (this.tableRef.hasLeftFixed) {

            if (!this.leftDomSuit) {

                this.leftDomSuit = new RowDomSuit(this, this.tableRef.leftColumns, this.tableRef.$bodyLeftTable, `${this.tableRef.tableId}-${this.rowKey}-left`);
                this.leftDomSuit.$tableRow.addEventListener('mouseover', this._setHoverEffect.bind(this, true));
                this.leftDomSuit.$tableRow.addEventListener('mouseout', this._setHoverEffect.bind(this, false));
            }

            this.leftDomSuit.draw(beforeRow ? beforeRow.leftDomSuit : null, index);
            if (this.containCheckCol && this.checkColArea === this.tableRef.config.tableAreaName.left) {
                this._setCheckboxRef(this.leftDomSuit);
            }
        }

        /**
         * 右边固定表格行
         */

        if (this.tableRef.hasRightFixed) {

            if (!this.rightDomSuit) {

                this.rightDomSuit = new RowDomSuit(this, this.tableRef.rightColumns, this.tableRef.$bodyRightTable, `${this.tableRef.tableId}-${this.rowKey}-right`);
                this.rightDomSuit.$tableRow.addEventListener('mouseover', this._setHoverEffect.bind(this, true));
                this.rightDomSuit.$tableRow.addEventListener('mouseout', this._setHoverEffect.bind(this, false));
            }

            this.rightDomSuit.draw(beforeRow ? beforeRow.rightDomSuit : null, index);
            if (this.containCheckCol && this.checkColArea === this.tableRef.config.tableAreaName.right) {
                this._setCheckboxRef(this.rightDomSuit);
            }
        }
    }

    _setHoverEffect(is_on) {
        
        var set_effect = (row_dom_suit) => {
            is_on ? row_dom_suit.$tableRow.classList.add(this.tableRef.config.clsname.hoverRow)
                    : row_dom_suit.$tableRow.classList.remove(this.tableRef.config.clsname.hoverRow);
        };

        set_effect(this.domSuit);

        if (this.leftDomSuit) {
            set_effect(this.leftDomSuit);
        }

        if (this.rightDomSuit) {
            set_effect(this.rightDomSuit);
        }
    }

    /**
     * 创建checkbox控件引用并绑定基本事件
     * @param {RowDomSuit} row_dom_suit 
     */
    _setCheckboxRef(row_dom_suit) {

        let $checkbox = row_dom_suit.$tableRow.querySelector(`td.${this.tableRef.config.checkCol} > span > input`);
        // 生成行时，还原最新选中状态
        $checkbox.checked = !!this.dataSuit.checked;
        $checkbox.onclick = this.handleRowCheckChange.bind(this);
        this.$checkbox = $checkbox;
    }

    toggleRowCheckEffect() {

        if (this.dataSuit.checked) {

            this.leftDomSuit && this.leftDomSuit.$tableRow.classList.add(this.tableRef.config.clsname.checkedRow);
            this.domSuit && this.domSuit.$tableRow.classList.add(this.tableRef.config.clsname.checkedRow);
            this.rightDomSuit && this.rightDomSuit.$tableRow.classList.add(this.tableRef.config.clsname.checkedRow);
        }
        else {
            
            this.leftDomSuit && this.leftDomSuit.$tableRow.classList.remove(this.tableRef.config.clsname.checkedRow);
            this.domSuit && this.domSuit.$tableRow.classList.remove(this.tableRef.config.clsname.checkedRow);
            this.rightDomSuit && this.rightDomSuit.$tableRow.classList.remove(this.tableRef.config.clsname.checkedRow);
        }
    }

    /**
     * 渲染数据变化
     * @param {Object} revised_data 
     */
    renderChange(revised_data) {

        if (revised_data === null || typeof revised_data != 'object') {
            console.error('data is not valid');
            return;
        }

        if (this.domSuit) {
            this.domSuit.drawChange(revised_data);
        }
        
        /**
         * 左边固定表格行
         */

        if (this.tableRef.hasLeftFixed && this.leftDomSuit) {
            this.leftDomSuit.drawChange(revised_data);
        }

        /**
         * 右边固定表格行
         */

        if (this.tableRef.hasRightFixed && this.rightDomSuit) {
            this.rightDomSuit.drawChange(revised_data);
        }

        // 进行数据层面的更新
        helper2.extend(this.rowData, revised_data);
    }

    /**
     * 仅仅更新数据行绑定的数据本身
     * @param {Object} revised_data 
     */
    updateDataOnly(revised_data) {
       helper2.extend(this.rowData, revised_data);
    }

    /**
     * 处理行单击（选择事件）
     */
    handleRowClick() {
        this.tableRef._selectRow(this);
    }

    /**
     * 处理行双击事件
     */
    handleRowDblClick() {
        this.tableRef._handleRowDblClick(this);
    }

    /**
     * 勾选|不勾选
     * @param {Boolean} as_checked 是否选中（缺失时，默认选中）
     */
    check(as_checked = true) {

        as_checked = !!as_checked;

        if (as_checked == this.dataSuit.checked) {
            return;
        }

        this.$checkbox.checked = as_checked;
        this.dataSuit.setAsChecked(as_checked);
        this.toggleRowCheckEffect();
        this.tableRef._handleRowCheck(this, as_checked, false);
    }

    /**
     * 处理行选择事件
     * @param {Boolean} forbid_callback 勾选事件，否阻止向顶层组件进行传播
     */
    handleRowCheckChange(forbid_callback) {
        
        var is_checked = this.$checkbox.checked;
        this.dataSuit.setAsChecked(is_checked);
        this.toggleRowCheckEffect();

        if (forbid_callback !== false && typeof this.tableRef.eventHandler.rowChecked == 'function') {
            this.tableRef.eventHandler.rowChecked(this.dataSuit.checked, this.dataSuit.bizdata, this.domSuit.$tableRow);
        }

        this.tableRef._handleRowCheck(this, is_checked, forbid_callback);
        event.cancelBubble = true;
    }

    /**
     * 隐藏数据行
     */
    hide() {

        this.domSuit && this.domSuit.hide();
        this.leftDomSuit && this.leftDomSuit.hide();
        this.rightDomSuit && this.rightDomSuit.hide();
    }

    /**
     * 显示数据行
     */
    show() {

        this.domSuit && this.domSuit.show();
        this.leftDomSuit && this.leftDomSuit.show();
        this.rightDomSuit && this.rightDomSuit.show();
    }

    /**
     * 激活当前行为选中状态
     */
    activate() {
        
        this.domSuit && this.domSuit.activate();
        this.leftDomSuit && this.leftDomSuit.activate();
        this.rightDomSuit && this.rightDomSuit.activate();
    }

    /**
     * 取消当前行激活状态
     */
    inactivate() {

        this.domSuit && this.domSuit.inactivate();
        this.leftDomSuit && this.leftDomSuit.inactivate();
        this.rightDomSuit && this.rightDomSuit.inactivate();
    }

    /**
     * 物理删除数据行
     */
    delete() {
        
        this.domSuit && this.domSuit.$tableRow.remove();
        this.leftDomSuit && this.leftDomSuit.$tableRow.remove();
        this.rightDomSuit && this.rightDomSuit.$tableRow.remove();
    }
}

/**
 * 数据行位置结构
 */
class TableRowLocation {
    
    /**
     * 
     * @param {Number} location 表格行位于序列当中的位置（基于0开始的索引）
     * @param {TableRow} table_row 表格行对象实例
     */
    constructor(location, table_row) {
        
        /**
         * 行数据在集合当中，所处的位置（基于0开始的索引）
         */
        this.location = location;

        /**
         * 行数据本身
         */
        this.tableRow = table_row;
    }
}

/**
 * 单元格模板当中的，控件选择器 - 事件类型 - 事件处理函数，组合关系
 */
class Selector2Handler {

    /**
     * 
     * @param {String} ctr_selector 
     * @param {String} event_name 
     * @param {Function} handler 
     */
    constructor(ctr_selector, event_name, handler) {

        /**
         * 事件主体控件选择器
         */
        this.selector = ctr_selector;
        /**
         * 事件名称
         */
        this.eventName = event_name;
        /**
         * 事件处理函数
         */
        this.handler = handler;
    }
}

/**
 * table列对象
 */
class TableColumn {

    /**
     * 是否为用户自定义排序规则
     */
    get isCustomSorting() {
        return typeof this.sortingMethod == 'function';
    }
    
    /**
     * 
     * @param {String} area 目标展示区域 left/center/right
     * @param {Object} table_context_obj table上下文对象
     * @param {Number} column_index 该列在集合当中的相对位置（起步计数为1）
     */
    constructor(area, table_context_obj, column_index) {

        this.area = area;
        /**
         * 表格的上下文对象
         */
        this._tableContextObj = table_context_obj;
        /**
         * 列位于所在集合的位置，起步计数为1
         */
        this.columnIdx = column_index;
    }

    /**
     * 计算一个列的宽度
     * @param {HTMLTableCellElement} $col 
     * @param {String} attr_name 
     * @param {Number} default_width 
     */
    _extractColWidth($col, attr_name, default_width) {

        var width = extractDomAttr($col, attr_name, default_width);
        try {
            if (typeof width != 'number') {
                width = parseInt(width);
            }
            if (width < 0) {
                width = default_width;
            }
        }
        catch(ex) {
            width = default_width;
        }

        return width;
    }

    /**
     * 从列的定义上，提取该列定义的事件，并返回事件字典（key：事件名称，value：事件处理函数引用）
     * @param {HTMLTableCellElement} $cell 
     */
    _extractEvents($cell) {

        /** 模版列 | 程序化列，能支持的native控件事件白名单 */
        var native_events = ['onclick', 'onchange', 'onkeydown', 'onfocus', 'onblur'];
        var event_prefix = 'event.';
        var context_obj = this._tableContextObj;
        var event_set = [new Selector2Handler(null, null, null)];
        event_set.pop();

        function extract($parent, upper_level_class) {

            if (!($parent instanceof HTMLElement) || $parent.childElementCount == 0) {
                return;
            }

            let $cur = $parent.firstElementChild;
            let seq = 1;

            while ($cur != null) {

                let cur_level_class = upper_level_class + '-' + seq;
                let has_any_event = false;

                native_events.forEach((native_name) => {

                    let native_handler_name = extractDomAttr($cur, native_name);
                    if (native_handler_name) {
                        // 去掉标签上原始的inline方式事件绑定
                        $cur.removeAttribute(native_name);
                    }

                    let event_name = event_prefix + native_name;
                    let handler_name = extractDomAttr($cur, event_name);

                    if (handler_name) {

                        $cur.removeAttribute(event_name);
                        let click_handler = validateMethod(handler_name, context_obj);
                        if (typeof click_handler == 'function') {

                            has_any_event = true;
                            event_set.push(new Selector2Handler('.' + cur_level_class, native_name, click_handler));
                        }
                    }
                });

                if (has_any_event) {
                    $cur.classList.add(cur_level_class);
                }

                if ($cur.childElementCount > 0) {
                    extract($cur, cur_level_class);
                }

                seq++;
                $cur = $cur.nextElementSibling;
            }
        }

        var top_class = 'cell-ele-' + helper2.makeToken();
        extract($cell, top_class);
        return event_set;
    }

    /**
     * 从列的定义上，提取该列需要观察的数据成员
     * @param {HTMLTableCellElement} $col 
     */
    _extractWatchers($col) {
        
        /**
         * 能够引起当前单元格内容变化的组成因子
         * 1. 对模板列，未设置，则单元格内容生成后不再响应任何字段的变化
         */
        let prop_watches = extractDomAttr($col, 'watch');
        let watches_arr = typeof prop_watches == 'string' ? prop_watches.split(',').map(x => x.trim()).filter(x => x.length > 0) : [];

        /**
         * 在有观察目标字段的前提下，建立的观察字段字典表, key: 字段名称, value: true
         */
        var watches = [];

        if (watches_arr.length > 0) {
            watches_arr.forEach(prop_name => { watches.push(prop_name); });
        }

        if (this.hasBound2Prop && !watches_arr.includes(this.propName)) {
            watches.push(this.propName);
        }

        return watches;
    }

    /**
     * 构建完整的列信息
     * @param {HTMLTableCellElement} $cell
     * @param {JoyinTable} table_ref
     */
    compile($cell, table_ref) {

        if (!($cell instanceof HTMLTableCellElement)) {
            throw `the param <$col> is not a table cell`;
        }

        // 列行为特征类型
        var col_type = extractDomAttr($cell, 'type');
        var prop_fmt = extractDomAttr($cell, 'formatter');
        var func_fmt = validateMethod(prop_fmt, this._tableContextObj);

        /**
         * 是否为序号列
         */
        this.isIndexCol = col_type == table_ref.config.colType.index;
        /**
         * 是否为选择列
         */
        this.isCheckCol = col_type == table_ref.config.colType.check;
        /**
         * 是否为模版列
         */
        this.isTemplateCol = col_type == table_ref.config.colType.template || $cell.childElementCount > 0;
        /**
         * 是否为编程格式化列
         */
        this.isProgramCol = !this.isTemplateCol && (col_type == table_ref.config.colType.program || typeof func_fmt == 'function');
        // 是否为数据列
        var is_data_col = !this.isIndexCol && !this.isCheckCol;
        /**
         * 是否为数据列（非选择 & 非序号，包括普通数据列 & 模板列 & 程序化列）
         */
        this.isDataCol = is_data_col;
        /**
         * 是否为单个数据字段绑定列（除其他所有列类型之外的列，为单字段绑定数据列）
         */
        this.isNormalCol = is_data_col && !this.isTemplateCol && !this.isProgramCol;
        /**
         * 标题文字
         */
        this.headerText = extractDomAttr($cell, 'label') || $cell.innerText.trim();
        if (!this.headerText) {
            this.headerText = this.isIndexCol ? '序号' : this.isCheckCol ? '选择' : ('COL-' + this.columnIdx);
        }

        /**
         * 绑定数据字段的名称（针对所有《数据型》的列类型，都可作用）
         * 1. 针对普通数据列，作绑定字段 + 排序
         * 2. 针对模板列，作排序
         * 3. 针对程序化列，作排序
         */
        this.propName = extractDomAttr($cell, 'prop');
        /**
         * 是否绑定了具体目标字段
         * 1. 普通列、模板列、编程列，都可绑定字段
         * 2. 序号列 & 选择列则不可绑定，指定了也无效
         */
        this.hasBound2Prop = typeof this.propName == 'string';
        var min_col_width = 20;
        var prop_fixed_width = this._extractColWidth($cell, 'fixed-width', 0);
        var prop_min_width = this._extractColWidth($cell, 'min-width', min_col_width);
        var prop_width = this._extractColWidth($cell, 'width', 100);

        /**
         * 是否为固定列宽
         */
        this.isFixedWidth = prop_fixed_width > 0;
        /**
         * 能够允许的，最小宽度
         */
        this.minWidth = this.isFixedWidth ? Math.max(prop_fixed_width, min_col_width) : prop_min_width;
        /**
         * 当前实际呈现状态的宽度
         */
        this.width = this.isFixedWidth ? Math.max(prop_fixed_width, min_col_width) : Math.max(prop_width, this.minWidth);
        /**
         * 由正常显示到隐藏（设置宽度为0）时，在被隐藏之前的宽度
         */
        this.lastWidth = this.width;
        /**
         * 单元格左中右对齐方式
         */
        this.align = extractDomAttr($cell, 'align');
        /**
         * header/body/footer多个部分，对应位置的col定义
         */
        this.$mulCols = [document.createElement('col')];
        this.$mulCols.pop();
        /**
         * 是否在内容无法完整呈现时，显示省略号效果，并且鼠标hover事件时，显示完整内容的tooltip
         */
        this.overflowt = is_data_col && treateAsTrue(extractDomAttr($cell, 'overflowt'));

        if (this.isNormalCol && !this.hasBound2Prop) {
            throw `the column <${$cell.outerHTML}> is a normal data column but has not bound to a property`;
        }

        var prop_sortable = treateAsTrue(extractDomAttr($cell, 'sortable'));
        var prop_sorting_method = validateMethod(extractDomAttr($cell, 'sorting-method'), this._tableContextObj);

        /**
         * 是否可进行排序
         * 1. 一般数据列可参与排序
         * 2. 指定了property的模板列，或指定了排序方法，可参与排序，否则不可以
         * 3. 指定了property的编程列，或指定了排序方法，可参与排序，否则不可以
         */
        this.sortable = is_data_col && prop_sortable && this.propName
                        || is_data_col && typeof prop_sorting_method == 'function';

        if (this.sortable && typeof prop_sorting_method == 'function') {

            /**
             * 用户指定的，对该列的排序方式
             */
            this.sortingMethod = prop_sorting_method;
        }

        var is_searchable = treateAsTrue(extractDomAttr($cell, 'searchable'));
        var is_summarizable = treateAsTrue(extractDomAttr($cell, 'summarizable'));

        /**
         * 是否可参与搜索
         */
        this.searchable = is_data_col && this.propName && is_searchable;

        /**
         * 是否参与汇总（仅对number数据有效）
         */
        this.summarizable = is_data_col && this.propName && is_summarizable;

        /**
         * 是否参与导出
         */
        this.exportable = is_data_col && treateAsTrue(extractDomAttr($cell, 'exportable', true));

        // 单元格样式
        this.className = extractDomAttr($cell, 'class');
        var prop_cm = extractDomAttr($cell, 'class-maker');
        if (prop_cm) {
            this.classNameMaker = validateMethod(prop_cm, this._tableContextObj);
        }

        // 标题栏单元格样式
        this.headerClassName = extractDomAttr($cell, 'header-class');
        var prop_hcm = extractDomAttr($cell, 'header-class-maker');
        if (prop_hcm) {
            this.headerClassNameMaker = validateMethod(prop_hcm, this._tableContextObj);
        }

        // 底边栏单元格样式
        this.footerClassName = extractDomAttr($cell, 'footer-class');
        var prop_fcm = extractDomAttr($cell, 'footer-class-maker');
        if (prop_fcm) {
            this.footerClassNameMaker = validateMethod(prop_fcm, this._tableContextObj);
        }

        /**
         * 是否导出数据遵照UI呈现规则（仅对非模版内容有效）
         */
        var export_fmt = validateMethod(extractDomAttr($cell, 'export-formatter'), this._tableContextObj);
        if (typeof export_fmt == 'function') {
            
            /**
             * 1. [function] export formatter 用于导出数据时，对数据进行格式化；
             * 2. 函数调用参数列表 ([object] prop_value, [string] prop_name, [object] row_data)；
             * 3. 如果没有指定该格式化函数，则导出时将调用：用于UI显示格式函数formatter；
             * 4. 如果在 export formatter & formatter 都未指定的情况下，则导出时，遵循prop name指定的数据字段（并配合data cell option选项进行简单格式化）；
             * 5. 如果在 export formatter & formatter & prop name 都未指定的情况下，则该列将不会被导出；
             * 6. 不能导出的列：exportable为false的列 / 序号列 / 选择列；
             */
            this.exportFormatter = export_fmt;
        }

        if (this.isTemplateCol) {

            /**
             * 模版含有html片段时，需提取绑定的事件
             */
            if ($cell.childElementCount > 0) {

                /**
                 * 模板当作html形式处理
                 */
                this.isHtmlTemplate = true;

                /**
                 * 提取自模版dom结构的事件map
                 * key: 元素class name -- 模版内唯一
                 * value: 处理函数引用
                 */
                this.templateEvents = this._extractEvents($cell);
            }

            /**
             * 模版字符串
             */
            this.templateStr = $cell.innerHTML.trim();

            /**
             * 1. 模板列，能够引起单元格内容产生变化的因子，未指定，则为null & 单元格内容生成后不再产生任何变化
             */
            this.watches = this._extractWatchers($cell);
            /**
             * 2. 模板列，是否有观察的数据成员
             */
            this.hasWatches = this.watches.length > 0;
        }
        else if (this.isProgramCol) {
            
            if (typeof func_fmt == 'function') {

                /**
                 * 1. [function]编程列，内容格式化方法；
                 * 2. 参数列表 ([object] prop_value, [string] prop_name, [object] row_data)；
                 */
                this.formatter = func_fmt;

                /**
                 * 编程列，格式化内容是否作为inner html方式插入单元格（否则，作为inner text方式处置）
                 */
                this.isHtmlContent = treateAsTrue(extractDomAttr($cell, 'format-as-html', true));

                /**
                 * 2. 编程列，能够引起单元格内容产生变化的因子，未指定，则为null & 单元格内容生成后不再产生任何变化
                 */
                this.watches = this._extractWatchers($cell);
                /**
                 * 2. 编程列，是否有观察的数据成员
                 */
                this.hasWatches = this.watches.length > 0;
            }
        }
        else if (this.isNormalCol) {

            /**
             * 一般数据列，数据展示选项
             */
            this.dataCellOption = {

                // 各个属性之间存在互斥或叠加关系

                thousands: treateAsTrue(extractDomAttr($cell, 'thousands')),
                thousandsInteger: treateAsTrue(extractDomAttr($cell, 'thousands-int')),
                percentage: treateAsTrue(extractDomAttr($cell, 'percentage')),
                // 仅对percentage格式化有效
                by100: treateAsTrue(extractDomAttr($cell, 'by100')),
                // 所有数据呈现有效
                precision: extractDomAttr($cell, 'precision'),
            };
        }
    }

    /**
     * 编译为占位空列
     * @param {TableColumn} context_col
     */
    compile2Empty(context_col) {
        
        /**
         * 用于占位的空白列
         */
        this.isEmptyCol = true;
        this.headerText = context_col.headerText;
        this.isFixedWidth = context_col.isFixedWidth;
        this.width = context_col.width;
        this.lastWidth = context_col.width;
        this.minWidth = context_col.minWidth;
        this.align = context_col.align;
        /**
         * 该空白列映射到的实际列
         */
        this.mappedCol = context_col;
        this.$mulCols = [document.createElement('col')];
        this.$mulCols.pop();
    }

    /**
     * 1. 建立column对象到 <col> 及 <th> 元素的引用
     * 2. 一个column可对应上中下三部分的col元素
     * @param {HTMLTableColElement} $col <table>/<colgroup>/<col> 引用
     */
    addColRef($col) {
        this.$mulCols.push($col);
    }

    /**
     * 建立column对象到 header 对应列单元格元素的引用
     * @param {HTMLTableCellElement} $header_cell <table>/<thead>/<th> 引用
     */
    addHeaderCellRef($header_cell) {

        if (!($header_cell instanceof HTMLTableCellElement)) {
            throw new Error('<$header_cell> must be correct table header cell');
        }

        /**
         * 该列，位于标题栏对应位置的，标题单元格
         */
        this.$headerCell = $header_cell;
    }

    /**
     * 建立column对象到 footer 对应列单元格元素的引用
     * @param {HTMLTableCellElement} $footer_cell <table>/<tfoot>/<td> 引用
     */
    addFooterCellRef($footer_cell) {

        if (!($footer_cell instanceof HTMLTableCellElement)) {
            throw new Error('<$footer_cell> must be correct table cell');
        }

        /**
         * 该列，在汇总栏当中，对应的单元格
         */
        this.$footerCell = $footer_cell;
        /**
         * 该列汇总值
         */
        this.totalValue = 0;
    }

    /**
     * 获取列是否处于展示（可见）状态
     */
    isVisible() {
        return this.width > 0;
    }

    /**
     * 设置列是否可见
     * @param {Boolean} visible 可见标识
     */
    setVisible(visible) {

        if (this.$mulCols.length == 0) {
            console.error('set col element reference firstly');
            return;
        }

        if (visible === true) {
            this.width = this.lastWidth;
            this.$mulCols.forEach(each_col => { each_col.width = this.lastWidth; });
        }
        else {
            this.width = 0
            this.$mulCols.forEach(each_col => { each_col.width = 0; });
        }
    }

    /**
     * 设置该列宽度，于整个table的宽度，所占权重（0~1）
     * @param {Number} table_standard_width 
     */
    setWeight(table_standard_width) {

        /**
         * 列宽占整个表格宽度的权重
         */
        this.weight = this.isFixedWidth ? 0 : this.width / table_standard_width;
    }

    /**
     * 设置列宽
     * @param {Number} new_width 列宽 >= 0
     */
    resize(new_width) {

        if (this.$mulCols.length == 0) {
            console.error('set reference to col element(s) firstly');
            return;
        }
        
        if (new_width < 0) {
            console.error('can only set a positive value for column width');
            return;
        }
        else if (this.minWidth > 0 && new_width < this.minWidth) {
            console.error(`can not set column width to ${new_width}, the min width is ${this.minWidth}`);
            return;
        }
        
        this.width = new_width;
        this.lastWidth = new_width;
        this.$mulCols.forEach(each_col => { each_col.width = new_width; });
    }
}

/**
 * table和宽度关系组
 */
class Table2Width {

    /**
     * @param {HTMLTableElement} $table 
     * @param {Number|String} width 
     */
    constructor($table, width) {

        this.$table = $table;
        this.width = width;
    }
}

/**
 * JOYIN TABLE COMPONENT
 */
class JoyinTable {

    /**
     * 创建一个table
     * @param {Array<TableColumn>} columns 
     * @param {String} table_class 
     */
    _createTable(columns, table_class) {

        var $col_group = document.createElement('colgroup');
        columns.forEach(this_column => {

            let $ele_col = document.createElement('col');
            // 设置col初始宽度
            $ele_col.width = this_column.width;
            // 建立column对象到col元素的引用
            this_column.addColRef($ele_col);
            $col_group.appendChild($ele_col);
        });

        var $table = document.createElement('table');
        $table.classList.add(table_class);
        $table.border = 0;
        $table.cellSpacing = 0;
        $table.cellPadding = 0;
        $table.appendChild($col_group);
        return $table;
    }

    /**
     * 构建header部分，包含左中右3个table
     */
    _createHeader() {

        var $header = document.createElement('div');
        var $header_inner = document.createElement('div');
        $header.classList.add(this.config.clsname.header);
        $header.appendChild($header_inner);
        $header_inner.classList.add(`${this.config.clsname.header}-inner`);

        if (this.fixHeader) {
            $header.classList.add(this.config.clsname.headerFixed);
        }

        /**
         * 
         * @param {Array<TableColumn>} columns 
         * @param {String} table_class 
         */
        var createHeaderTable = (columns, table_class) => {

            let $table = this._createTable(columns, table_class);
            let $title_row = document.createElement('tr');
            $title_row.style.height = this.settings.headerHeight + 'px';

            columns.forEach(this_col => {

                let $hd_cell = document.createElement('th');
                $hd_cell.innerHTML = `<span class="header-text">${this_col.isEmptyCol ? '' : this_col.headerText}</span>`;

                // header 单元格添加固有 class name
                $hd_cell.classList.add(this.config.clsname.headerCell);

                // header 单元格添加指定静态 class name
                if (this_col.headerClassName) {
                    $hd_cell.classList.add(this_col.headerClassName);
                }

                // header 单元格添加动态 class name
                if (this_col.headerClassNameMaker) {
                    try {
                        let dynamic_cls = this_col.headerClassNameMaker(this_col.propName);
                        if (typeof dynamic_cls == 'string' && dynamic_cls.length > 0) {
                            $hd_cell.classList.add(dynamic_cls);
                        }
                    }
                    catch(ex) {
                        console.error(ex);
                    }
                }

                if (this_col.align) {
                    $hd_cell.style.textAlign = this_col.align;
                }
                
                if (this_col.isCheckCol) {

                    $hd_cell.classList.add(this.config.checkCol);
                    $hd_cell.innerHTML = `<span><input type="checkbox" title="全选/全不选"/></span>`;
                    this._createHeaderCheckbox($hd_cell);
                }
                else if (this_col.sortable) {

                    $hd_cell.classList.add(this.config.clsname.sortableCol);
                    $hd_cell.innerHTML = $hd_cell.innerHTML + `<span class="sorting-icons layui-table-sort layui-inline">
                                                                    <i class="top layui-edge layui-table-sort-asc"></i>
                                                                    <i class="bottom layui-edge layui-table-sort-desc"></i>
                                                                </span>`;
                    $hd_cell.addEventListener('click', () => { 
                        this._handleColumnSorting(this_col);
                        typeof this.eventHandler.columnSorted == 'function' && this.eventHandler.columnSorted(this_col.propName, this_col.headerText);
                    });
                }

                // 建立列对象对标题栏各自的单元格元素的引用
                this_col.addHeaderCellRef($hd_cell);
                $title_row.appendChild($hd_cell);
            });

            $table.createTHead();
            $table.tHead.appendChild($title_row);
            return $table;
        };

        if (this.leftColumns.length > 0) {

            /**
             * header部分，固定左侧table
             */
            this.$headerLeftTable = createHeaderTable(this.leftColumns, this.config.clsname.table.left);
            $header_inner.appendChild(this.$headerLeftTable);
        }

        if (this.rightColumns.length > 0) {

            /**
             * header部分，固定右侧table
             */
            this.$headerRightTable = createHeaderTable(this.rightColumns, this.config.clsname.table.right);
            $header_inner.appendChild(this.$headerRightTable);
        }

        /**
         * header部分，中间table
         */
        this.$headerTable = createHeaderTable(this.columns, this.config.clsname.table.center);
        $header_inner.appendChild(this.$headerTable);

        this.$headerInner = $header_inner;
        this.$header = $header;
        this.$component.appendChild($header);
    }

    /**
     * 创建header的全选checkbox控件
     * @param {HTMLTableCellElement} $header_cell 
     */
    _createHeaderCheckbox($header_cell) {

        this.$togglingAllCheckbox = $header_cell.querySelector('input');
        this.$togglingAllCheckbox.addEventListener('change', this._toggleCheckAll.bind(this));
    }

    /**
     * 构建body部分，包含左中右3个table
     */
    _createBody() {

        var $body = document.createElement('div');
        var $body_inner = document.createElement('div');
        $body.classList.add(this.config.clsname.body);
        $body.appendChild($body_inner);
        $body_inner.classList.add(`${this.config.clsname.body}-inner`);

        /**
         * 
         * @param {Array<TableColumn>} columns 
         * @param {String} table_class 
         */
        var createBodyTable = (columns, table_class) => {

            let $table = this._createTable(columns, table_class);
            $table.createTBody();
            return $table;
        };

        if (this.leftColumns.length > 0) {
            /**
             * body部分，固定左侧table
             */
            this.$bodyLeftTable = createBodyTable(this.leftColumns, this.config.clsname.table.left);
            $body_inner.appendChild(this.$bodyLeftTable);
        }

        if (this.rightColumns.length > 0) {
            /**
             * body部分，固定右侧table
             */
            this.$bodyRightTable = createBodyTable(this.rightColumns, this.config.clsname.table.right);
            $body_inner.appendChild(this.$bodyRightTable);
        }

        /**
         * body部分，中间table
         */
        this.$bodyTable = createBodyTable(this.columns, this.config.clsname.table.center);
        $body_inner.appendChild(this.$bodyTable);

        this.$bodyInner = $body_inner;
        this.$body = $body;
        this.$component.appendChild($body);
    }

    /**
     * 构建footer部分，包含左中右3个table
     */
    _createFooter() {

        var $footer = document.createElement('div');
        var $footer_inner = document.createElement('div');
        $footer_inner.classList.add(`${this.config.clsname.footer}-inner`);
        $footer.appendChild($footer_inner);
        $footer.classList.add(this.config.clsname.footer);

        /**
         * 
         * @param {Array<TableColumn>} columns 
         * @param {String} table_class 
         */
        var createFooterTable = (columns, table_class) => {

            let $table = this._createTable(columns, table_class);
            let $summary_row = document.createElement('tr');
            $summary_row.style.height = this.settings.footerHeight + 'px';

            columns.forEach(this_col => {

                let $ft_cell = document.createElement('td');
                $ft_cell.className = this.config.clsname.footerCell;
                $ft_cell.innerText = this.config.noValue;

                if (this_col.propName) {
                    $ft_cell.classList.add('cell-' + helper2.convertCamel2Hyphen(this_col.propName));
                }

                if (this_col.align) {
                    $ft_cell.style.textAlign = this_col.align;
                }

                if (this_col.overflowt) {

                    let is_html = this_col.isProgramCol && this_col.isHtmlContent || this_col.isTemplateCol && this_col.isHtmlTemplate;
                    $ft_cell.onmouseover = this._showCellTooltip.bind(this, is_html);
                    $ft_cell.onmouseout = this._hideCellTooltip.bind(this);
                }
                
                this_col.addFooterCellRef($ft_cell);
                $summary_row.appendChild($ft_cell);
            });

            $table.createTFoot();
            $table.tFoot.appendChild($summary_row);
            return $table;
        };

        if (this.leftColumns.length > 0) {

            /**
             * footer部分，固定左侧table
             */
            this.$footerLeftTable = createFooterTable(this.leftColumns, this.config.clsname.table.left);
            $footer_inner.appendChild(this.$footerLeftTable);
        }

        if (this.rightColumns.length > 0) {

            /**
             * footer部分，固定右侧table
             */
            this.$footerRightTable = createFooterTable(this.rightColumns, this.config.clsname.table.right);
            $footer_inner.appendChild(this.$footerRightTable);
        }

        /**
         * footer部分，中间table
         */
        this.$footerTable = createFooterTable(this.columns, this.config.clsname.table.center);
        $footer_inner.appendChild(this.$footerTable);

        this.$footerInner = $footer_inner;
        this.$footer = $footer;
        this.$component.appendChild($footer);
    }

    /**
     * 隐藏tooltip
     */
    _hideCellTooltip() {
        
        this.$tooltip.style.display = 'none';
        this.$tooltip.firstElementChild.innerText = '';
    }

    /**
     * 以tooltip形式展示单元格完整内容
     * @param {Boolean} is_html 是否以html形式呈现内容
     */
    _showCellTooltip(is_html) {

        var $cell = event.target || event.srcElement;
        var can_not_display_full = $cell.scrollWidth > $cell.offsetWidth;
        if (!can_not_display_full) {
            return;
        }

        this.$tooltip.firstElementChild.innerText = $cell.innerText;
        this.$tooltip.style.display = 'block';
        let cell_rect = $cell.getBoundingClientRect();
        let tooltip_rect = this.$tooltip.getBoundingClientRect();
        let tooltip_pos_top = cell_rect.top + cell_rect.height + 5; // Math.max(10, cell_rect.top - tooltip_rect.height - 5);
        let tooltip_pos_left = cell_rect.left; // Math.max(2, cell_rect.left - parseInt((tooltip_rect.width - cell_rect.width) / 2));

        this.$tooltip.style.top = tooltip_pos_top + 'px';
        this.$tooltip.style.left = tooltip_pos_left + 'px';
    }

    /**
     * 构建单元格tooltip
     */
    _createTooltip() {

        var $tt = document.createElement('div');
        $tt.style.display = 'none';
        $tt.classList.add('cell-tooltip');
        $tt.innerHTML = '<span class="tooltip-inner"></span>';

        this.$tooltip = $tt;
        this.$component.appendChild($tt);
    }

    /**
     * 响应行选择事件，设置行选中效果，并执行用户约定的自定义处理程序
     * @param {TableRow} table_row 
     */
    _selectRow(table_row) {

        if (!(table_row instanceof TableRow)) {
            console.error('param [table_row] is not an instance of TableRow', table_row);
            return;
        }

        table_row.activate();
        if (this.states.selectedRow && this.states.selectedRow !== table_row) {
            this.states.selectedRow.inactivate();
        }

        this.states.selectedRow = table_row;

        // 检测执行用户约定的行点击事件
        if (typeof this.eventHandler.rowSelected == 'function') {
            this.eventHandler.rowSelected(table_row.rowData);
        }
    }

    /**
     * 响应行双击事件
     * @param {TableRow} table_row 
     */
    _handleRowDblClick(table_row) {

        if (!(table_row instanceof TableRow)) {
            console.error('param [table_row] is not an instance of TableRow', table_row);
            return;
        }

        if (typeof this.eventHandler.rowDbClicked == 'function') {
            this.eventHandler.rowDbClicked(table_row.rowData);
        }
    }

    /**
     * 响应行勾选|反勾选事件
     * @param {TableRow} table_row 
     * @param {Boolean} is_checked 
     * @param {Boolean} forbid_callback
     */
    _handleRowCheck(table_row, is_checked, forbid_callback) {

        if (!(table_row instanceof TableRow)) {
            console.error('param [table_row] is not an instance of TableRow', table_row);
            return;
        }

        /**
         * 处理全选效果
         */
        if (!is_checked && this.$togglingAllCheckbox.checked === true) {
            this.$togglingAllCheckbox.checked = false;
        }

        /**
         * 勾选记录加入map或者从map剔除
         */
        if (is_checked) {
            this.states.checkMap[table_row.rowKey] = true;
        }
        else {
            delete this.states.checkMap[table_row.rowKey];
        }

        /**
         * 由区块连续勾选引起，不再继续后续操作
         */
        if (forbid_callback === false) {
            return;
        }

        /**
         * 处理连续勾选或取消勾选
         */

        if (!event.shiftKey) {
            return;
        }

        var row_location = this.screenRowsMap[this.identify(table_row.rowData)];
        if (!(row_location instanceof TableRowLocation)) {
            return;
        }

        var seq = row_location.location - 1;
        while(seq >= 0) {

            let previous_row = this.screenRows[seq];
            if (!previous_row) {
                break;
            }
            previous_row.$checkbox.checked = is_checked;
            previous_row.handleRowCheckChange(false);
            seq--;
            if (previous_row === this.states.selectedRow) {
                break;
            }
        }
    }

    /**
     * 处理表格组件滚动条事件
     */
    _handleComponentScroll() {

        var horizontal_left_tables = this.hasLeftFixed ? [this.$headerLeftTable, this.$bodyLeftTable] : [];
        var horizontal_right_tables = this.hasRightFixed ? [this.$headerRightTable, this.$bodyRightTable] : [];

        if (this.showSummary) {
            horizontal_left_tables.push(this.$footerLeftTable);
            horizontal_right_tables.push(this.$footerRightTable);
        }

        var $target = event.target || event.srcElement;
        var val_left = $target.scrollLeft;
        var val_top = $target.scrollTop;
        var show_hori_scroll_effect = val_left >= 5;
        var show_vert_scroll_effect = val_top >= 5;

        if (this.fixHeader) {
            let top = val_top + 'px';
            this.$header.style.marginTop = top;
            show_vert_scroll_effect ? this.$header.classList.add(this.config.clsname.scrollMoving) : this.$header.classList.remove(this.config.clsname.scrollMoving);
        }

        if (this.showSummary) {
            let bottom = (-1 * val_top) + 'px';
            this.$footer.style.marginBottom = bottom;
        }

        if (this.hasLeftFixed) {

            let left = val_left == 0 ? 0 : (val_left + 'px');
            horizontal_left_tables.forEach($the_table => { 
                $the_table.style.marginLeft = left;
                show_hori_scroll_effect ? $the_table.classList.add(this.config.clsname.scrollMoving) : $the_table.classList.remove(this.config.clsname.scrollMoving);
            });
        }

        if (this.hasRightFixed) {

            let right = val_left == 0 ? 0 : ((-1 * val_left) + 'px');
            horizontal_right_tables.forEach($the_table => { 
                $the_table.style.marginRight = right;
                show_hori_scroll_effect ? $the_table.classList.add(this.config.clsname.scrollMoving) : $the_table.classList.remove(this.config.clsname.scrollMoving);
            });
        }
    }

    /**
     * 处理窗口尺寸的变化（仅响应宽度变化）
     */
    _handleWinSizeChange() {

        if (this._lastComponentWidth === this.$component.offsetWidth) {
            // 宽度无变化时（高度为容器自适应），不作处理
            return;
        }

        this._lastComponentWidth = this.$component.offsetWidth;
        this.fitColumnWidth();
        this.scroll2(0, 0);
    }

    /**
     * 滚动条滚动至
     * @param {Number} x 
     * @param {Number} y 
     */
    scroll2(x, y) {
        this.$component.scrollTo(x, y);
    }

    /**
     * 滚动条滚动水平方向至
     * @param {Number} x
     */
    scroll2Left(x) {
        this.$component.scrollTo(x, this.$component.scrollTop);
    }

    /**
     * 滚动条滚动垂直方向至
     * @param {Number} y
     */
    scroll2Top(y) {
        this.$component.scrollTo(this.$component.scrollLeft, y);
    }

    /**
     * 根据当前组件容器宽度 & 列尺寸配置，调整各列宽度到合适尺寸
     */
    fitColumnWidth() {

        var component_width = this.$component.offsetWidth;
        var min_total_width = this.columns.filter(x => x.isVisible()).map(x => x.minWidth).sum(x => x);

        if (min_total_width >= component_width) {

            var pairs = [];

            // 中央活动表格宽度调整
            this.columns.forEach(the_col => { the_col.isVisible() && the_col.resize(the_col.minWidth); });
            pairs.push(new Table2Width(this.$headerTable, min_total_width));
            pairs.push(new Table2Width(this.$bodyTable, min_total_width));
            this.showSummary && pairs.push(new Table2Width(this.$footerTable, min_total_width));

            // 左固定表格宽度调整
            if (this.hasLeftFixed) {

                this.leftColumns.forEach(the_col => { the_col.isVisible() && the_col.resize(the_col.minWidth); });
                let total_left_width = this.leftColumns.filter(x => x.isVisible()).map(x => x.minWidth).sum(x => x);

                pairs.push(new Table2Width(this.$headerLeftTable, total_left_width));
                pairs.push(new Table2Width(this.$bodyLeftTable, total_left_width));
                this.showSummary && pairs.push(new Table2Width(this.$footerLeftTable, total_left_width));
            }

            // 右固定表格宽度调整
            if (this.hasRightFixed) {

                this.rightColumns.forEach(the_col => { the_col.isVisible() && the_col.resize(the_col.minWidth); });
                let total_right_width = this.rightColumns.filter(x => x.isVisible()).map(x => x.minWidth).sum(x => x);

                pairs.push(new Table2Width(this.$headerRightTable, total_right_width));
                pairs.push(new Table2Width(this.$bodyRightTable, total_right_width));
                this.showSummary && pairs.push(new Table2Width(this.$footerRightTable, total_right_width));
            }

            this._setProperTableWidth(pairs);
        }
        else {

            let exceeding = component_width - min_total_width;
            let has_any_change = false;

            // 中央活动表格宽度调整
            this.columns.forEach(the_col => {

                if (!the_col.isVisible()) {
                    return;
                }

                let new_width = the_col.minWidth + the_col.weight * exceeding;
                if (new_width == the_col.width) {
                    return;
                }
                else if (new_width < the_col.minWidth) {
                    console.error(`something will never happen happens > try to set width/${new_width} for column with min with/${the_col.minWidth}`, the_col);
                    return;
                }

                the_col.resize(new_width);
                has_any_change = true;
            });

            if (has_any_change) {

                let pairs = [];
                let full_percent = '100%';

                pairs.push(new Table2Width(this.$headerTable, full_percent));
                pairs.push(new Table2Width(this.$bodyTable, full_percent));
                this.showSummary && pairs.push(new Table2Width(this.$footerTable, full_percent));

                // 左固定表格宽度调整
                if (this.hasLeftFixed) {

                    let total_left_width = 0;

                    // 将左固定列的宽度，同步为映射的空白列宽度
                    this.leftColumns.forEach((the_col, the_col_idx) => {

                        let mapped_col_width = this.columns[the_col_idx].width;
                        the_col.resize(mapped_col_width);
                        total_left_width += mapped_col_width;
                    });

                    pairs.push(new Table2Width(this.$headerLeftTable, total_left_width));
                    pairs.push(new Table2Width(this.$bodyLeftTable, total_left_width));
                    this.showSummary && pairs.push(new Table2Width(this.$footerLeftTable, total_left_width));
                }

                // 右固定表格宽度调整
                if (this.hasRightFixed) {

                    let total_col_count = this.columns.length;
                    let right_col_count = this.rightColumns.length;
                    let total_right_width = 0;

                    // 将右固定列的宽度，同步为映射的空白列宽度
                    this.rightColumns.forEach((the_col, the_col_idx) => {

                        let mapped_col_width = this.columns[total_col_count - right_col_count + the_col_idx].width;
                        the_col.resize(mapped_col_width);
                        total_right_width += mapped_col_width;
                    });

                    pairs.push(new Table2Width(this.$headerRightTable, total_right_width));
                    pairs.push(new Table2Width(this.$bodyRightTable, total_right_width));
                    this.showSummary && pairs.push(new Table2Width(this.$footerRightTable, total_right_width));
                }

                this._setProperTableWidth(pairs);
            }
        }
    }

    /**
     * 计算所有列占据的初始化总宽度
     */
    _calculateAllColumnWidth() {
        return this.columns.map(x => x.width).sum(x => x);
    }

    /**
     * 计算所有列占据的最小宽度总和
     */
    _calculateAllColumnMinWidth() {
        return this.columns.map(x => x.minWidth).sum(x => x);
    }

    /**
     * 设置表格宽度
     * @param {Array<Table2Width>} $pairs 
     */
    _setProperTableWidth($pairs) {

        $pairs.forEach(item => {
            item.$table.style.width = typeof item.width == 'number' ? (item.width + 'px') : item.width;
        });

        // this.$headerTable.style.width = total_width;
        // this.$bodyTable.style.width = total_width;
        // if (this.showSummary) {
        //     this.$footerTable.style.width = total_width;
        // }
    }

    /**
     * 响应数据列排序事件
     * @param {TableColumn} source_col 
     * @param {String} given_direction 指定的排序方向（optional，仅在初始构建时，使用用户指定的排序方向）
     */
    _handleColumnSorting(source_col, given_direction) {

        var dmap = this.config.direction;
        var last_column = this.sorting.column;
        var last_direction = this.sorting.direction;
        var sorting_icons_selector = '.sorting-icons';

        /**
         * 预先取消上一排序列，的排序效果（如果前后两次排序的列产生变化）
         */

        if (last_column && source_col !== last_column) {
            last_column.$headerCell.querySelector(sorting_icons_selector).removeAttribute(dmap.sortingAttrName);
        }

        // 当前指定排序的列，为上一次的排序列（之前已经存在，人工引起的排序列！！！！！），未产生列变更，仅排序方向发生倒排
        var column_no_change = source_col === last_column;
        var descending_by_default = !column_no_change;
        var new_direction;

        if (given_direction) {
            new_direction = given_direction;
        }
        else if (descending_by_default || last_direction == dmap.ascending) {
            new_direction = dmap.descending;
        }
        else {            
            new_direction = dmap.ascending;
        }

        if (new_direction == dmap.descending) {
            source_col.$headerCell.querySelector(sorting_icons_selector).setAttribute(dmap.sortingAttrName, dmap.descendingClass);
        }
        else {
            source_col.$headerCell.querySelector(sorting_icons_selector).setAttribute(dmap.sortingAttrName, dmap.ascendingClass);
        }

        // 更新到最新的排序方向
        this.sorting.direction = new_direction;
        // 变更指向当前处于排序状态的列
        this.sorting.column = source_col;

        if (!this.isServerPaging) {

            this._sortAll(column_no_change);
            this._renderScreenRows();
        }
        else {

            let table_filter = {

                sorting: { 
                    property: this.sorting.column.propName, 
                    direction: this.sorting.direction 
                }
            };

            let records = this._serverDataRequester(table_filter);
            this.refill(records);
        }
    }

    /**
     * 勾选所有行
     */
    checkAll() {

        this.$togglingAllCheckbox.checked = true;
        this._toggleCheckAll();
    }

    /**
     * 取消所有行的勾选
     */
    uncheckAll() {

        this.$togglingAllCheckbox.checked = false;
        this._toggleCheckAll();
    }


    _toggleCheckAll() {

        let thisObj = this;

        function clearChecks() {

            // 清除勾选map
            helper2.clearHash(thisObj.states.checkMap);
            // 从全记录里删除记录上的已勾选标识
            thisObj.allRows.forEach(rd => { 
                rd.dataSuit.setAsChecked(false); 
                rd.toggleRowCheckEffect();
            });
            // 将当前屏的记录已勾选状态取消
            thisObj.screenRows.forEach(rd => { rd.$checkbox.checked = false; });
        }
        
        if (this.$togglingAllCheckbox.checked) {

            clearChecks();
            
            // 将所有记录标识为已勾选
            this.screenRows.forEach(rd => {

                rd.dataSuit.setAsChecked(true);
                rd.toggleRowCheckEffect();
                this.states.checkMap[rd.rowKey] = true;
            });

            // 将当前屏的记录全部勾选
            this.screenRows.forEach(rd => { rd.$checkbox.checked = true; });
        }
        else {
            clearChecks();
        }

        if (this.eventHandler.allRowsChecked == 'function') {
            this.eventHandler.allRowsChecked(event.target.checked);
        }
    }

    /**
     * 判定一条数据是否可以被当前的关键字匹配到
     * @param {Object} row_data 
     */
    _matchKeywords(row_data) {

        if (typeof this.keywords != 'string' || this.keywords.length == 0) {
            return true;
        }
        
        var lower_kw = this.keywords.toLowerCase();
        for (let property_name in row_data) {

            let can_match = this.allowGeneralSearching || this.searchablePropMap[property_name];
            if (!can_match) {
                continue;
            }

            let prop_val = row_data[property_name];
            
            if (typeof prop_val == 'string' && (prop_val.indexOf(this.keywords) >= 0 || prop_val.toLowerCase().indexOf(lower_kw) >= 0) 
                || typeof prop_val == 'number' && prop_val.toString().indexOf(this.keywords) >= 0) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 从左中右列集合提取可参与搜索的数据字段，并构建为字段名称map
     */
    _extractSearchableColumns() {
        
        var dict = {};
        this.leftColumns.forEach(col => { col.searchable ? dict[col.propName] = true : null; });
        this.columns.forEach(col => { col.searchable ? dict[col.propName] = true : null; });
        this.rightColumns.forEach(col => { col.searchable ? dict[col.propName] = true : null; });
        return dict;
    }

    /**
     * 标准化用户组件，包括构建不标准DOM结构
     */
    _standarizeComponent($user_ctr) {

        if (!($user_ctr instanceof HTMLElement)) {
            console.log('this will never happen, user component is already checked at beginning');
            return;
        }
        
        if ($user_ctr.tagName == 'TABLE') {

            let $table_container = document.createElement('div');
            let $parent_ele = $user_ctr.parentElement;
            $parent_ele.insertBefore($table_container, $user_ctr);
            $table_container.appendChild($user_ctr);
            return $table_container;
        }
        else {

            let child_count = $user_ctr.childElementCount;
            let $first_child = $user_ctr.firstElementChild;
            if (child_count != 1 || $first_child === null || $first_child.tagName != 'TABLE') {
                throw new Error('user component does not contain (only) a table');
            }
            return $user_ctr;
        }
    }

    /**
     * 编译初始排序规则
     */
    _compileCustomSorting(sorting_option) {

        var direction_map = this.config.direction;
        var prop = sorting_option.prop;
        var direction = sorting_option.direction;
        var rule = {

            column: new TableColumn(null, null, -1),
            /**
             * 排序字段名称（该字段不一定出现在，可见 & 可排序，字段列表里）
             */
            prop: prop,
            direction: null,
        };

        if (typeof prop == 'string') {
            
            rule.column = this.allColumns.find(x => { return x.isDataCol && x.sortable && (x.propName == prop || x.headerText == prop); });
            rule.direction = (direction == direction_map.ascending || direction == direction_map.ascending.toLowerCase())
                            ? direction_map.ascending
                            : direction_map.descending;
        }
        else {
            rule.column = undefined;
        }

        return rule;
    }

    /**
     * 从用户组件构造表格信息
     */
    _compileColumns() {

        var $table = this.$component.firstElementChild;
        if (!($table instanceof HTMLTableElement)) {
            throw new Error('table definition is not presented by a table');
        }

        var $tbody = $table.tBodies[0];
        var $col_defs = $tbody.rows[0].cells;
        if ($col_defs.length == 0) {
            throw new Error('a table must contain at least 1 column');
        }

        var useless_table_column = new TableColumn(null, null, -1);
        // 左固定 & 中间 & 右固定列
        var left_columns = [useless_table_column];
        var center_columns = [useless_table_column];
        var right_columns = [useless_table_column];

        // 数组分配一个无用的列，用作VSCODE代码提示用途，清除无效数据
        left_columns.pop();
        center_columns.pop();
        right_columns.pop();

        try {
            var col_count = $col_defs.length;
            var index_col_info = { defined: false, fixed: null, tcol: useless_table_column };
            var check_cols_info = { defined: false, fixed: null, tcol: useless_table_column };

            for (let idx = 0; idx < col_count; idx++) {

                let $the_col = $col_defs[idx];
                let prop_col_type = extractDomAttr($the_col, 'type');
                let is_index_col = prop_col_type == this.config.colType.index;
                let is_check_col = prop_col_type == this.config.colType.check;
                let prop_fixed = extractDomAttr($the_col, 'fixed');
                let new_col;

                if (is_index_col) {

                    // 序号列最多仅一列
                    if (index_col_info.defined) {
                        continue;
                    }

                    new_col = new TableColumn(this.config.tableAreaName.left, this._contextObj, -1);
                    index_col_info.defined = true;
                    index_col_info.fixed = prop_fixed;
                    index_col_info.tcol = new_col;
                }
                else if (is_check_col) {

                    // 选择列最多仅一列
                    if (check_cols_info.defined) {
                        continue;
                    }

                    new_col = new TableColumn(this.config.tableAreaName.left, this._contextObj, -1);
                    check_cols_info.defined = true;
                    check_cols_info.fixed = prop_fixed;
                    check_cols_info.tcol = new_col;
                }
                else if (prop_fixed === this.config.tableAreaName.left || treateAsTrue(prop_fixed)) {

                    new_col = new TableColumn(this.config.tableAreaName.left, this._contextObj, -1);
                    left_columns.push(new_col);
                }
                else if (prop_fixed === this.config.tableAreaName.right) {

                    new_col = new TableColumn(this.config.tableAreaName.right, this._contextObj, -1);
                    right_columns.push(new_col);
                }
                else {
                    // 最后剩下默认为中间可活动列
                    new_col = new TableColumn(this.config.tableAreaName.center, this._contextObj, -1);
                    center_columns.push(new_col);
                }

                // 获取列定义信息，编译为列属性
                new_col.compile($the_col, this);
            }

            if (index_col_info.defined) {

                /**
                 * 决定序号列添加位置
                 */

                if (index_col_info.fixed === this.config.tableAreaName.left || treateAsTrue(index_col_info.fixed)) {
                    left_columns.unshift(index_col_info.tcol);
                }
                else {
                    center_columns.unshift(index_col_info.tcol);
                }
            }

            if (check_cols_info.defined) {
                
                /**
                 * 决定选择列添加位置
                 */

                if (check_cols_info.fixed === this.config.tableAreaName.left || treateAsTrue(check_cols_info.fixed)) {
                    left_columns.unshift(check_cols_info.tcol);
                }
                else {
                    center_columns.unshift(check_cols_info.tcol);
                }
            }

            /**
             * 为中间活动列表添加左右的占位列
             * @param {Array<TableColumn>} columns
             */
            var addEmptyCol = (columns, is_left) => {
                columns.forEach(the_col => {
                    let empty_col = new TableColumn(this.config.tableAreaName.center, null, -1);
                    empty_col.compile2Empty(the_col);
                    is_left ? center_columns.unshift(empty_col) : center_columns.push(empty_col);
                });
            };

            /**
             * 对中间活动列表，分别添加固定左右侧的占位列
             */

            if (left_columns.length > 0) {
                addEmptyCol(left_columns, true);
            }

            if (right_columns.length > 0) {
                addEmptyCol(right_columns, false);
            }

            // 对左中右三种列进行重新编号
            left_columns.forEach((col, col_idx) => { col.columnIdx = col_idx + 1; });
            center_columns.forEach((col, col_idx) => { col.columnIdx = col_idx + 1; });
            right_columns.forEach((col, col_idx) => { col.columnIdx = col_idx + 1; });
        }
        catch(ex) {
            throw ex;
        }

        return { left: left_columns, center: center_columns, right: right_columns };
    }

    /**
     * 表格当前高度（包含标题、汇总栏在内）
     */
    get height() {
        return this.$component.clientHeight;
    }

    /**
     * 总记录数
     */
    get rowCount() {
        return this.allRows.length;
    }

    /**
     * 过滤数据，总记录数
     */
    get filteredRowCount() {
        return this.filteredRows.length;
    }

    /**
     * 全局范围内，是否有数据行被勾选
     */
    get hasAnyRowsChecked() {

        for (let row_key in this.states.checkMap) {
            return true;
        }

        return false;
    }

    /**
     * 全局范围内，被勾选的行数
     */
    get checkedRowCount() {

        var counter = 0;
        for (let row_key in this.states.checkMap) {
            counter++;
        }

        return counter;
    }

    /**
     * 总页数
     */
    get pageCount() {
        return parseInt(this.filteredRows.length / this.pageSize) + (this.filteredRows.length % this.pageSize == 0 ? 0 : 1);
    }

    /**
     * 包含左中右，所有类型列，顺序为左--中--右
     */
    get allColumns() {

        if (this._all_columns === undefined) {
            this._all_columns = this.leftColumns.concat(this.columns).concat(this.rightColumns);
        }
        return this._all_columns;
    }

    /**
     * 当前屏数据，选中的数据行
     */
    get selectedRow() {
        return this.states.selectedRow instanceof TableRow ? this.states.selectedRow.rowData : null;
    }

    /**
     * 当前采用的排序方式--表达式
     */
    get sortingExpress() {
        return this.sorting.column && typeof this.sorting.column.propName == 'string' ? `${this.sorting.column.propName} ${this.sorting.direction}` : null;
    }

    get isServerPaging() {
        return typeof this._serverDataRequester == 'function';
    }

    /**
     * 
     * @param {HtmlElement} $user_component 用来创建表格组件的dom节点
     * @param {Function} record_identifier 数据行 row key 生成函数（参数：行数据，返回：唯一能够标识该行的信息 -- 如id等，或组合组件）
     * @param {Object} context_obj 非常重要，表格组件所有事件处理函数，将落实在该对象上
     * @param options 辅助选项
     */
    constructor($user_component, record_identifier, context_obj, options = TableOption) {
        
        if (!($user_component instanceof HTMLElement) || ($user_component.tagName != 'TABLE' && $user_component.tagName != 'DIV')) {
            throw new Error('user component is neither a TABLE nor a DIV');
        }
        else if (typeof record_identifier != 'function') {
            throw new Error('record identifier is not a function');
        }

        /**
         * 上下文对象（非常重要，所有指定的事件处理方法，计算方法等全部资源需要在该对象上找到）
         */
        this._contextObj = context_obj || {};
        /**
         * 数据主键生成方法（输入：数据，输出：该数据唯一标识）
         */
        this.identify = record_identifier;

        this.config = {

            defaults: { pageSize: 30, headerHeight: 24, rowHeight: 24, footerHeight: 24 },
            direction: { sortingAttrName: 'lay-sort', ascending: 'ASC', ascendingClass: 'asc', descending: 'DESC', descendingClass: 'desc' },
            clsname: {
                component: 'joyin-table',
                header: 'joyin-table-header',
                headerFixed: 'fixed-header',
                headerCell: 'header-cell',
                body: 'joyin-table-body',
                bodyCell: 'body-cell',
                footer: 'joyin-table-footer',
                footerCell: 'footer-cell',
                table: { left: 'table-fixed-left', center: 'table-center', right: 'table-fixed-right' },
                sortableCol: 'sortable-column',
                selectedRow: 'selected-row',
                checkedRow: 'checked-row',
                hoverRow: 'hover-row',
                scrollMoving: 'scroll-moving',
            },
            noValue: '---',
            indexCol: 'column-index',
            checkCol: 'column-check',
            tableAreaName: {
                left: 'left',
                center: 'center',
                right: 'right',
            },
            colType: {
                index: 'index',
                check: 'check',
                template: 'template',
                program: 'program',
            },
        };

        var cfg_default = this.config.defaults;
        this.settings = {

            pageSize: options.pageSize >= 1 ? parseInt(options.pageSize) : cfg_default.pageSize,
            headerHeight: options.headerHeight >= 5 ? parseInt(options.headerHeight) : cfg_default.headerHeight,
            rowHeight: options.rowHeight >= 5 ? parseInt(options.rowHeight) : cfg_default.rowHeight,
            footerHeight: options.footerHeight >= 5 ? parseInt(options.footerHeight) : cfg_default.footerHeight,
        };

        /**
         * 行元素提供管理器
         */
        this.rowProvider = new RowProvider(30);

        /**
         * table组件dom根节点
         */
        this.$component = this._standarizeComponent($user_component);
        this.$component.classList.add('joyin-table');
        this.$component.classList.add('s-scroll-bar');

        /**
         * 提取用户列配置（左中右三个列集合）
         */
        var compile_result = this._compileColumns();

        /**
         * 固定在左侧的所有列
         */
        this.leftColumns = compile_result.left;
        /**
         * 是否包含左固定列
         */
        this.hasLeftFixed = this.leftColumns.length > 0;

        /**
         * 固定在左侧，需要参与汇总的列序号（记录的列序号，基于0为基准索引）
         */
        this.leftSumColIdxes = this.leftColumns.filter(x => x.summarizable).map(x => x.columnIdx - 1);

        /**
         * 中间所有列
         */
        this.columns = compile_result.center;

        /**
         * 中间部分，需要参与汇总的列序号（记录的列序号，基于0为基准索引）
         */
        this.sumColIdxes = this.columns.filter(x => x.summarizable).map(x => x.columnIdx - 1);

        /**
         * 固定在右侧的所有列
         */
        this.rightColumns = compile_result.right;
        /**
         * 是否包含右固定列
         */
        this.hasRightFixed = this.rightColumns.length > 0;

        /**
         * 固定在右侧，需要参与汇总的列序号（记录的列序号，基于0为基准索引）
         */
        this.rightSumColIdxes = this.rightColumns.filter(x => x.summarizable).map(x => x.columnIdx - 1);
        
        /**
         * 是否需要展示（列表底边）汇总行
         */
        this.showSummary = this.leftSumColIdxes.length > 0 || this.sumColIdxes.length > 0 || this.rightSumColIdxes.length > 0;
        if (this.showSummary && typeof options.summarize == 'function') {
            /**
             * 用户自定义列汇总方法
             */
            this.summarize = options.summarize;
        }

        /**
         * 是否包含选择列
         */
        this.containCheckCol = this.allColumns.findIndex(x => x.isCheckCol) >= 0;
        if (this.containCheckCol) {

            /**
             * 选择列位于左中右哪个区域
             */
            this.checkColBelong2Area = this.leftColumns.length > 0 && this.leftColumns.findIndex(x => x.isCheckCol) >= 0
                                ? this.config.tableAreaName.left : this.rightColumns.length > 0 && this.rightColumns.findIndex(x => x.isCheckCol) >= 0
                                ? this.config.tableAreaName.right : this.config.tableAreaName.center;
        }

        /**
         * 是否包含序号列
         */
        this.containIndexCol = this.allColumns.findIndex(x => x.isIndexCol) >= 0;
        if (this.containIndexCol) {

            const area = this.config.tableAreaName;
            let of_left_idx = this.leftColumns.findIndex(x => x.isIndexCol);
            let of_center_idx = this.columns.findIndex(x => x.isIndexCol);
            let of_right_idx = this.rightColumns.findIndex(x => x.isIndexCol);

            /**
             * 序号列位于左中右哪个区域
             */
            this.indexColBelong2Area = of_left_idx >= 0 ? area.left :
                                       of_center_idx >= 0 ? area.center : area.right;

            /**
             * 序号列位于左中右哪个区域，的具体区域内，列序号
             */
            this.indexColBelong2Index = of_left_idx >= 0 ? of_left_idx : 
                                            of_center_idx >= 0 ? of_center_idx : of_right_idx;
        }

        // 移除原有所有DOM结构
        var first_child = this.$component.firstChild;
        while (first_child) {

            if (typeof first_child.remove == 'function') {
                first_child.remove();
            }
            else if (first_child.parentNode) {
                first_child.parentNode.removeChild(first_child);
            }

            first_child = this.$component.firstChild;
        }

        /**
         * 是否允许跨所有（可见）字段搜索 - 当出现1个和以上显式指定的可搜索列，则不可泛搜索
         */
        this.allowGeneralSearching = this.leftColumns.findIndex(col => col.searchable) < 0
                                        && this.columns.findIndex(col => col.searchable) < 0
                                        && this.rightColumns.findIndex(col => col.searchable) < 0
                                        && (!(options.searchables instanceof Array) || options.searchables.length == 0);

        if (!this.allowGeneralSearching) {

            /**
             * 不允许泛搜索情况下，允许参与搜索的列名称（map）
             */
            this.searchablePropMap = this._extractSearchableColumns();

            if (options.searchables instanceof Array && options.searchables.length > 0) {
                options.searchables.forEach(pname => {
                    if (typeof pname == 'string' && pname.trim().length > 0) {
                        this.searchablePropMap[pname.trim()] = true;
                    }
                });
            }
        }

        this.setPageSize(options.pageSize, false);
        this.setPageIndex(1, false);
        this.setKeywords(null, false);

        /**
         * 当前排序规则
         */
        this.sorting = { column: new TableColumn(null, null, -1), direction: null };
        this.sorting.column = null;
        /**
         * 初始化时，用户指定的排序规则
         */
        this.customSorting = this._compileCustomSorting(options.defaultSorting || {});

        // 服务器分页
        if (typeof options.serverDataRequester == 'function') {

            /**
             * 服务器端分页数据请求方法（在数据列触发排序时使用）
             */
            this._serverDataRequester = options.serverDataRequester;
        }

        /**
         * 是否对缺省值单元格填充内容占位符
         */
        this.showNoValePlaeholder = options.showNoValePlaeholder !== false;

        /**
         * table ui 有关的状态
         */
        this.states = {
            /**
             * 当前处于选中（效果）的行
             */
            selectedRow: useless_table_row,

            /**
             * 勾选的数据行row key字典
             */
            checkMap: {},
        };
        // 重置
        this.states.selectedRow = null;

        /**
         * 构造器
         */
        this.makers = {

            // 行自定义
            rowClassMaker: typeof options.rowClassMaker == 'function' ? options.rowClassMaker : null,
        };

        /**
         * table 主要的事件处理方法
         */
        this.eventHandler = {

            // 行被选中
            rowSelected: typeof options.rowSelected == 'function' ? options.rowSelected : null,
            // 所有行被勾选（或取消勾选）
            allRowsChecked: typeof options.allRowsChecked == 'function' ? options.allRowsChecked : null,
            // 行被勾选（或取消勾选）
            rowChecked: typeof options.rowChecked == 'function' ? options.rowChecked : null,
            // 行双击事件
            rowDbClicked: typeof options.rowDbClicked == 'function' ? options.rowDbClicked : null,
            // 表格数据重新填充完成
            refilled: typeof options.refilled == 'function' ? options.refilled : null,
            // 数据筛选完成
            recordsFiltered: typeof options.recordsFiltered == 'function' ? options.recordsFiltered : null,
            // 翻页、改变分页大小完成
            pageTurned: typeof options.pageTurned == 'function' ? options.pageTurned : null,
            // 列发生排序
            columnSorted: typeof options.columnSorted == 'function' ? options.columnSorted : null,
        };
        
        this.fixHeader = options.fixHeader !== true;
        this.tableId = 'joyin-table-' + helper2.makeToken();
        this.tableName = options.tableName;
        this.setDisplayName(options.displayName);

        /**
         * 正则表达式字典
         */
        this.regexMap = {};
        /**
         * 记录在该table上的用户数据
         */
        this.tag = options.tag;

        this._createHeader();
        if (this.fixHeader) {
            this.$component.style.paddingTop = this.settings.headerHeight + 'px';
        }
        this._createBody();

        if (this.showSummary) {
            this._createFooter();
            this.$bodyInner.style.paddingBottom = this.settings.footerHeight + 'px';
        }

        /**
         * 是否有任何列支持，支持内容溢出显示 tooltip
         */
        this.tooltipEnabled = this.columns.findIndex(x => x.overflowt) >= 0 
                                || this.leftColumns.findIndex(x => x.overflowt) 
                                    || this.rightColumns.findIndex(x => x.overflowt);

        if (this.tooltipEnabled) {
            this._createTooltip();
        }

        /**
         * 监听滚动条事件，实时动态调整上下左右各个table的位置
         */
        if (this.fixHeader || this.hasLeftFixed || this.hasRightFixed || this.showSummary) {
            this.$component.addEventListener('scroll', this._handleComponentScroll.bind(this));
        }

        /**
         * 在未禁止动态调整列宽功能的前提下，监听窗口resize事件，实现列宽的动态调整
         */
        if (options.dynamicColumnWidth !== false) {
            window.addEventListener('resize', this._handleWinSizeChange.bind(this));
        }

        /**
         * 1. 无论是否需要动态调整列宽，都需要计算所有列初始化时的标准总宽度
         * 2. 初始化时的表格总宽度，依赖于所有列的标准宽度之和
         */
        this.totalStandardColWidth = this._calculateAllColumnWidth();
        this.leftColumns.forEach(the_col => { the_col.setWeight(this.totalStandardColWidth); });
        this.columns.forEach(the_col => { the_col.setWeight(this.totalStandardColWidth); });
        this.rightColumns.forEach(the_col => { the_col.setWeight(this.totalStandardColWidth); });

        /**
         * 所有列必须保持的最小宽度之和
         */
        this.totalMinColWidth = this._calculateAllColumnMinWidth();

        /**
         * 创建时，调用一次组件尺寸变化处理程序，调整表格初始化的宽度
         */
        setTimeout(() => { this.fitColumnWidth(); }, 300);

        /**
         * 设置表格最大高度
         */
        this.setMaxHeight(options.maxHeight);

        var useless_table_row = new TableRow(this, {}, 0);
        /**
         * 数据行全集（已经处于有序状态 --- 非常重要!!! 筛选集 & 当前屏渲染集，将视整体集合为最新有序集合）
         */
        this.allRows = [useless_table_row];
        this.allRows.pop();
        /**
         * key: row key / value: TableRow instance
         */
        this.allRowsMap = {};

        /**
         * 过滤数据集，分2种情况
         * > 1. [keywords] 未指定, 等同全集列表
         * > 2. [keywords] 指定, 通过keywords搜索匹配到的数据子集
         * > 3. [custom-filter]自定义的方式，匹配到的结果
         */
        this.filteredRows = [useless_table_row];
        this.filteredRows.pop();
        /**
         * key: row key / value: TableRowLocation
         */
        this.filteredRowsMap = {};

        /**
         * 匹配到的数据，在当前分页、页码状态下，当前屏幕区域显示的数据集
         */
        this.screenRows = [useless_table_row];
        this.screenRows.pop();
        /**
         * key: row key / value: TableRowLocation
         */
        this.screenRowsMap = {};
        /**
         * 当前屏幕显示的数据集，第一条位于过滤数据集的位置
         */
        this.screenStartInFilter = -1;
        /**
         * 当前屏幕显示的数据集，最后一条位于过滤数据集的位置
         */
        this.screenEndInFilter = -1;
        
        /**
         * 按用户指定的初始排序规则，进行初始化排序
         */
        if (this.customSorting.column && !this.isServerPaging) {
            this._handleColumnSorting(this.customSorting.column, this.customSorting.direction);
        }
    }

    /**
     * 设置表格用于显示性质、导出性质的名称
     * @param {String} display_name 
     */
    setDisplayName(display_name) {
        this.displayTableName = display_name;
    }

    /**
     * 通过主键查找行
     * @param {*} row_key 
     */
    _getRow(row_key) {

        var matched = this.allRowsMap[row_key];
        return matched instanceof TableRow ? matched : undefined;
    }

    /**
     * 通过主键查找行数据
     * @param {*} row_key 
     */
    getRowData(row_key) {

        var matched = this.allRowsMap[row_key];
        return matched instanceof TableRow ? matched.rowData : undefined;
    }

    /**
     * 是否存在某行数据
     * @param {*} row_key 
     */
    hasRow(row_key) {

        var expected_row = this._getRow(row_key);
        return !!expected_row;
    }

    /**
     * 是否某行被选中
     * @param {*} row_key 
     */
    isRowSelected(row_key) {

        var expected_row = this._getRow(row_key);
        return !expected_row ? false : expected_row === this.selectedRow;
    }

    /**
     * 是否某行数据被勾选
     * @param {*} row_key 
     */
    isRowChecked(row_key) {

        var expected_row = this._getRow(row_key);
        return !expected_row ? false : expected_row.isChecked;
    }

    /**
     * 勾选|不勾选，某行数据
     * @param {*} row_key 
     * @param {Boolean} as_checked 是否选中（缺失时，视为选中）
     */
    checkRow(row_key, as_checked = true) {

        var expected_row = this._getRow(row_key);
        if (expected_row) {
            expected_row.check(as_checked);
        }
    }

    /**
     * @param {String} prop_name 
     * @returns {RegExp}
     */
    _createRegex(prop_name) {
        return this.regexMap[prop_name] || (this.regexMap[prop_name] = new RegExp('\\$\\s*'+ prop_name +'\\s*\\$', 'g'));
    }

    /**
     * 按照多种格式化要求，进行单数据绑定单元格的内容格式化
     * @param {*} cell_value 
     * @param {TableColumn} column 
     * @param {Boolean} is_for_export 
     */
    _generateSingleValueContent(cell_value, column, is_for_export) {
        
        if (cell_value === null || cell_value === undefined) {
            return this.showNoValePlaeholder ? this.config.noValue : '';
        }
        else if (typeof cell_value == 'string') {
            return cell_value.trim();
        }
        else if (typeof cell_value == 'number') {

            let data_opt = column.dataCellOption;
            let is_precision_defined = data_opt.precision != null;
            let revised_precison = is_precision_defined ? data_opt.precision : 2;

            if (is_for_export === true) {

                if (data_opt.percentage) {
                    return (data_opt.by100 ? 100 * cell_value : cell_value).toFixed(revised_precison) + '%';
                }
                else if (data_opt.thousandsInteger) {
                    return parseInt(cell_value);
                }
                else {
                    return !is_precision_defined ? cell_value : +cell_value.toFixed(revised_precison);
                }
            }
            else {

                if (data_opt.percentage) {
                    return (data_opt.by100 ? 100 * cell_value : cell_value).toFixed(revised_precison) + '%';
                }
                else if (data_opt.thousandsInteger) {
                    return thousands(cell_value, true);
                }
                else if (data_opt.thousands) {
                    return thousands(cell_value, false, revised_precison);
                }
                else {
                    return !is_precision_defined ? cell_value : +cell_value.toFixed(revised_precison);
                }
            }
        }
        else {
            return cell_value.toString();
        }
    }



    /*
     * 以下方法处理典型的频繁用户事件：
     * 1. 分页大小调整
     * 2. 分页跳转
     * 3. 关键字筛选
     */



    /**
     * 设置分页大小
     * @param {Number} size 分页大小 >= 1
     * @param {Boolean} instant_draw 是否立即触发UI变化（默认为true，立即触发UI渲染）
     */
    setPageSize(size, instant_draw = true) {

        this.pageSize = typeof size == 'number' && size >= 1 ? parseInt(size) : 20;
        if (instant_draw === true) {
            this._resetScreenRows();
            this._renderScreenRows();
        }
    }

    /**
     * 设置跳转到的页码
     * @param {Number} index 跳到第几页 >= 1，第一页为1
     * @param {Boolean} instant_draw 是否立即触发UI变化（默认为true，立即触发UI渲染）
     */
    setPageIndex(index, instant_draw = true) {

        this.pageIndex = typeof index == 'number' && index >= 1 ? parseInt(index) : 1;
        if (instant_draw === true) {
            this._resetScreenRows();
            this._renderScreenRows();
        }
    }

    /**
     * 设置过滤关键字
     * @param {String|Number} kw 搜索关键字
     * @param {Boolean} instant_draw 是否立即触发UI变化（默认为true，立即触发UI渲染）
     */
    setKeywords(kw, instant_draw = true) {

        this.keywords = (typeof kw == 'string' || typeof kw == 'number') ? kw.toString().trim() : null;
        if (instant_draw === true) {

            this._resetFilteredRows();
            this._renderScreenRows();
        }
    }

    /**
     * 摒除曾经使用过的自定义记录搜索函数
     */
    clearCustomFilter() {
        this._customFilter = undefined;
    }

    /**
     * 用户自行过滤数据
     * @param {Function} match_func 判断记录是否满足条件的执行函数，必须返回值true/false
     * @param {Boolean} nestify_keywords 是否叠加当前keywords
     */
    filterByCustom(match_func, nestify_keywords = true) {
        
        if (typeof match_func != 'function') {
            console.log('param [match_func] is not a function');
            return;
        }

        /**
         * 1. 用户自行提供的记录函数（一旦调用过该列表组件的 <filterByCustom> 方法，则持续的记录插入/更改，将会受到该筛选函数的影响）
         * 2. 如果需要摒除对原生组件数据变更的影响，则需要清除该函数的引用
         */
        this._customFilter = match_func;
        this.filteredRows.clear();
        helper2.clearHash(this.filteredRowsMap);

        var location = 0;
        this.allRows.forEach(this_row => {

            if (match_func(this_row.rowData) && (nestify_keywords !== true || this._matchKeywords(this_row.rowData))) {
                this.filteredRows.push(this_row);
                this.filteredRowsMap[this_row.rowKey] = new TableRowLocation(location, this_row);
                location += 1;
            }
        });

        this._resetScreenRows();
        this._renderScreenRows();
        this._notifyfilteredRecordsChange();
    }

    

    /*
     * 以下方法关于： 
     * 1. 操纵数据行到集合的添加、删除
     * 2. 操纵数据行到物理DOM结构的添加、删除
     */


    /**
     * 将一条新的数据行，按照现有排序规则，插入一个有序序列，并返回最多的插入位置（基于0开始）
     * @param {TableRow} new_row 
     * @param {Array<TableRow>} sorted_list table row有序集合
     */
    _insertRow2SortedList(new_row, sorted_list) {

        var before_len = sorted_list.length;
        var target_pos = -1;

        if (sorted_list.length == 0) {
            sorted_list.push(new_row);
            target_pos = 0;
        }
        else if (!this._shouldRevert(new_row, sorted_list[0])) {
            sorted_list.unshift(new_row);
            target_pos = 0;
        }
        else if (!this._shouldRevert(sorted_list[sorted_list.length - 1], new_row)) {
            sorted_list.push(new_row);
            target_pos = sorted_list.length - 1;
        }
        else {
            for (let idx = 0; idx < sorted_list.length - 1; idx++) {
                if (!this._shouldRevert(sorted_list[idx], new_row) && !this._shouldRevert(new_row, sorted_list[idx + 1])) {
                    sorted_list.splice(idx + 1, 0, new_row);
                    target_pos = idx + 1;
                    break;
                }
            }
        }

        if (sorted_list.length == before_len) {
            console.error('CALCULATION ERROR(TARGET LIST DOES NOT INSERT THE NEW ROW)!!!', new_row);
        }

        return target_pos;
    }

    /**
     * 将一条行数据，插入到指定的位置
     * @param {Number} target_pos 插入过后，位于的位置
     * @param {TableRow} target_row 
     */
    _phsicallyInsertScreenRow(target_pos, target_row) {

        if (!(target_row instanceof TableRow)) {
            throw new Error('target row is not a TableRow instance');
        }

        this.screenRows.splice(target_pos, 0, target_row);
        this.screenRowsMap[target_row.rowKey] = new TableRowLocation(target_pos, target_row);

        var scr_len = this.screenRows.length;
        // 递增位于插入行过后，所有的行位置信息
        for (let idx = target_pos + 1; idx < scr_len; idx++) {

            let row_key = this.screenRows[idx].rowKey;
            let row_location = this.screenRowsMap[row_key];
            if (row_location instanceof TableRowLocation) {
                row_location.location = row_location.location + 1;
            }
            else {
                this._snapshotUnexpectedException('screen');
            }
        }

        if (target_pos >= scr_len - 1) {
            target_row.render(undefined, scr_len);
        }
        else {
            target_row.render(this.screenRows[target_pos + 1], target_pos + 1);
            // for (let idx = target_pos + 1; idx < scr_len; idx++) {
            //     this.screenRows[idx].updateIndex(idx + 2);
            // }
        }
    }

    /**
     * 将一行从屏幕显示列表中删除
     * @param {*} row_key 
     */
    _phsicallyRemoveScreenRow(row_key) {
        
        var matched_row = this.screenRowsMap[row_key];
        if (!(matched_row instanceof TableRowLocation)) {
            this._snapshotUnexpectedException('screen');
            return;
        }

        var row_location = matched_row.location;
        this.screenRows.splice(row_location, 1);
        delete this.screenRowsMap[row_key];

        var scr_len = this.screenRows.length;
        // decrease [location] of elements after matched element in screen list
        for (let idx = row_location; idx < scr_len; idx++) {
            
            let each_row_key = this.screenRows[idx].rowKey;
            let row_location = this.screenRowsMap[each_row_key];
            if (row_location instanceof TableRowLocation) {
                row_location.location = row_location.location -1;
            }
            else {
                this._snapshotUnexpectedException('screen');
            }
        }

        matched_row.tableRow.delete();
    }

    /**
     * 判定在当前的，排序字段 + 排序方向规则下，是否应该交换2个成员的位置
     * @param {TableRow} first 
     * @param {TableRow} second 
     */
    _shouldRevert(first, second) {

        if (!(first instanceof TableRow) || !(second instanceof TableRow)) {
            return false;
        }

        var source_col = this.sorting.column;
        if (!source_col) {
            return false;
        }

        if (source_col.isCustomSorting) {
            return source_col.sortingMethod.call(this._contextObj, first.rowData, second.rowData, source_col.propName, this.sorting.direction);
        }
        else if (!source_col.propName) {
            return false;
        }
        else {

            let prop_name = source_col.propName;
            let bigger = first.rowData[prop_name] > second.rowData[prop_name];
            let smaller = first.rowData[prop_name] < second.rowData[prop_name];

            return this.sorting.direction == this.config.direction.ascending && bigger 
                || this.sorting.direction == this.config.direction.descending && smaller;
        }
    }

    /**
     * 执行全局数据排序
     */
    _execSort() {

        var records = this.allRows;
        var source_col = this.sorting.column;
        if (!source_col) {
            return;
        }

        if (source_col.isCustomSorting) {
            records.sort((a, b) => {

                let result = source_col.sortingMethod.call(this._contextObj, a.rowData, b.rowData, source_col.propName, this.sorting.direction);
                return result;
            });
        } 
        else if (!source_col.propName) {
            return;
        } 
        else {

            let prop_name = source_col.propName;
            let isAsc = this.sorting.direction == this.config.direction.ascending;

            records.sort((a, b) => {

                let first = a.rowData[prop_name];
                let second = b.rowData[prop_name];
                if (isAsc) {
                    return first == second ? 0 : first > second ? 1 : -1;
                }
                else {
                    return first == second ? 0 : first < second ? 1 : -1;
                }
            });
        }
    }

    /**
     * 检测一条记录是否在筛选结果里
     * @param {*} row_key 
     */
    _existsInfilteredRecords(row_key) {
        return this.filteredRowsMap[row_key] !== undefined;
    }

    /**
     * 检测一条记录是否在当前屏列表里
     * @param {*} row_key 
     */
    _existsInScreenRecords(row_key) {
        return this.screenRowsMap[row_key] instanceof TableRowLocation;
    }

    /**
     * 基于当前，分页大小 + 当前页码，计算屏幕数据位于过滤数据集中的开始索引
     */
    _calculateStartIndex() {
        return (this.pageIndex - 1) * this.pageSize;
    }

    /**
     * 基于当前，筛选记录数 + 分页大小 + 开始索引，计算屏幕数据位于过滤数据集中的结束索引
     * @param {Number} start_idx 
     */
    _calculateEndIndex(start_idx) {
        return Math.min(start_idx + this.pageSize - 1, this.filteredRows.length == 0 ? 0 : this.filteredRows.length - 1);
    }

    /**
     * 将未知异常打印至终端 
     * @param {String} list_type 
     */
    _snapshotUnexpectedException(list_type) {

        console.error(`impossible something happened > some [${list_type}] records lost location info`,

            this.filteredRows.map(x => x.rowData),
            this.filteredRowsMap,
            this.screenRows.map(x => x.rowData),
            this.screenRowsMap);
    }

    /**
     * 过滤数据集发生了变更
     * 传递给回调函数的参数为： (1. 总数据条数, 2. 满足过滤条件的条数)
     */
    _notifyfilteredRecordsChange() {

        if (this.isServerPaging) {
            /**
             * 采用服务器端分页的，无数据过滤环节
             */
            return;
        }
        else if (typeof this.eventHandler.recordsFiltered != 'function') {
            /**
             * 未指定过滤数据变化的处理函数
             */
            return;
        }

        try {
            this.eventHandler.recordsFiltered(this.filteredRows.length);
        }
        catch(ex) {
            console.error('execute callback<recordsFiltered> with unexpected exception', ex);
        }
    }


    /*
     * 以下方法关于： 
     * 1. 表格数据全量填充
     * 2. 增量数据insert/update
     * 3. 数据行删除
     * 4. 当前屏数据渲染
     * 5. 汇总行重置和渲染
     */



    /**
     * 清空当前数据，按照当前的排序规则，重置到第1页，重新进行填充渲染数据
     * @param {Array<Object>} records
     * @param {Boolean} instant_draw 是否重灌数据后，立即执行当前屏数据渲染（默认为true，立即触发UI渲染）
     */
    refill(records, instant_draw = true) {

        this.setKeywords(null, false);
        this.setPageIndex(1, false);

        this.allRows.clear();
        this.filteredRows.clear();
        this.screenRows.clear();

        helper2.clearHash(this.allRowsMap);
        helper2.clearHash(this.filteredRowsMap);
        helper2.clearHash(this.screenRowsMap);
        
        // 清除过期残留的行dom结构
        this.$bodyTable.tBodies[0].innerHTML = '';
        if (this.$bodyLeftTable) { this.$bodyLeftTable.tBodies[0].innerHTML = ''; }
        if (this.$bodyRightTable) { this.$bodyRightTable.tBodies[0].innerHTML = ''; }

        // 清除汇总信息（如果存在）
        if (this.showSummary) {
            this._restoreSummaryInfo();
        }

        var tableIns = this;
        function refilCallback() {

            if (typeof tableIns.eventHandler.refilled == 'function') {
                try {
                    tableIns.eventHandler.refilled(tableIns);
                }
                catch(ex) {
                    console.error(ex);
                }
            }
        }

        if (!(records instanceof Array) || records.length == 0) {
            
            this._notifyfilteredRecordsChange();
            refilCallback();
            return;
        }

        records.forEach(row_data => {

            let row_key = this.identify(row_data);
            if (helper2.isNone(row_key)) {
                console.error('refill error > row key does not exist', row_data);
                return;
            }
            let matched_row = this._getRow(row_key);
            if (matched_row) {
                console.error('refill error > row key duplicated', row_key, row_data);
                return;
            }

            let new_row = new TableRow(this, row_data, row_key);
            this.allRows.push(new_row);
            this.allRowsMap[row_key] = new_row;
        });

        this.setPageIndex(1, false);
        this._sortAll();

        /**
         * 在未显示指定不需要立即渲染的情况下，立即进行UI层面的渲染
         */
        if (instant_draw !== false) {
            this._renderScreenRows();
        }
        
        this._notifyfilteredRecordsChange();
        refilCallback();
    }

    /**
     * 清除表格数据
     */
    clearTable() {

        helper2.clearHash(this.states.checkMap);
        this.states.selectedRow = null;
        this.refill([]);
    }

    /**
     * 更新一条数据
     * @param {Object} revised_data 
     */
    updateRow(revised_data) {

        if (revised_data === null || typeof revised_data != 'object') {
            console.error('update error > provided data is not ok', revised_data);
            return;
        }

        var row_key = this.identify(revised_data);
        if (helper2.isNone(row_key)) {
            console.error('update error > row key does not exist', revised_data);
            return;
        }

        var matched_row = this._getRow(row_key);
        if (!matched_row) {
            console.error('update error > no matched row found', row_key, revised_data);
            return;
        }

        if (this.showSummary && this._existsInfilteredRecords(row_key)) {
            this._resummarize(revised_data);
        }

        if (this._existsInScreenRecords(row_key)) {
            matched_row.renderChange(revised_data);
        }
        else {
            matched_row.updateDataOnly(revised_data);
        }
    }

    /**
     * 插入一条新的数据
     * @param {Object} row_data 
     */
    insertRow(row_data) {

        var row_key = this.identify(row_data);
        let matched_row = this._getRow(row_key);
        if (matched_row) {
            console.error(`cannot insert a record with an existing key[${row_key}]`, row_data);
            return;
        }
        
        var new_row = new TableRow(this, row_data, row_key);
        var pos_in_full = this._insertRow2SortedList(new_row, this.allRows);
        this.allRowsMap[row_key] = new_row;

        /**
         * 尝试匹配：关键字 & 用户自定义筛选器
         */
        
        var hit_keywords = this._matchKeywords(new_row.rowData);
        var hit_custom_filter = typeof this._customFilter != 'function';
        if (hit_custom_filter === false) {
            try {
                hit_custom_filter = !!this._customFilter(new_row.rowData);
            }
            catch(ex) {
                console.error(ex);
            }
        }

        /**
         * 不匹配：当前的关键字 & 指定的指定筛选函数，则不会加入到筛选结果集，更不至于对当前屏幕显示的数据造成影响
         */
        if (!hit_keywords || !hit_custom_filter) {
            return;
        }

        // 新数据插入到列表当中合适位置，并返回插入位置
        var pos_in_filter = this._insertRow2SortedList(new_row, this.filteredRows);
        // 映射 row key & 位置信息
        this.filteredRowsMap[row_key] = new TableRowLocation(pos_in_filter, new_row);

        var filtered_len = this.filteredRows.length;
        // 在插入位置往后的数据行，递增其位置描述的序号字段
        for (let idx = pos_in_filter + 1; idx < filtered_len; idx++) {

            let each_row_key = this.filteredRows[idx].rowKey;
            let row_location = this.filteredRowsMap[each_row_key];
            if (row_location instanceof TableRowLocation) {
                row_location.location = row_location.location + 1;
            }
            else {
                this._snapshotUnexpectedException('filtered');
            }
        }

        // 过滤数据发生变更，通知事件监听程序
        this._notifyfilteredRecordsChange();

        if (filtered_len == 1) {

            // 当插入后，仅有一条数据，则之前无数据，一定执行插入到当前屏列表
            this._phsicallyInsertScreenRow(0, new_row);
            return;
        }

        var old_start_idx = this.screenStartInFilter;
        var old_end_idx = this.screenEndInFilter;

        if (pos_in_filter <= old_start_idx) {

            this._phsicallyInsertScreenRow(0, this.filteredRows[old_start_idx]);
            if (this.screenRows.length > this.pageSize) {
                this._phsicallyRemoveScreenRow(this.screenRows[this.screenRows.length - 1].rowKey);
            }
        }
        else if (pos_in_filter > old_start_idx && pos_in_filter <= old_end_idx + 1) {

            this._phsicallyInsertScreenRow(pos_in_filter - old_start_idx, new_row);
            if (this.screenRows.length > this.pageSize) {
                this._phsicallyRemoveScreenRow(this.screenRows[this.screenRows.length - 1].rowKey);
            }
        }
        
        this.screenStartInFilter = this._calculateStartIndex();
        this.screenEndInFilter = this._calculateEndIndex(this.screenStartInFilter);

        if (this.showSummary && this._existsInfilteredRecords(row_key)) {
            this._resummarize(row_data, true);
        }
    }

    /**
     * 1. 插入（insert）一行新数据
     * 2. 或者，更新 (update)一条已存在数据
     * @param {Object} row_data 
     */
    putRow(row_data) {

        var row_key = this.identify(row_data);
        if (helper2.isNone(row_key)) {
            console.error('put error > row data has no row key', row_data);
            return;
        }

        let matched_row = this._getRow(row_key);
        if (matched_row) {
            this.updateRow(row_data);
            return;
        }

        this.insertRow(row_data);
    }

    /**
     * 从列表删除一条数据
     * @param {*} row_key 
     */
    deleteRow(row_key) {
        
        var expected_row = this._getRow(row_key);
        if (!expected_row) {
            console.error('delete error > expected row not found', row_key);
            return;
        }

        /**
         * 删除的目标行为选中行，清除选中行标识
         */
        if (this.states.selectedRow === expected_row) {
            this.states.selectedRow = null;
        }

        // 先从全列表删除对应记录
        // todo19: 此处存在一个性能提升的空间，对相应的map建立位置索引，当涉及短时间内删除大量单条数据时，可有效提供效率
        this.allRows.remove(this_row => { return this_row === expected_row; }, true);
        delete this.allRowsMap[row_key];
        // 如果该行被勾选则避免出现数据不一致的问题
        delete this.states.checkMap[row_key];

        if (!this._existsInfilteredRecords(row_key)) {
            return;
        }

        // find matched from filter list
        var location_info = this.filteredRowsMap[row_key];
        if (!(location_info instanceof TableRowLocation)) {
            this._snapshotUnexpectedException('filtered');
            return;
        }

        var target_pos = location_info.location;
        // remove row from filter list & map
        this.filteredRows.splice(target_pos, 1);
        delete this.filteredRowsMap[row_key];

        var filtered_len = this.filteredRows.length;
        // has no elements left in filter list
        if (filtered_len == 0) {

            this.screenRows.clear();
            helper2.clearHash(this.screenRowsMap);
            // no records matching constraints, go back to page 1
            this.setPageIndex(1);
            this._notifyfilteredRecordsChange();
            expected_row.delete();
            return;
        }

        // decrease [location] of elements after matched element in filter list
        for (let idx = target_pos; idx < filtered_len; idx++) {

            let each_row_key = this.filteredRows[idx].rowKey;
            let row_location = this.filteredRowsMap[each_row_key];
            if (row_location instanceof TableRowLocation) {
                row_location.location = row_location.location - 1;
            }
            else {
                this._snapshotUnexpectedException('filtered');
            }
        }

        var old_start_idx = this.screenStartInFilter;
        var old_end_idx = this.screenEndInFilter;

        if (target_pos <= old_start_idx) {

            this._phsicallyRemoveScreenRow(this.screenRows[0].rowKey);
            if (old_end_idx <= this.filteredRows.length - 1) {
                this._phsicallyInsertScreenRow(this.screenRows.length, this.filteredRows[old_end_idx]);
            }
        }
        else if (target_pos > old_start_idx && target_pos <= old_end_idx) {

            this._phsicallyRemoveScreenRow(row_key);
            if (old_end_idx <= this.filteredRows.length - 1) {
                this._phsicallyInsertScreenRow(this.screenRows.length, this.filteredRows[old_end_idx]);
            }
        }

        // re-calculate screen start & end
        var new_start_idx = this._calculateStartIndex();
        var new_end_idx = this._calculateEndIndex(new_start_idx);

        // when total page decreases from [N] to [N-1]
        if (new_start_idx > new_end_idx) {

            this.setPageIndex(this.pageIndex - 1);
            new_start_idx = this._calculateStartIndex();
            new_end_idx = this._calculateEndIndex(new_start_idx);
        }

        this.screenStartInFilter = new_start_idx;
        this.screenEndInFilter = new_end_idx;
        this._notifyfilteredRecordsChange();
    }

    /**
     * 将已经排好序、分好页的当前页数据，渲染到table中
     */
    _renderScreenRows() {
        
        // 发生：屏幕数据重绘 & 有选中行 & 选中行在重绘后不在当前屏，重置原有的选择行
        if (this.states.selectedRow instanceof TableRow && !this._existsInScreenRecords(this.states.selectedRow.rowKey)) {

            this.states.selectedRow.inactivate();
            this.states.selectedRow = null;
        }

        // // 重置横向和纵向滚动位置
        // this.scroll2(0, 0);

        // 直接清空html结构
        this.$bodyTable.tBodies[0].innerHTML = '';
        if (this.hasLeftFixed) {
            this.$bodyLeftTable.tBodies[0].innerHTML = '';
        }
        if (this.hasRightFixed) {
            this.$bodyRightTable.tBodies[0].innerHTML = '';
        }

        // 重绘所有当前屏数据
        this.screenRows.forEach((this_row, index) => { this_row.render(undefined, index + 1); });

        if (this.showSummary) {
            this._resummarize();
        }
    }

    /**
     * 按照排序规则，重排全记录
     * @param {Boolean} revert_direction 是否进行升降序倒排即可
     */
    _sortAll(revert_direction) {

        /**
         * 1. 如果当前排序列存在（未曾人工点击过排序，则排序列尚未产生过）
         * 2. 无论是否指定为简单倒排，都将被忽略
         */
        var is_custom_sort = this.sorting.column && this.sorting.column.isCustomSorting;
        if (is_custom_sort) {

            this._execSort();
            this._resetFilteredRows();
            return;
        }

        if (revert_direction) {

            this.allRows.reverse();
            this.filteredRows.reverse();
            this._resetScreenRows();
            return;
        }

        this._execSort();
        this._resetFilteredRows();
    }

    /**
     * 重设满足过滤条件、排序规则的记录
     */
    _resetFilteredRows() {
        
        this.filteredRows.clear();
        helper2.clearHash(this.filteredRowsMap);

        var thisObj = this;
        var location = 0;
        var decider = typeof this._customFilter == 'function'
                      ? function (row_data) { return thisObj._customFilter(row_data) && thisObj._matchKeywords(row_data); }
                      : function (row_data) { return thisObj._matchKeywords(row_data); };

        this.allRows.forEach(this_row => {

            if (decider(this_row.rowData)) {

                this.filteredRows.push(this_row);
                this.filteredRowsMap[this_row.rowKey] = new TableRowLocation(location, this_row);
                location += 1;
            }
        });

        this._resetScreenRows();
        this._notifyfilteredRecordsChange();
    }

    /**
     * 截取满足，过滤条件、排序规则、分页状况、处于当前页的记录
     */
    _resetScreenRows() {

        this.screenRows.clear();
        helper2.clearHash(this.screenRowsMap);

        if (this.filteredRows.length == 0) {
            this.screenStartInFilter = -1;
            this.screenEndInFilter = -1;
            return;
        }
        
        var start_idx = this._calculateStartIndex();
        var end_idx = this._calculateEndIndex(start_idx);
        var location = 0;

        for (let idx = start_idx; idx <= end_idx; idx++) {

            let this_row = this.filteredRows[idx];
            this.screenRows.push(this_row);
            this.screenRowsMap[this_row.rowKey] = new TableRowLocation(location, this_row);
            location += 1;
        }

        this.screenStartInFilter = start_idx;
        this.screenEndInFilter = end_idx;
    }

    /**
     * 根据列配置，生成汇总栏单元格class name
     * @param {TableColumn} col 
     * @param {Number} total
     */
    _makeFooterCellClassName(col, total) {
        
        var class_names = [];
        if (col.footerClassName) {
            class_names.push(col.footerClassName);
        }
        if (col.overflowt) {
            class_names.push('s-ellipsis');
        }
        if (col.footerClassNameMaker) {
            class_names.push(col.footerClassNameMaker(total));
        }
        return class_names.length > 0 ? class_names.join(' ') : null;
    }

    /**
     * 刷新汇总数据
     * @param {数据行新的数据变更} revised_data 发生变更的数据（1. 为null则代表重算当前所有，2. 不为null则为增量计算）
     * @param {是否为新增数据} is_new 是否为新数据行，在提供了变更的数据前提下（1. 为true则累加即可，2. 为false则需要和已有数据进行匹配，计算相应的变化量）
     */
    _resummarize(revised_data, is_new) {

        if (!this.showSummary) {
            return;
        }
        
        /**
         * 
         * @param {Array<TableColumn>} columns 
         * @param {Array<Number>} idxes 
         * @param {Object} revised_data 
         * @param {Object} original_data 
         */
        var recalculate = (columns, idxes, revised_data, original_data) => {

            if (idxes.length == 0) {
                return;
            }
            
            const is_custom_summarize = typeof this.summarize == 'function';
            idxes.forEach(zero_based_idx => {
                
                let this_col = columns[zero_based_idx];
                let with_error = false;

                if (is_custom_summarize) {
                    
                    try {
                        this_col.totalValue = this.summarize(this.extractFilteredRecords(), this_col.propName, this_col.headerText);
                    }
                    catch(ex) {

                        with_error = true;
                        this_col.totalValue = 'ERR!';
                        console.error(`error happens with summarizing column / ${this_col.propName} / ${this_col.headerText}`, ex);
                    }
                }
                else if (revised_data) {

                    let revised_prop_val = revised_data[this_col.propName];
                    if (typeof revised_prop_val == 'number') {

                        if (original_data) {
                            let original_prop_val = original_data[this_col.propName];
                            typeof original_prop_val == 'number' ? this_col.totalValue += (revised_prop_val - original_prop_val) : null;
                        }
                        else {
                            this_col.totalValue += revised_prop_val;
                        }
                    }
                }
                else {

                    let total = 0;
                    this.filteredRows.forEach(table_row => {
                        let prop_val = table_row.rowData[this_col.propName];
                        if (typeof prop_val == 'number') {
                            total += prop_val;
                        }
                    });
                    this_col.totalValue = total;
                }

                if (!with_error) {
                    
                    this_col.$footerCell.innerText = thousands(this_col.totalValue);
                    this_col.$footerCell.className = this._makeFooterCellClassName(this_col, this_col.totalValue);
                }
            });
        };

        var extra_params = [];
        if (revised_data) {

            let matched_row = this._getRow(this.identify(revised_data));
            if (is_new || matched_row === undefined) {
                extra_params.push(revised_data);
            }
            else {
                extra_params.push(revised_data);
                extra_params.push(matched_row.rowData);
            }
        }

        recalculate(this.leftColumns, this.leftSumColIdxes, ...extra_params);
        recalculate(this.columns, this.sumColIdxes, ...extra_params);
        recalculate(this.rightColumns, this.rightSumColIdxes, ...extra_params);
    }

    /**
     * 还原汇总栏到初始状态
     */
    _restoreSummaryInfo() {

        /**
         * 
         * @param {Array<TableColumn>} columns 
         * @param {Array<Number>} idxes 
         */
        var resetFooterCell = (columns, idxes) => {
            idxes.forEach(zero_based_idx => {
                columns[zero_based_idx].totalValue = 0;
                columns[zero_based_idx].$footerCell.innerText = this.config.noValue;
            });
        };

        resetFooterCell(this.leftColumns, this.leftSumColIdxes);
        resetFooterCell(this.columns, this.sumColIdxes);
        resetFooterCell(this.rightColumns, this.rightSumColIdxes);
    }


    /*
     * 以下方法关于： 
     * 1. 行列的显示显示|隐藏
     * 2. 设置表格高度
     */


    /**
     * 展示隐藏中的列
     * @param {Array<String>} column_headers 要展示出来的，数据列标题文字（序列）
     */
    showColumns(column_headers) {

        if (!(column_headers instanceof Array) || column_headers.length == 0) {
            return;
        }

        this.allColumns.forEach(this_col => {
            if (!this_col.isVisible() && column_headers.includes(this_col.headerText)) {
                this_col.setVisible(true);
            }
        });
    }

    /**
     * 隐藏展示中的列
     * @param {Array<String>} column_headers 要隐藏的，数据列标题文字（序列）
     */
    hideColumns(column_headers) {

        if (!(column_headers instanceof Array) || column_headers.length == 0) {
            return;
        }

        this.allColumns.forEach(this_col => {
            if (this_col.isVisible() && column_headers.includes(this_col.headerText)) {
                this_col.setVisible(false);
            }
        });
    }

    /**
     * 设置表格最大高度
     * @param {Number} max_height 最小值为， header高度 + 至少3条数据的高度 + 底边栏高度（如果存在）
     */
    setMaxHeight(max_height) {
        
        if (typeof max_height != 'number' || max_height <= 0) {
            return;
        }

        var min_height = this.settings.headerHeight + this.settings.rowHeight * 1 + (this.showSummary ? this.settings.footerHeight : 0);
        // if (max_height < min_height) {
        //     console.error(`the minimal height that can be accepted is ${min_height}`);
        //     return;
        // }

        this.$body.style.maxHeight = max_height + 'px';
    }

    /**
     * 隐藏数据行
     */
    hideRow(row_key) {
        
        var matched = this.allRowsMap[row_key];
        matched instanceof TableRow && matched.hide();
    }

    /**
     * 显示数据行
     */
    showRow(row_key) {

        var matched = this.allRowsMap[row_key];
        matched instanceof TableRow && matched.show();
    }

    /**
     * 选中指定行
     * @param {*} row_key 
     */
    selectRow(row_key) {
        this._selectRow(this._getRow(row_key));
    }

    /**
     * 取消行选择
     * @param {*} row_key 
     */
    unselectRow() {
        
        if (this.states.selectedRow instanceof TableRow) {
            this.states.selectedRow.inactivate();
        }
    }

    /**
     * 选中上一行（以当前的选中行为基础，如果没有选中行，则选中第一行）
     */
    selectPreviousRow() {

        if (this.screenRows.length == 0) {
            console.log('no screen rows detected(for up select)');
            return;
        }

        if (!(this.states.selectedRow instanceof TableRow)) {
            this._selectRow(this.screenRows[0]);
        }
        else {
            let row_key = this.identify(this.states.selectedRow.rowData);
            let locat = this.screenRowsMap[row_key];
            if (locat instanceof TableRowLocation && locat.location > 0) {
                this._selectRow(this.screenRows[locat.location - 1]);
            }
        }
    }

    /**
     * 选中下一行（以当前的选中行为基础，如果没有选中行，则选中第一行）
     */
    selectNextRow() {
        
        if (this.screenRows.length == 0) {
            console.log('no screen rows detected(for down select)');
            return;
        }

        if (!(this.states.selectedRow instanceof TableRow)) {
            this._selectRow(this.screenRows[0]);
        }
        else {
            let row_key = this.identify(this.states.selectedRow.rowData);
            let locat = this.screenRowsMap[row_key];
            if (locat instanceof TableRowLocation && locat.location < this.screenRows.length - 1) {
                this._selectRow(this.screenRows[locat.location + 1]);
            }
        }
    }

    /*
     * 以下方法关于： 
     * 1. 数据提取
     * 2. 数据导出
     */


    /**
     * 全局范围内，是否有数据行被勾选
     */
    hasAnyRowsChecked() {
        
        for(let row_key in this.states.checkMap) {
            return true;
        }
        return false;
    }

    /**
     * 全局范围内，被勾选的行数
     */
    checkedRowCount() {
        
        var counter = 0;
        for(let row_key in this.states.checkMap) {
            counter++;
        }
        
        return counter;
    }

    /**
     * 提取勾选的所有行（包括： 1.当前页， 2.非当前页， 3. 多轮筛选汇总的结果）
     */
    extractCheckedRecords() {
        
        var checked = [];
        for (let row_key in this.states.checkMap) {
            let matched = this._getRow(row_key);
            if (matched) {
                checked.push(matched.rowData);
            }
        }
        return checked;
    }

    /**
     * 提取勾选的所有行 - 的主键map
     */
    extractCheckedRecordsRowKeys() {
        
        var map = {};
        for (let row_key in this.states.checkMap) {
            let matched = this._getRow(row_key);
            if (matched) {
                map[row_key] = true;
            }
        }
        return map;
    }

    /**
     * 提取勾选 & 显示在当前屏的数据行
     */
    extractCheckedScreenRecords() {
        
        var scr_records = this.screenRows;
        if (scr_records.length == 0) {
            return [];
        }

        var scr_checked = [];
        for (let row_key in this.states.checkMap) {
            let matched = this._getRow(row_key);
            let row_location = this.screenRowsMap[row_key];
            if (matched && row_location) {
                scr_checked.push(matched.rowData);
            }
        }
        return scr_checked;
    }

    /**
     * 提取勾选 & 显示在当前屏的数据行 - 的主键map
     */
    extractCheckedScreenRecordsRowKeys() {
        
        var scr_records = this.screenRows;
        if (scr_records.length == 0) {
            return {};
        }

        var scr_map = {};
        for (let row_key in this.states.checkMap) {
            let matched = this._getRow(row_key);
            let row_location = this.screenRowsMap[row_key];
            if (matched && row_location) {
                scr_map[row_key] = true;
            }
        }
        return scr_map;
    }
    
    /**
     * 提取返回所有数据
     */
    extractAllRecords() {
        return this.allRows.map(x => x.rowData);
    }

    /**
     * 提取返回过滤数据
     */
    extractFilteredRecords() {
        return this.filteredRows.map(x => x.rowData);
    }

    /**
     * 提取返回当前屏数据
     */
    extractScreenRecords() {
        return this.screenRows.map(x => x.rowData);
    }

    /**
     * 提取导出所有数据
     * @param {String} file_name 导出文件名称
     */
    exportAllRecords(file_name) {
        this._exportRecords2File(this.allRows, file_name);
    }

    /**
     * 提取导出过滤数据
     * @param {String} file_name 导出文件名称
     */
    exportFilteredRecords(file_name) {
        this._exportRecords2File(this.filteredRows, file_name);
    }

    /**
     * 提取导出当前屏数据
     * @param {String} file_name 导出文件名称
     */
    exportScreenRecords(file_name) {
        this._exportRecords2File(this.screenRows, file_name);
    }

    /**
     * 导出数据至文件
     * @param {Array<TableRow>} table_rows 
     * @param {String} file_name 导出文件名称
     */
    _exportRecords2File(table_rows, file_name) {
    
        var columns = this.columns.filter(x => x.isDataCol && x.exportable || x.isEmptyCol && x.mappedCol.isDataCol && x.mappedCol.exportable);
        if (columns.length == 0) {

            alert('没有列可以被导出');
            return;
        }

        var user_unexportable_cols = StorageProvider.rwExportColumn(this.tableName);
        var final_columns = columns.filter(x => !user_unexportable_cols.includes(x.headerText));
        if (final_columns.length == 0) {

            alert('当前列表没有配置可以导出的数据列');
            return;
        }

        var tableIns = this;

        /**
         * 
         * @param {TableColumn} column 
         * @param {TableRow} table_row
         */
        function extractFieldVal(column, table_row) {

            var row_data = table_row.rowData;
            var data_formatter = typeof column.exportFormatter == 'function' ? column.exportFormatter : typeof column.formatter == 'function' ? column.formatter : undefined;

            if (typeof data_formatter == 'function') {

                try {
                    let val = data_formatter.call(tableIns._contextObj, row_data, row_data[column.propName], column.propName);
                    return val === undefined || val === null ? '' : typeof val == 'object' ? val.toString() : val;
                }
                catch(ex) {
                    return '[ERR!]';
                }
            }
            else {
                return table_row.tableRef._generateSingleValueContent(row_data[column.propName], column, true);
            }
        }


        /**
         * 下载数据为EXCEL文件
         * @param {Array<Array>} matrix 
         */
        function downloadAsExcel(matrix) {

            var uri = 'data:application/vnd.ms-excel;base64,';
            var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
        
            /**
             * @param {String} source 
             */
            function toBase64(source) {        
                return window.btoa(unescape(encodeURIComponent(source)));
            }
        
            /**
             * 
             * @param {String} tmpl 
             * @param {Object} map 
             */
            function format(tmpl, map) {
                return tmpl.replace(/{(\w+)}/g, function(m, key) { return map[key]; });
            }
        
            let dataUrl = uri + toBase64(format(template, {
        
                worksheet: tableIns.displayTableName || 'Worksheet',
                table: matrix.map(record => `<tr>${ record.map(field => `<td>${field}</td>`).join('') }</tr>`).join(''),
            }));
            
            if (tableIns.$downloadLink === undefined) {

                let $dlink = document.createElement('a');
                $dlink.style.display = 'none';
                tableIns.$downloadLink = $dlink;
            }

            let $dlink = tableIns.$downloadLink;
            $dlink.href = dataUrl;
            $dlink.download = (file_name || tableIns.displayTableName) + '.xls';
            $dlink.click();

            // let str = '';
            // matrix.forEach(item => { 
            //    str += item.join('\xa0\xa0\xa0\xa0\xa0,') + '\n';
            // });
            // console.log(str);
            // let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
            // //通过创建a标签实现
            // let link = document.createElement("a");
            // link.href = uri;
            // //对下载的文件命名
            // link.download =  `${tableIns.displayTableName}.csv`;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
        }

        var matrix = [final_columns.map(x => x.headerText)];
        table_rows.forEach(trow => {
            matrix.push(final_columns.map(the_col => { return extractFieldVal(the_col.isEmptyCol ? the_col.mappedCol : the_col, trow); }));
        });

        downloadAsExcel(matrix);
    }
}

export { JoyinTable };