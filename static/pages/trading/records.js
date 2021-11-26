
import { JoyinTable } from '../../component/joyin-table';
import { JoyinTableActions } from '../../component/join-table-actions';
import { helper } from '../../component/helper';
import { Instruction, Order, BaseEntrust, Entrust, ScaleEntrust, Exchange } from '../../component/models';
import { dictionary } from '../../component/dictionary';
import { TradingUnit } from '../../component/units/unit-level2';
import { BaseModule } from './base';

const ColumnDef = {

    hydm: '<th label="资产代码" prop="stockCode" min-width="100" fixed searchable sortable overflowt></th>',
    hymc: '<th label="资产名称" prop="stockName" min-width="120" fixed searchable sortable overflowt></th>',
    wtfx: '<th label="委托方向" prop="direction" min-width="120" formatter="formatHsDirection" sortable overflowt></th>',
    jglx: '<th label="价格类型" prop="entrustProp" min-width="100" formatter="formatEntrustProp" sortable overflowt></th>',
    sblx: '<th label="申报类型" prop="entrustProp" min-width="100" formatter="formatEntrustProp" sortable overflowt></th>',
    ddsl: '<th label="订单数量" prop="orderVolume" min-width="80" align="right" thousands-int sortable overflowt></th>',
    ddjg: '<th label="订单价格" prop="orderPrice" min-width="80" align="right" formatter="formatCustomPrice" sortable overflowt></th>',
    ddje: '<th label="订单金额" prop="orderBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    ddje2: '<th label="订单金额" prop="entrustBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    ddzt: '<th label="订单状态" prop="orderStatus" min-width="90" formatter="formatOrderStatus" sortable overflowt></th>',
    cwxx: '<th label="错误信息" prop="errorMsg" min-width="150" sortable searchable overflowt></th>',
    ywtsl: '<th label="已委托数量" prop="entrustVolume" min-width="90" align="right" thousands-int sortable overflowt></th>',
    ywtje: '<th label="已委托金额" prop="entrustBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    ycjsl: '<th label="已成交数量" prop="tradedVolume" min-width="90" align="right" thousands-int sortable overflowt></th>',
    ycjje: '<th label="已成交金额" prop="tradedBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    hgje: '<th label="回购金额" prop="tradedBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    djsl: '<th label="冻结数量" prop="frozenVolume" min-width="90" align="right" thousands-int sortable overflowt></th>',
    djje: '<th label="冻结金额" prop="frozenBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    cdsl: '<th label="撤单数量" prop="cancelVolume" min-width="80" align="right" thousands-int sortable overflowt></th>',
    ycsl: '<th label="已撤数量" prop="cancelVolume" min-width="80" align="right" thousands-int sortable overflowt></th>',
    ddbh: '<th label="订单编号" prop="id" min-width="150" sortable searchable overflowt></th>',
    ddbh2: '<th label="订单编号" prop="parentOrderId" min-width="150" sortable searchable overflowt></th>',
    ddph: '<th label="订单批号" prop="orderBatchId" min-width="90" sortable overflowt></th>',
    cjsj: '<th label="创建时间" prop="createTime" min-width="140" formatter="formatDateTime" sortable overflowt></th>',
    wtjg: '<th label="委托价格" prop="entrustPrice" min-width="80" align="right" formatter="formatCustomPrice" sortable overflowt></th>',
    wtje: '<th label="委托金额" prop="entrustBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    zsbl: '<th label="折算比例(%)" prop="entrustPrice" min-width="80" align="right" formatter="formatCustomPrice" sortable overflowt></th>',
    zsbl2: '<th label="折算比例(%)" prop="tradedPrice" min-width="80" align="right" formatter="formatCustomPrice" sortable overflowt></th>',
    bzqsl: '<th label="标准券数量" prop="entrustVolume" min-width="100" formatter="formatEntrustStandardBondVolume" align="right" sortable overflowt></th>',
    kzgsl: '<th label="可转股数量" prop="entrustVolume" min-width="100" formatter="formatBond2StockVolume" align="right" sortable overflowt></th>',
    bzqsl2: '<th label="标准券数量" prop="tradedVolume" min-width="100" formatter="formatExchangeStandardBondVolume" align="right" sortable overflowt></th>',
    wtzt: '<th label="委托状态" prop="entrustStatus" min-width="100" formatter="formatEntrustStatus" sortable overflowt></th>',
    wtbh: '<th label="委托编号" prop="brokerEntrustId" min-width="150" sortable searchable overflowt></th>',
    cjsl: '<th label="成交数量" prop="tradedVolume" min-width="90" align="right" thousands-int sortable overflowt></th>',
    cjje: '<th label="成交金额" prop="tradedBalance" min-width="110" align="right" thousands sortable overflowt></th>',
    cjjg: '<th label="成交价格" prop="tradedPrice" min-width="100" align="right"formatter="formatCustomPrice" sortable overflowt></th>',
    cjjg2: '<th label="成交均价" prop="tradedPrice" min-width="100" align="right" formatter="formatCustomPrice" sortable overflowt></th>',
    cjbh: '<th label="成交编号" prop="brokerTradeId" min-width="150" sortable searchable overflowt></th>',
    cjsj2: '<th label="成交时间" prop="createTime" min-width="140" formatter="formatDateTime" sortable overflowt></th>',
    wtsl: '<th label="委托数量" prop="entrustVolume" min-width="90" align="right" thousands-int sortable overflowt></th>',
    sbzt: '<th label="申报状态" prop="orderStatus" min-width="100" formatter="formatOrderStatus" sortable overflowt></th>',
    xwh: '<th label="席位号" prop="propSeatNo" min-width="80" align="right" sortable overflowt></th>',
    ydh: '<th label="约定号" prop="contractId" min-width="90" sortable overflowt></th>',
    lxr: '<th label="联系人" prop="liaisonName" min-width="80" sortable overflowt></th>',
    lxfs: '<th label="联系方式" prop="liaisonTel" min-width="130" sortable overflowt></th>',
    dfxwh: '<th label="对方席位号" prop="propSeatNo" min-width="80" align="right" sortable overflowt></th>',
    dqnll: '<th label="到期年利率" prop="entrustPrice" min-width="80" align="right" percentage sortable overflowt></th>',
    hgll: '<th label="回购利率" prop="tradedPrice" min-width="80" align="right" percentage sortable overflowt></th>',
    tqshnll: '<th label="提前赎回年利率" prop="expireYearRate" min-width="130" align="right" percentage by100 sortable overflowt></th>',
    qx: '<th label="期限" prop="compactTerm" min-width="100" sortable overflowt></th>',
    jyr: '<th label="交易日期" prop="tradingDay" min-width="100" sortable overflowt></th>',
    wtjj: '<td label="委托进度" prop="progress" min-width="150" formatter="formatEntrustProgress" overflowt></td>',
    kpbz: '<td label="开平标志" prop="offsetFlag" min-width="80" formatter="formatOffsetFlag" overflowt></td>',
    tjtb: '<td label="投机套保标志" prop="hedgeFlag" min-width="100" formatter="formatHedgeFlag" overflowt></td>',
    ddcz: '<th label="操作" prop="orderStatus" fixed-width="80" formatter="formatOrderRowAction" fixed="right"></th>',
    wtcz: '<th label="操作" prop="entrustStatus" fixed-width="80" formatter="formatEntrustRowAction" fixed="right"></th>',
};

const DefaultDataGroupOption = {

    orcols: [''],
    encols: [''],
    excols: [''],
};

const LocalResource = {

    $OrderBox: null,
    $EntrustBox: null,
    $ExchangeBox: null,
    TableHeight: 180,
};

const DefaultHandlers = {

    /**
     * 处置订单撤单
     * @param {Instruction} instruction 撤单，要作用于的目标指令
     * @param {*} feedback 撤单处理结果（当为发起撤订单流程场景时，feedback = undefined）
     */
    orderCanceled: function (instruction, feedback) { throw new Error('not implemented'); },

    /**
     * 处置撤委托
     * @param {Instruction} instruction 撤委托，要作用于的目标指令
     * @param {*} feedback 撤委托处理结果（当为发起撤委托流程场景时，feedback = undefined）
     */
    entrustCanceled: function (instruction, feedback) { throw new Error('not implemented'); },
};

class DataGroup {

    static SetContainer($order_container, $entrust_container, $exchange_container) {

        LocalResource.$OrderBox = $order_container;
        LocalResource.$EntrustBox = $entrust_container;
        LocalResource.$ExchangeBox = $exchange_container;
    }

    /**
     * 订单数据列表（JOYIN TABLE组件）
     */
    get torder() {
        return this._torder || (this._torder = this.createTable(LocalResource.$OrderBox, this.orcols, 'order'));
    }

    /**
     * 委托数据列表（JOYIN TABLE组件）
     */
    get tentrust() {
        return this._tentrust || (this._tentrust = this.createTable(LocalResource.$EntrustBox, this.encols, 'entrust'));
    }

    /**
     * 成交数据列表（JOYIN TABLE组件）
     */
    get texchange() {
        return this._texchange || (this._texchange = this.createTable(LocalResource.$ExchangeBox, this.excols, 'exchange'));
    }

    constructor(moduleIns, groupName, option = DefaultDataGroupOption) {

        this.moduleIns = moduleIns;
        this.groupName = groupName;
        this.orcols = option.orcols;
        this.encols = option.encols;
        this.excols = option.excols;
    }

    identifier(record) {
        return record.id;
    }

    /**
     * @param {HTMLElement} $container 
     * @param {Array<String>} columnDefs 
     * @param {String} tableName 
     */
    createTable($container, columnDefs, tableName) {

        var $wrapper = document.createElement('div');
        var table_id = this.groupName + '-' + tableName;
        $wrapper.id = table_id;
        $wrapper.innerHTML = `<table>${ columnDefs.join('') }</table>`;
        $container.appendChild($wrapper);
        
        var jytable = new JoyinTable($wrapper, this.identifier, this.moduleIns, BaseModule.ExtendTableOption({

            tableName: 'joyin-table-' + table_id,
            pageSize: 999999,
            defaultSorting: { prop: 'createTime', direction: 'desc' },
        }));

        jytable.setMaxHeight(LocalResource.TableHeight);
        return jytable;
    }
}

class ModuleRecords extends BaseModule {

    /**
     * 当前指令，关联的，订单列表
     * @returns {JoyinTable}
     */
    get tableOrder() {
        return this.dataGroup.torder;
    }

    /**
     * 当前指令，关联的，委托列表
     * @returns {JoyinTable}
     */
    get tableEntrust() {
        return this.dataGroup.tentrust;
    }

    /**
     * 当前指令，关联的，成交列表
     * @returns {JoyinTable}
     */
    get tableExchange() {
        return this.dataGroup.texchange;
    }

    /**
     * 是否当前数据分组OK
     */
    get isDataGroupOk() {
        return this.dataGroup instanceof DataGroup;
    }

    /**
     * 是否订单TAB聚焦
     */
    get isOrderFocused() {
        return this.$focusedTab === this.$tabOrder || this.$focusedTab === undefined;
    }

    /**
     * 是否委托TAB聚焦
     */
    get isEntrustFocused() {
        return this.$focusedTab === this.$tabEntrust;
    }

    /**
     * 是否成交TAB聚焦
     */
    get isExchangeFocused() {
        return this.$focusedTab === this.$tabExchange;
    }

    /**
     * @param {HTMLElement} $container 
     */
    constructor($container, handlers = DefaultHandlers) {
        
        super($container);
        this.handlers = handlers;
        this.filterStatus = {

            all: { code: '1', mean: '所有' },
            cancelable: { code: '2', mean: '可撤' },
        };

        /**
         * 为列表设置默认的价格显示精度
         */
        this.stockPricePrecision = 3;
        this.setAsDataGroup(undefined);

        const orderCancelBtn = document.getElementById('btn-order-cancel');
        const entrustCancelBtn = document.getElementById('btn-entrust-cancel');

        /** 是否具有停止订单权限 */
        this.canCancelOrder = orderCancelBtn && orderCancelBtn.style.display != 'none';
         /** 是否具有委托撤销权限 */
        this.canCancelEntrust = entrustCancelBtn && entrustCancelBtn.style.display != 'none';
    }

    /**
     * 设置为数据分组
     * @param {DataGroup} group
     */
    setAsDataGroup(group) {
        this.dataGroup = group;
    }

    /**
     * @param {Order|Entrust|Exchange} row_data 
     */
    formatCustomPrice(row_data, price, field_name) {
        return helper.thousandsDecimal(price, this.stockPricePrecision);
    }
    /**
     * 处置交易单元切换事件
     * @param {TradingUnit} unit
     */
    handleUnitSwitched(unit) {

        let hidden_class = BaseModule.Classes.hidden;

        if (unit.showOrder) {

            this.$orderBox.classList.remove(hidden_class);
            this.$tabOrder.classList.remove(hidden_class);
            this.$tabEntrust.click();
        }
        else {

            this.$orderBox.classList.add(hidden_class);
            this.$tabOrder.classList.add(hidden_class);
            this.$tabEntrust.click();
        }
    }

    /**
     * 处置下单事件
     * @param {Instruction} instruction 下单所属目标指令
     * @param {*} feedback 下单反馈
     */
    handleOrderPlaced(instruction, feedback) {
        
        this.requestEntrusts(true);
        this.requestExchanges(true);
    }

    /**
     * 设置当前上下文指令，所对应的数据列表组
     * @param {Instruction} instruction 
     */
    showDataGroup(instruction) {

        let groups = this.groups;
        let data_group = null;

        /**
         * 根据指令（交易单元）决定当前的数据分组
         */

        if (instruction.isRegular) {
            data_group = groups.normal;
        }
        else if (instruction.isFuture) {
            data_group = groups.future;
        }
        else if (instruction.isOption) {
            data_group = groups.option;
        }
        else if (instruction.isApply) {

            if (instruction.direction == dictionary.direction.bond2Stock.code) {
                data_group = groups.applyBond2Stock;
            }
            else{
                data_group = groups.apply;
            }
        }
        else if (instruction.isScale) {
            data_group = groups.scale;
        }
        else if (instruction.isRepo) {
            data_group = groups.repo;
        }
        else if (instruction.isPledge) {
            data_group = groups.pledge;
        }
        else if (instruction.isConstr) {
            data_group = groups.constr;
        }
        else if (instruction.isBasket) {
            data_group = groups.basket;
        }

        /**
         * 容错处理
         */

        if (!data_group) {
            data_group = groups.normal;
        }

        let thisObj = this;

        function hideLast() {

            if (!thisObj.isDataGroupOk) {
                return;
            }
            
            let last_group = thisObj.dataGroup;
            last_group._torder && last_group._torder.$component.classList.add(BaseModule.Classes.hidden);
            last_group._tentrust && last_group._tentrust.$component.classList.add(BaseModule.Classes.hidden);
            last_group._texchange && last_group._texchange.$component.classList.add(BaseModule.Classes.hidden);
        }

        function showCurrent() {

            if (!thisObj.isDataGroupOk) {
                return;
            }
            
            let cur_group = thisObj.dataGroup;
            cur_group.torder.$component.classList.remove(BaseModule.Classes.hidden);
            cur_group.tentrust.$component.classList.remove(BaseModule.Classes.hidden);
            cur_group.texchange.$component.classList.remove(BaseModule.Classes.hidden);
        }
        
        /**
         * 隐藏上一个分组的数据展示
         */

        hideLast();

        /**
         * 当前上下文指令，所对应的数据列表组
         */
        this.setAsDataGroup(data_group);

        /**
         * 显示当前分组的数据展示
         */
        showCurrent();
    }

    /**
     * @param {Instruction} instruction 上下文指令
     */
    takeAction(instruction) {

        /**
         * 从指令携带的合约价格精度信息，重写本地版本
         */

        this.stockPricePrecision = instruction.queryStockPricePrecision(instruction.tradePlat);

        /**
         * 展示相对应的数据分组
         */
        
        this.showDataGroup(instruction);

        /**
         * 清除订单、委托、成交，各个表格的数据
         */

        this.tableOrder.clearTable();
        this.tableEntrust.clearTable();
        this.tableExchange.clearTable();

        if (this.isDataGroupOk) {
            
            this.requestEntrusts();
            this.requestExchanges();
        }
        else {
            console.error('no data group is available for instruction', instruction);
        }
    }

    /**
     * 增量填充，订单列表
     * @param {Array<Order>} records 
     */
    fillOrders(records) {

        var table = this.tableOrder;
        var old_records = table.extractAllRecords();

        if (old_records.length == 0) {
            
            table.refill(records);
            return;
        }

        var expired_ids = [];

        /**
         * find expired records
         */

        old_records.forEach(item => {

            if (!(item instanceof Order)) {
                return;
            }

            let order_id = item.id;
            let not_exist = records.findIndex(x => x.id === order_id) < 0;
            if (not_exist) {
                expired_ids.push(order_id);
            }
        });

        if (expired_ids.length > 0) {
            expired_ids.forEach(id => { table.deleteRow(id); });
        }

        /**
         * update or insert
         */

        records.forEach(item => {

            let not_exist = old_records.findIndex(x => x instanceof Order && x.id == item.id) < 0;
            if (not_exist) {
                table.insertRow(item);
            }
            else {
                table.updateRow(item);
            }
        });
    }

    /**
     * 增量填充，普通、大宗、协议回购、固收类交易，委托列表
     * @param {Array<BaseEntrust>} records 
     */
    fillEntrusts(records) {
        
        var table = this.tableEntrust;
        var old_records = table.extractAllRecords();

        if (old_records.length == 0) {
            
            table.refill(records);
            return;
        }

        var expired_ids = [];

        /**
         * find expired records
         */

        old_records.forEach(item => {

            if (!(item instanceof BaseEntrust)) {
                return;
            }

            let entrust_id = item.id;
            let not_exist = records.findIndex(x => x.id === entrust_id) < 0;
            if (not_exist) {
                expired_ids.push(entrust_id);
            }
        });

        if (expired_ids.length > 0) {
            expired_ids.forEach(id => { table.deleteRow(id); });
        }

        /**
         * update or insert
         */

        records.forEach(item => {

            let not_exist = old_records.findIndex(x => x instanceof BaseEntrust && x.id == item.id) < 0;
            if (not_exist) {
                table.insertRow(item);
            }
            else {
                table.updateRow(item);
            }
        });
    }
    
    /**
     * 增量填充，成交列表
     * @param {Array<Exchange>} records 
     */
    fillExchanges(records) {

        var table = this.tableExchange;
        var old_records = table.extractAllRecords();

        if (old_records.length == 0) {
            
            table.refill(records);
            return;
        }

        var expired_ids = [];

        /**
         * find expired records
         */

        old_records.forEach(item => {

            if (!(item instanceof Exchange)) {
                return;
            }

            let exchange_id = item.id;
            let not_exist = records.findIndex(x => x.id === exchange_id) < 0;
            if (not_exist) {
                expired_ids.push(exchange_id);
            }
        });

        if (expired_ids.length > 0) {
            expired_ids.forEach(id => { table.deleteRow(id); });
        }

        /**
         * update or insert
         */

        records.forEach(item => {

            let not_exist = old_records.findIndex(x => x instanceof Exchange && x.id == item.id) < 0;
            if (not_exist) {
                table.insertRow(item);
            }
            else {
                table.updateRow(item);
            }
        });
    }

    /**
     * @param {Order} order 
     */
    enrichOrder(order) {

        let matched = BaseModule.SeekInstruction(order.instructionId);
        if (matched instanceof Instruction) {

            order.accountName = matched.accountName;
            order.portfolioName = matched.portfolioName;
        }

        return order;
    }

    /**
     * @param {BaseEntrust} entrust 
     */
    enrichEntrust(entrust) {

        let matched = BaseModule.SeekInstruction(entrust.instructionId);
        if (matched instanceof Instruction) {
            
            entrust.accountName = matched.accountName;
            entrust.assetType = matched.assetType;
        }
        
        return entrust;
    }

    /**
     * @param {Exchange} exch 
     */
    enrichExchange(exch) {

        let matched = BaseModule.SeekInstruction(exch.instructionId);
        if (matched instanceof Instruction) {
            exch.accountName = matched.accountName;
        }

        return exch;
    }

    async requestExchanges(is_incremental) {

        let { id, accountId } = this.instruction;
        let resp = await this.tradingRepo.queryExchanges(id, accountId);

        if (resp.errorCode == 0) {

            var exchanges = resp.data;
            exchanges.forEach(item => { this.enrichExchange(item); });
            this.tableExchange.clearCustomFilter();

            if (is_incremental) {
                this.fillExchanges(exchanges);
            }
            else {
                this.tableExchange.refill(exchanges);
            }
        }
        else {

            helper.showError(`成交数据，调用异常( ${ resp.errorMsg } )`);
            this.tableExchange.refill([]);
        }
    }

    async requestEntrusts(is_incremental) {

        let { id, accountId, isScale, isRepo, isConstr } = this.instruction;
        let isScaleType = isScale || isRepo || isConstr;
        let resp = isScaleType ? await this.tradingRepo.queryScaleEntrusts(id, accountId)
                               : await this.tradingRepo.queryEntrusts(id, accountId);

        if (resp.errorCode == 0) {

            let entrusts = !isScaleType ? resp.data.entrustList : resp.data;
            let orders = !isScaleType ? resp.data.orderList : [];

            entrusts.forEach(item => { this.enrichEntrust(item); });
            orders.forEach(item => { this.enrichOrder(item); });

            this.tableOrder.clearCustomFilter();
            this.tableEntrust.clearCustomFilter();

            if (is_incremental) {
                
                if (isScaleType) {
                    this.fillEntrusts(entrusts);
                }
                else {

                    this.fillOrders(orders);
                    this.fillEntrusts(entrusts);
                }
            }
            else {

                this.tableOrder.refill(orders);
                this.tableEntrust.refill(entrusts);
            }
        }
        else {

            helper.showError(`订单委托数据，调用异常( ${ resp.errorMsg } )`);
            this.tableEntrust.refill([]);
            this.tableOrder.refill([]);
        }
    }

    /**
     * 根据筛选条件，筛选出符合要求的订单
     */
    filterOrders() {

        let status = this.getRadioValue('radio-orders');
        let keywords = this.$kword.value;
        let thisObj = this;

        /**
         * @param {Order} order 
         */
        function filterEnumValues(order) {

            let entrustProp = JoyinTableActions.formatEntrustProp(order, order.entrustProp);
            let matched_dir = JoyinTableActions.formatHsDirection(order);
            let orderStatus = JoyinTableActions.formatOrderStatus(order, order.orderStatus);

            return matched_dir && matched_dir.indexOf(keywords) >= 0 ||
                   typeof entrustProp == 'string' && entrustProp.indexOf(keywords) >= 0 ||
                   typeof orderStatus == 'string' && orderStatus.indexOf(keywords) >= 0;
        }

        /**
         * @param {Order} order 
         */
        function filterKeywords(order) {

            return typeof order.stockName == 'string' && order.stockName.indexOf(keywords) >= 0
                || typeof order.stockCode == 'string' && order.stockCode.indexOf(keywords) >= 0
                || typeof order.errorMsg == 'string' && order.errorMsg.indexOf(keywords) >= 0
                || typeof order.id == 'string' && order.id.indexOf(keywords) >= 0
        }
        
        /**
         * @param {Order} order 
         */
        function customFilter(order) {
            return (status == thisObj.filterStatus.all.code || !order.isCompleted) && (filterEnumValues(order) || filterKeywords(order));
        }

        this.tableOrder.filterByCustom(customFilter);
    }

    /**
     * 根据筛选条件，筛选出符合要求的委托记录
     */
    filterEntrusts() {

        let status = this.getRadioValue('radio-entrusts');
        let keywords = this.$kwentr.value;
        let thisObj = this;
        
        /**
         * @param { BaseEntrust } entrust 
         */
        function filterEnumValues(entrust) {
            
            let matched_dir =  JoyinTableActions.formatHsDirection(entrust);
            let matched_sta = dictionary.entrustStatuses.find(x => x.code == entrust.entrustStatus);
            matched_sta = matched_sta ? matched_sta.mean : undefined;
            let entrustProp = JoyinTableActions.formatEntrustProp(entrust, entrust.entrustProp);

            return typeof matched_dir == 'string' && matched_dir.indexOf(keywords) >= 0 ||
                   typeof matched_sta == 'string' && matched_sta.indexOf(keywords) >= 0 ||
                   typeof entrustProp == 'string' && entrustProp.indexOf(keywords) >= 0;
        }
        
        /**
         * @param { BaseEntrust } entrust 
         */
        function filterKeywords(entrust) {

            return typeof entrust.stockCode == 'string' && entrust.stockCode.indexOf(keywords) >= 0
                || typeof entrust.stockName == 'string' && entrust.stockName.indexOf(keywords) >= 0
                || typeof entrust.errorMsg == 'string' && entrust.errorMsg.indexOf(keywords) >= 0
                || typeof entrust.parentOrderId == 'string' && entrust.parentOrderId.indexOf(keywords) >= 0
                || typeof entrust.brokerEntrustId == 'string' && entrust.brokerEntrustId.indexOf(keywords) >= 0;
        }

        /**
         * @param { BaseEntrust } entrust 
         */
        function customFilter(entrust) {
            return (status == thisObj.filterStatus.all.code || !entrust.isCompleted) && (filterEnumValues(entrust) || filterKeywords(entrust));
        }

        this.tableEntrust.filterByCustom(customFilter);
    }

    /**
     * 根据筛选条件，筛选出符合要求的成交
     */
    filterExchanges() {

        let keywords = this.$kwexch.value;

        /**
         * @param {Exchange} exchange 
         */
        function filterEnumValues(exchange) {

            let matched_dir = JoyinTableActions.formatHsDirection(exchange);
            return matched_dir && matched_dir.indexOf(keywords) >= 0;
        }

        /**
         * @param {Exchange} exchange 
         */
        function filterKeywords(exchange) {

            return typeof exchange.stockName == 'string' && exchange.stockName.indexOf(keywords) >= 0
                || typeof exchange.stockCode == 'string' && exchange.stockCode.indexOf(keywords) >= 0;
        }
        
        /**
         * @param {Exchange} exchange 
         */
        function customFilter(exchange) {
            return filterEnumValues(exchange) || filterKeywords(exchange);
        }

        this.tableExchange.filterByCustom(customFilter);
    }

    /**
     * @param {Order} order 
     * @param {Function} internalCallback 撤订单内部callback
     */
    async cancelOrder(order, internalCallback) {

        var resp = await this.tradingRepo.cancelOrder(order.id);
        if (resp.errorCode == 0) {

            internalCallback(this.instruction, resp.data);
            helper.showSuccess('终止订单请求，已发出');
        }
        else {
            helper.showError(`终止订单，处理失败：${ resp.errorCode }/${ resp.errorMsg }`);
        }
    }

    /**
     * @param {Order} order 
     */
    showCancelOrderConfirm(order) {

        let thisObj = this;

        /**
         * 执行撤订单完成回调
         * @param {*} instruction 
         * @param {*} cancel_feedback 
         */
        function callback(instruction, cancel_feedback) {

            /**
             * 撤订单后，重设所有适配的交易单元
             */

            thisObj.handlers.orderCanceled(instruction, cancel_feedback);
        };

        this._dialogId = layer.open({ content: '是否终止该<span class="s-color-red">订单</span>？', yes: () => { 
        
            layer.close(this._dialogId);
            this.cancelOrder(order, callback);
        }});
    }

    /**
     * @param {BaseEntrust} entrust
     * @param {Function} internalCallback 撤委托内部callback
     */
    async cancelEntrust(entrust, internalCallback) {

        if (helper.isNone(entrust.id)) {

            console.error('entrust type is unknown', entrust);
            return;
        }

        if (this.instruction.approverFlag) {

            let thisObj = this;
            let flowCallback = function () {

                /**
                 * 后端审批流程对指令的短期影响（典型，如冻结数量信息等）未可知，作一定延迟，尽可能使场内交易界面的数据状态接近真实
                 */
                setTimeout(() => { internalCallback(thisObj.instruction); }, 500);
            }

            try {
                
                /**
                 * 综合委托和普通委托对应各自的工作流页面
                 */
                if(entrust instanceof ScaleEntrust) {

                    BaseModule.SetAsJoyinPageId('TrdExchange005');
                    BaseModule.StartJoyinWorkflow('TrdExchange005/save', 'TrdExchange005_btn_submit', { orderID: entrust.id, portfolioId: entrust.portfolioId}, flowCallback);
                }
                else {

                    BaseModule.SetAsJoyinPageId('TrdExchange004');
                    BaseModule.StartJoyinWorkflow('TrdExchange004/save', 'TrdExchange004_btn_submit', { orderID: entrust.id, portfolioId: entrust.portfolioId}, flowCallback);
                }
            }
            catch(ex) {
                helper.showError(`工作流启动发生异常，${ ex.message }`);
            }
        }
        else {

            var resp = await this.tradingRepo.cancelEntrust(entrust.id);
            if (resp.errorCode == 0) {

                internalCallback(this.instruction, resp.data);
                helper.showSuccess('撤单请求，已发送');
            }
            else {
                helper.showError(`撤单处理失败：${ resp.errorCode }/${ resp.errorMsg }`);
            }
        }
    }

    /**
     * @param {BaseEntrust} entrust
     */
    showCancelEntrustConfirm(entrust) {

        let thisObj = this;

        /**
         * 执行撤委托完成回调
         * @param {*} instruction 
         * @param {*} cancel_feedback 
         */
        function callback(instruction, cancel_feedback) {

            /**
             * 撤委托后，重设所有适配的交易单元
             */

            thisObj.handlers.entrustCanceled(instruction, cancel_feedback);
        };

        this._dialogId = layer.open({ content: '是否撤销该<span class="s-color-red">委托</span>？', yes: () => { 
            
            layer.close(this._dialogId);
            this.cancelEntrust(entrust, callback);
        }});
    }

    formatOrderRowAction(row_data, order_status, field_name) {

        if (!this.canCancelOrder) {
            return '--';
        }
       
        let matched = dictionary.orderStatuses.find(x => x.code == order_status);
        return matched && !matched.isCompleted ? `<button class="layui-btn layui-btn-danger" event.onclick="showCancelOrderConfirm">停止</button>` : '--';
    }

    formatOffsetFlag (row_data) {

        if (row_data.offsetFlag == dictionary.positionEffect.open.code) {
            return dictionary.positionEffect.open.mean
        }
        else if (row_data.offsetFlag == dictionary.positionEffect.close.code) {
            return dictionary.positionEffect.close.mean;
        }
        else {
            return '--';
        }
    }

    formatHedgeFlag (row_data) {
        
        if (row_data.hedgeFlag == dictionary.hedgeSign.speculation.code) {
            return dictionary.hedgeSign.speculation.mean;
        }
        else if (row_data.hedgeFlag == dictionary.hedgeSign.profit.code) {
            return dictionary.hedgeSign.profit.mean;
        }
        else if (row_data.hedgeFlag == dictionary.hedgeSign.safeguard.code) {
            return dictionary.hedgeSign.safeguard.mean;
        }
        else {
            return '--';
        }
    }


    formatEntrustRowAction(row_data, entrust_status, field_name) {

        /**
         * 不可撤交易场景
         * @param {Entrust} ent 
         */
        function decideCancellable(ent) {

            const ETP = dictionary.entrustProp;
            let prop = ent.entrustProp;
            let isShMarket = ent.market == 'SH';
            let isReported = ent.entrustStatus == dictionary.entrustStatus.reported.code;

            /**
             * 配股配债：委托确认后，上交所不可撤，深交所可撤
             */
            if ((prop == ETP.allotment.code || prop == ETP.addissue.code) && isReported && isShMarket) {
                return false;
            }
            
            /**
             * 债转股：上交所未经交易所确认的委托可以撤单，已确认委托不允许撤单；深交所均可以撤单
             */
            if (prop == ETP.change_to_stock.code && isReported && isShMarket) {
                return false;
            }

            /**
             * 新股申购：已确认委托上交所深交所均不可撤
             * 可转债信用申购：已确认委托上交所深交所均不可撤
             */
            if (prop == ETP.apply.code && isReported) {
                return false;
            }

            return true;
        }
        
        if (!this.canCancelEntrust) {
            return '--';
        }

        let matched = dictionary.entrustStatuses.find(x => x.code == entrust_status);
        let isCancellable = decideCancellable(row_data);
      
        return matched && !matched.isCompleted && isCancellable ? `<button class="layui-btn layui-btn-danger" event.onclick="showCancelEntrustConfirm">撤委托</button>` : '--';
    }

    expand() {

        if (!this.isDataGroupOk) {
            return;
        }

        if (this.isOrderFocused) {
            this.tableOrder.fitColumnWidth();
        }
        else if (this.isEntrustFocused) {
            this.tableEntrust.fitColumnWidth();
        }
        else if (this.isExchangeFocused) {
            this.tableExchange.fitColumnWidth();
        }
    }

    /**
     * 重置查询条件
     * @param {Boolean} isAll 是否重置所有列表的查询条件
     */
    resetQuery(isAll) {

        let form = layui.form;
        let empty = { keyWords: '', status: 1 };
        let filter = {

            order: 'form-query-orders',
            entrust: 'form-query-entrusts',
            exchange: 'form-query-exchanges',
        };

        if (isAll) {

            form.val(filter.order, empty);
            form.val(filter.entrust, empty);
            form.val(filter.exchange, empty);
        }
        else if (this.isOrderFocused) {
            form.val(filter.order, empty);
        }
        else if (this.isEntrustFocused) {
            form.val(filter.entrust, empty);
        }
        else if (this.isExchangeFocused) {
            form.val(filter.exchange, empty);
        }
    }

    /**
     * 刷新焦点TAB内的数据列表
     */
    refresh() {
        
        if (this.isOrderFocused || this.isEntrustFocused) {
            this.requestEntrusts();
        }
        else if (this.isExchangeFocused) {
            this.requestExchanges();
        }
    }

    /**
     * 创建（获取）必要的DOM & 绑定必要的DOM用户事件
     */
    createComponents() {

        let $container = this.$container;

        /** 订单TAB元素 */
        this.$tabOrder = $container.querySelector('#tab-order');
        /** 委托TAB元素 */
        this.$tabEntrust = $container.querySelector('#tab-entrust');
        /** 成交TAB元素 */
        this.$tabExchange = $container.querySelector('#tab-exchange');

        /** 各种订单列表容器 */
        this.$orderBox = $container.querySelector('#multi-type-orders');
        /** 各种委托列表容器 */
        this.$entrustBox = $container.querySelector('#multi-type-entrusts');
        /** 各种成交列表容器 */
        this.$exchangeBox = $container.querySelector('#multi-type-exchanges');

        /**
         * 订单数据，筛查
         */

        let $kw1 = $container.querySelector('#keywords-orders');
        $kw1.addEventListener('keydown', (e) => { e.keyCode == 13 && this.filterOrders(); });
        $kw1.addEventListener('change', (e) => { this.filterOrders(); });
        $kw1.addEventListener('blur', (e) => { this.filterOrders(); });
        layui.form.on('radio(radio-orders)', data => { this.filterOrders(); });
        this.$kword = $kw1;

        /**
         * 委托数据，筛查
         */

        let $kw2 = $container.querySelector('#keywords-entrusts');
        $kw2.addEventListener('keydown', (e) => { e.keyCode == 13 && this.filterEntrusts(); });
        $kw2.addEventListener('change', (e) => { this.filterEntrusts(); });
        $kw2.addEventListener('blur', (e) => { this.filterEntrusts(); });
        layui.form.on('radio(radio-entrusts)', data => { this.filterEntrusts(); });
        this.$kwentr = $kw2;

        /**
         * 成交数据，筛查
         */

        let $kw3 = $container.querySelector('#keywords-exchanges');
        $kw3.addEventListener('keydown', (e) => { e.keyCode == 13 && this.filterExchanges(); });
        $kw3.addEventListener('change', (e) => { this.filterExchanges(); });
        $kw3.addEventListener('blur', (e) => { this.filterExchanges(); });
        this.$kwexch = $kw3;

        /**
         * TAB切换监听
         */

        layui.element.on('tab(data-list-tab)', (evt) => {

            /** 当前获得焦点的TAB元素 */
            this.$focusedTab = evt.elem.context;
            this.expand();
        });

        /**
         * 列表刷新
         */

        let $refresh = $container.querySelector('#user-toolkit-2');
        $refresh.onclick = () => {

            this.resetQuery();
            this.refresh();
        };
    }

    createDataGroup() {

        DataGroup.SetContainer(this.$orderBox, this.$entrustBox, this.$exchangeBox);
        const cd = ColumnDef;

        this.groups = {

            normal: new DataGroup(this, 'group-normal', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.ddsl, cd.ddjg, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.wtzt, cd.cwxx,cd.wtje, cd.ycjsl, cd.ycjje, cd.cjjg2, cd.djsl, cd.djje, cd.cdsl, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            future: new DataGroup(this, 'group-future', {

                orcols: [cd.hydm, cd.hymc, cd.kpbz, cd.tjtb, cd.wtfx, cd.jglx, cd.ddsl, cd.ddjg, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.kpbz, cd.tjtb, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.wtzt, cd.cwxx, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.kpbz, cd.tjtb, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            option: new DataGroup(this, 'group-option', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.ddsl, cd.ddjg, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.wtzt, cd.cwxx, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            apply: new DataGroup(this, 'group-apply', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.sbzt, cd.ddbh, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.wtje, cd.ycsl, cd.wtzt, cd.cwxx, cd.wtbh, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            applyBond2Stock: new DataGroup(this, 'group-apply-bond2stock', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.sbzt, cd.ddbh, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.kzgsl, cd.ycsl, cd.wtzt, cd.cwxx, cd.wtbh, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            scale: new DataGroup(this, 'group-scale', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.ddjg, cd.ddsl, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.sblx, cd.wtsl, cd.wtjg, cd.wtje, cd.wtzt, cd.cwxx, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.xwh, cd.ydh, cd.lxr, cd.lxfs, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.dfxwh, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            repo: new DataGroup(this, 'group-repo', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.ddje2, cd.dqnll, cd.ddzt, cd.cwxx, cd.ddbh, cd.cjsj, cd.ddcz],
                encols: [cd.wtjj, cd.jglx, cd.hydm, cd.ycjsl, cd.ycjje, cd.cjjg2, cd.ycsl, cd.wtsl, cd.hymc, cd.wtfx, cd.ddje2, cd.dqnll, cd.qx, cd.ydh, cd.xwh, cd.wtzt, cd.cwxx, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.cjsl, cd.wtfx, cd.hgll, cd.hgje, cd.xwh, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            pledge: new DataGroup(this, 'group-pledge', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.ddzt, cd.cwxx, cd.ddsl, cd.ddbh, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.sblx, cd.wtsl, cd.zsbl, cd.wtzt, cd.bzqsl, cd.ycjsl, cd.ycsl, cd.cwxx, cd.wtbh, cd.ddbh2, cd.jyr, cd.wtjj, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.zsbl2, cd.wtbh, cd.bzqsl2, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            constr: new DataGroup(this, 'group-constr', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.ddjg, cd.ddsl, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.sblx, cd.wtsl, cd.wtjg, cd.wtzt, cd.cwxx, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ydh, cd.wtbh, cd.ddbh2, cd.jyr, cd.cjsj, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),

            basket: new DataGroup(this, 'group-basket', {

                orcols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.ddsl, cd.ddjg, cd.ddje, cd.ddzt, cd.cwxx, cd.ywtsl, cd.ywtje, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.ddbh, cd.ddph, cd.cjsj, cd.ddcz],
                encols: [cd.hydm, cd.hymc, cd.wtfx, cd.jglx, cd.wtsl, cd.wtjg, cd.wtzt, cd.cwxx, cd.ycjsl, cd.ycjje, cd.djsl, cd.djje, cd.cdsl, cd.wtbh, cd.ddbh2, cd.cjsj, cd.jyr, cd.wtcz],
                excols: [cd.hydm, cd.hymc, cd.wtfx, cd.cjsl, cd.cjje, cd.cjjg, cd.wtbh, cd.ddbh2, cd.cjbh, cd.jyr, cd.cjsj2],
            }),
        };
    }

    start2Refresh() {

        return setInterval(async () => {

            if (this._isRequesting || !this.isInstructionStillTradable) {
                return;
            }

            this._isRequesting = true;
            await this.requestEntrusts(true);
            await this.requestExchanges(true);
            this._isRequesting = false;

        }, 1000 * 5);
    }

    build() {

        helper.extend(this, JoyinTableActions);
        this.createComponents();
        this.createDataGroup();
        this.refreshJob = this.start2Refresh();
    }
}

export { ModuleRecords };