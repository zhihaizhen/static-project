
import { JoyinTableActions } from '../../component/join-table-actions';
import { helper } from '../../component/helper';
import { Instruction } from '../../component/models';
import { dictionary } from '../../component/dictionary';
import { BaseModule } from './base';

const InstructionFilters = {

    all: { code: '01', mean: '全部' },
    pending: { code: '02', mean: '待接收指令' },
    incompleted: { code: '28', mean: '指令未完成' },
    completed: { code: '29', mean: '指令已完成' },
    dealIncompleted: { code: '30', mean: '成交未完成' },
    dealCompleted: { code: '31', mean: '成交已完成' },
};

const InstructionFiltersCheck = {

    all: { code: '01', mean: '全部' },
    pending: { code: '02', mean: '未接收' },
    incompleted: { code: '03', mean: '待执行' },
    executed: { code: '04', mean: '已执行' },
    invalid: { code: '05', mean: '无效' },
    completed: { code: '06', mean: '已完成' },
};
const DefaultHandlers = {

    /**
     * 指令数据行，选中事件
     * @param {Instruction} row_data 
     */
    rowInsSelected: function (row_data) { /** not implemented */ },
};

const FilterOptions = { 

    /** 指令状态 */
    instatus: 0, 

    /** 关键字 */
    keywords: null, 

    /** 是否仅快速交易 */
    onlyQuick: false,
};


class ModuleInstruction extends BaseModule {

    /**
     * 全部指令数据
     * @returns {Array<Instruction>}
     */
    get allRecords() {
        return this.table.extractAllRecords();
    }

    constructor($container, handlers = DefaultHandlers) {
        
        super($container);
        this.handlers = handlers;

        const batchReceiveBtn = document.getElementById('quick-btn-receive');
        const batchReleaseBtn = document.getElementById('quick-btn-release');

        /** 是否具有指令接收权限 */
        this.canReceive = batchReceiveBtn && batchReceiveBtn.style.display != 'none';
        /** 是否具有指令放弃权限 */
        this.canRelease = batchReleaseBtn && batchReleaseBtn.style.display != 'none';
    }

    /**
     * 勾选的指令数据
     * @returns {Array<Instruction>}
     */
    getCheckeds() {
        return this.table.extractCheckedRecords();
    }

    /**
     * 指令列表导出
     */
    exportInstructs() {
        return this.table.exportAllRecords();
    }

    /**
     * 取消全部勾选
     */
    uncheckAll() {
        this.table.uncheckAll();
    }

    /**
     * @param {Instruction} instruction
     */
    formatInstrucRowAction(instruction) {

        const status_code = instruction.instrucStatus;

        if (this.canReceive && status_code == dictionary.instatus.pending.code) {
            return `<button class="layui-btn" event.onclick="showReceiveConfirm">接收</button>`;
        }
        else if (this.canRelease && status_code == dictionary.instatus.received.code && instruction.progress == 0) {
            return `<button class="layui-btn layui-btn-danger" event.onclick="showReleaseConfirm">放弃</button>`;
        }
        else {
            return '';
        }
    }

    /**
     * @param {Instruction} instruction 
     */
    showReceiveConfirm(instruction) {

        this._dialogId = layer.open({ content: `是否接收指令[<span class="s-color-red">${instruction.id}</span>]？`, yes: () => {
        
            layer.close(this._dialogId);
            this.receive([instruction], true);
        }});
    }

    /**
     * @param {Instruction} instruction 
     */
    showReleaseConfirm(instruction) {

        this._dialogId = layer.open({ content: `是否放弃指令[<span class="s-color-red">${instruction.id}</span>]？`, yes: () => {
        
            layer.close(this._dialogId);
            this.release([instruction], true);
        }});
    }

    /**
     * @param {Array<Instruction>} targets 要接收的目标指令
     * @param {Boolean} is_single_mode 是否是单一接收
     */
    receive(targets, is_single_mode) {
        this.handleAcceptRelease(true, targets, is_single_mode, '接收');
    }

    /**
     * @param {Array<Instruction>} targets 要接收的目标指令
     * @param {Boolean} is_single_mode 是否是单一放弃
     */
    release(targets, is_single_mode) {
        this.handleAcceptRelease(false, targets, is_single_mode, '放弃');
    }

    /**
     * @param {Boolean} is_receive 是否为接收
     * @param {Array<Instruction>} targets 要处理的目标指令
     * @param {Boolean} is_single_mode 是否是单一方式
     * @param {String} behavior_text 
     */
    async handleAcceptRelease(is_receive, targets, is_single_mode, behavior_text) {

        if (targets.length == 0) {
            return;
        }
        
        var resp = is_receive ? await this.instrucRepo.accept(targets)
                              : await this.instrucRepo.release(targets);

        if (resp.errorCode != 0) {

            helper.showError(`指令${behavior_text}，处理失败：${ resp.errorCode }/${ resp.errorMsg }`);
            return;
        }

        /**
         * sample response
         * 
        {

            errorCode: 0,
            errorMsg: 'success',
            data: [{
                entrustId: "WTBOND202008061523",
                errorCode: 4009,
                errorMsg: "指令接收或放弃失败： status is not 0",
                recStatus: "1",
                trader: "xbb1",
            }]
        }
         */

        let results = resp.data;
        if (!(results instanceof Array) || results.length == 0) {

            helper.showError(`指令${behavior_text}，全部失败`);
            return;
        }

        let total = targets.length;
        let succeeds = results.filter(item => item.errorCode == 0);
        let succeeds_count = succeeds.length;
        let all_failed = succeeds_count == 0;
        if (all_failed) {

            let fail_msgs = [`指令${behavior_text}，全部失败`];
            results.forEach((item, item_idx) => {
                fail_msgs.push(`${item_idx + 1}. ${item.entrustId}/${item.errorCode}/${item.errorMsg}`);
            });
            helper.showError(fail_msgs.join('<br/>'), { time: 10000 });

            /**
             * 全部失败，则无需进行后续动作（如刷新操作的指令）
             */
            return;
        }

        let partial_failed = succeeds_count < total;
        if (partial_failed) {

            let faileds = results.filter(item => item.errorCode != 0);
            let fail_msgs = [`指令${behavior_text}，部分失败，总量 = ${total}，失败量 = ${faileds.length}`];
            faileds.forEach((item, item_idx) => {
                fail_msgs.push(`${item_idx + 1}. ${item.entrustId}/${item.errorCode}/${item.errorMsg}`);
            });
            helper.showError(fail_msgs.join('<br/>'), { time: 10000 });

            /**
             * 部分失败，继续进行后续动作
             */
        }
        else {
            helper.showSuccess(`指令${behavior_text}请求已处理，数量 = ${total}`);
        }
        
        /**
         * 为人工方式，点击单条指令时，接收/放弃后，模拟一次人工的选中
         */
        if (is_single_mode) {

            let instruction_id = targets[0].id;
            await this.request2Update(instruction_id);
            let matched = this.table.getRowData(instruction_id);
            console.info('instruction received or released,  to simulate a manual click on a row', matched);
            this.handleRowSelect(matched);
        }
        else {

            console.log('batch received or released, request all instructions again');

            /**
             * 1. 对于批量接收、放弃，无法确定操作的指令个数
             * 2. 如果请求指定的该批次指令，可能造成HTTP请求参数过长问题
             */
            this.requestInstructions();
        }
    }

    /**
     * 筛选符合条件的指令
     */
    filter(options = FilterOptions) {

        let status_code = options.instatus;
        let keywords = options.keywords;
        let onlyQuick = !!options.onlyQuick;
        
        /**
         * @param {Instruction} instruc 
         */
        function filterEnumValues(instruc) {

            let matched_ast = dictionary.assetTypes.find(x => x.code == instruc.assetType);
            let matched_plf = dictionary.platforms.find(x => x.code == instruc.tradePlat);
            let matched_dir = dictionary.directions.find(x => x.code == instruc.direction); 
            let matched_mar = dictionary.markets.find(x => x.code == instruc.marketId);
            let matched_repo = dictionary.repoTypes.find(x => x.code == instruc.repoType);
            let matched_roper = dictionary.repoOperations.find(x => x.code == instruc.repoOperation);
            let matched_sta = dictionary.instatuses.find(x => x.code == instruc.instrucStatus);
            let matched_mod = dictionary.priceModes.find(x => x.code == instruc.priceMode);

            return matched_ast && matched_ast.mean.indexOf(keywords) >= 0 ||
                   matched_plf && matched_plf.mean.indexOf(keywords) >= 0 ||
                   matched_dir && matched_dir.mean.indexOf(keywords) >= 0 ||
                   matched_mar && matched_mar.mean.indexOf(keywords) >= 0 || 
                   matched_repo && matched_repo.mean.indexOf(keywords) >= 0 ||
                   matched_roper && matched_roper.mean.indexOf(keywords) >= 0 ||
                   matched_sta && matched_sta.mean.indexOf(keywords) >= 0 ||
                   matched_mod && matched_mod.mean.indexOf(keywords) >= 0;
        }

        /**
         * @param {Instruction} instruc 
         */
        function filterKeywords(instruc) {

            return typeof instruc.portfolioName == 'string' && instruc.portfolioName.indexOf(keywords) >= 0
                || typeof instruc.accountName == 'string' && instruc.accountName.indexOf(keywords) >= 0
                || typeof instruc.stockName == 'string' && instruc.stockName.indexOf(keywords) >= 0
                || typeof instruc.stockCode == 'string' && instruc.stockCode.indexOf(keywords) >= 0
                || typeof instruc.id == 'string' && instruc.id.indexOf(keywords) >= 0
                || typeof instruc.managerId == 'string' && instruc.managerId.indexOf(keywords) >= 0;
        }
        
        /**
         * 判断快速交易指令
         * @param {Instruction} instruction 
         */
        function isQuickInstruction(instruction) {
            return onlyQuick ? instruction.isApply : true;
        }

        /**
         * @param {Instruction} instruction 
         */
        function filterInstrucs(instruction) {

            const common_condition = (filterEnumValues(instruction) || filterKeywords(instruction)) && isQuickInstruction(instruction);
            if (!common_condition) {
                return false;
            }

            if (status_code == InstructionFilters.all.code) {
                return true;
            }
            
            if (status_code == InstructionFilters.pending.code) {
                return instruction.instrucStatus == dictionary.instatus.pending.code;
            }
            else if (status_code == InstructionFilters.incompleted.code) {
                return instruction.isReceived && instruction.progress < 1;
            }
            else if (status_code == InstructionFilters.completed.code) {
                return instruction.progress == 1;
            }
            else if (status_code == InstructionFilters.dealIncompleted.code) {
                return (instruction.isReceived || (instruction.isApply && instruction.isCompleted)) && instruction.dealProgress < 1;
            }
            else if (status_code == InstructionFilters.dealCompleted.code) {
                return instruction.instrucStatus == dictionary.instatus.completed.code;
            }
        }

        function filterInstrucscheckbox(instruction) {
            
            const common_condition = (filterEnumValues(instruction) || filterKeywords(instruction)) && isQuickInstruction(instruction);
            if (!common_condition) {
                return false;
            }

            let ifc =InstructionFiltersCheck;
            let isPending = false;
            let isIncompleted = false;
            let isExecuted = false;
            let isInvalid = false;
            let isCompleted = false;

            if (status_code.find(item => item == ifc.pending.code)) {
                
                if (instruction.instrucStatus == dictionary.instatus.pending.code) {
                    isPending = true;
                }
            }

            if (status_code.find(item => item == ifc.incompleted.code)) {
                
                if (instruction.isReceived && instruction.progress < 1) {
                    isIncompleted = true;
                }
            }

            if (status_code.find(item => item == ifc.executed.code)) {

                if (instruction.isReceived && instruction.progress == 1 && instruction.dealProgress < 1) {
                    isExecuted = true;
                }
            }

            if (status_code.find(item => item == ifc.invalid.code)) {

                    let instrucStatus = instruction.instrucStatus;
                    let instatus = dictionary.instatus;

                if (instrucStatus == instatus.recalled.code || instrucStatus == instatus.closed.code || instrucStatus == instatus.rejected.code) {
                    isInvalid = true;
                }
            }

            if (status_code.find(item => item == ifc.completed.code)) {
                
                if (instruction.dealProgress == 1) {
                    isCompleted = true;
                }
            }      
            
            return isPending || isIncompleted || isExecuted || isInvalid || isCompleted;
        }



        status_code instanceof Array ? this.table.filterByCustom(filterInstrucscheckbox) : this.table.filterByCustom(filterInstrucs);
    }

    /**
     * 筛选互为公平交易的指令
     * @param {Instruction} source_instruction 参照指令
     */
    filterSiblings(source_instruction) {
        return this.allRecords.filter(other => source_instruction.isOfEqualSibling(other));
    }

    /**
     * @param {Instruction} first 
     * @param {Instruction} second 
     * @param {String} prop_name 
     * @param {String} direction
     */
    sortByDealProgress(first, second, prop_name, direction) {
        
        let first_progress = first.isApply ? -1 : first[prop_name];
        let second_progress = second.isApply ? -1 : second[prop_name];

        if (direction == 'ASC') {
            return first_progress == second_progress ? 0 : first_progress > second_progress ? 1 : -1;
        }
        else if (direction == 'DESC') {
            return first_progress == second_progress ? 0 : first_progress < second_progress ? 1 : -1;
        }
    }

    /**
     * 刷新指定的指令
     * @param {*} instruction_id 
     */
    async request2Update(instruction_id) {

        let resp = await this.instrucRepo.queryInstructions(instruction_id);
        if (resp.errorCode != 0) {
            console.error(instruction_id, resp);
        }
        else {
            resp.data.forEach(item => { this.table.updateRow(item); });
        }
    }

    /**
     * 全量（或增量）重新填充
     * @param {Array<Instruction>} records 
     */
    refill(records) {

        if (this.table.rowCount == 0) {
            
            this.table.refill(records);
            return;
        }

        let table = this.table;
        let old_records = this.allRecords;
        let expired_ids = [];

        /**
         * find expired records
         */

        old_records.forEach(item => {
            
            let not_exist = records.findIndex(x => x.id === item.id) < 0;
            if (not_exist) {
                expired_ids.push(item.id);
            }
        });

        if (expired_ids.length > 0) {
            expired_ids.forEach(id => { table.deleteRow(id); });
        }

        /**
         * update or insert
         */

        records.forEach(item => {

            let not_exist = old_records.findIndex(x => x.id == item.id) < 0;
            if (not_exist) {
                table.insertRow(item);
            }
            else {
                table.updateRow(item);
            }
        });
    }

    /**
     * 请求全量指令列表
     */
    async requestInstructions() {

        var resp = await this.instrucRepo.queryInstructions();
        if (resp.errorCode == 0) {
            
            let records = resp.data.filter(x => helper.isNotNone(x.tradeAccountId));
            this.refill(records);
        }
        else {

            console.error(resp);
            helper.showError('指令数据访问错误');
        }
    }

    start2Refresh() {

        return setInterval(async () => {

            if (this._isRequesting) {
                return;
            }

            this._isRequesting = true;
            await this.requestInstructions();
            this._isRequesting = false;

        }, 1000 * 60);
    }

    /**
     * @param {Instruction} instruction 
     */
    handleRowSelect(instruction) {

        BaseModule.SetAsContextInstruction(instruction);
        this.handlers.rowInsSelected(instruction);
    }

    setupTable() {

        /**
         * 指令列表组件
         */
        this.table = this._createTable({
            
            tableName: 'table-instruc-records',
            displayName: '指令列表',
            defaultSorting: { prop: 'createTime', direction: 'desc' },
            pageSize: 999999,
            rowSelected: this.handleRowSelect.bind(this),
        });

        this.table.setMaxHeight(260);
    }

    build() {

        helper.extend(this, JoyinTableActions);
        this.setupTable();
        this.refreshJob = this.start2Refresh();
    }
}

export { ModuleInstruction };