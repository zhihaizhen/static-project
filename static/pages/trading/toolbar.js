
import { helper } from '../../component/helper';
import { Instruction, OrderInfo } from '../../component/models';
import { BaseModule } from './base';

const DefaultHandlers = {

    /**
     * 搜索期望的指令
     * @param {{ instatus, keywords, onlyQuick }} condition 
     * @returns {Array<Instruction>}
     */
    searcher: function (condition) { throw new Error('not implemented'); },

    /**
     * 刷新动作
     * @param {Function} callback 
     */
    refresher: function (callback) { throw new Error('not implemented'); },

    /**
     * 搜索勾选的指令
     * @returns {Array<Instruction>}
     */
    seekChecks: function () { throw new Error('not implemented'); },

    /**
     * 批量接收指令
     * @param {Array<Instruction>}
     */
    batchReceive: function (instructions) { throw new Error('not implemented'); },

    /**
     * 批量放弃指令
     * @param {Array<Instruction>}
     */
    batchRelease: function (instructions) { throw new Error('not implemented'); },

    /**
     * 批量快速下单
     * @param {Array<Instruction>}
     */
    batchQuickOrderCompleted: function (instructions) { throw new Error('not implemented'); },

    /**
     * 指令数据导出
     */
    exportInstructions: function () { throw new Error('not implemented'); },
};

class ModuleToolbar extends BaseModule {

    /**
     * 是否仅快速交易
     */
    get isQuickOnly() {
        return !!this.$quickSwith.checked;
    }

    /**
     * @param {*} $container 
     */
    constructor($container, handlers = DefaultHandlers) {
       
        super($container);
        this.handlers = handlers;
    }

    /**
     * 执行当前选择条件，进行指令搜索
     */
    search() {

        this.handlers.searcher({

            instatus: this.getCheckboxValue('checkbox-instruc'),
            keywords: this.$keywords.value,
            onlyQuick: this.isQuickOnly,
        });
    }

    /**
     * 执行刷新动作
     */
    refresh() {
        this.handlers.refresher(_ => { this.search(); });
    }

    /**
     * 批量接收指令
     */
    batchReceive() {
        this.batchReceiveRelease(true, '接收');
    }

    /**
     * 批量放弃指令
     */
    batchRelease() {
        this.batchReceiveRelease(false, '放弃');
    }

    batchReceiveRelease(is_receive, behavior_text) {

        let checks = this.handlers.seekChecks();
        if (checks.length == 0) {

            helper.msg(`请勾选要${behavior_text}的指令`);
            return;
        }

        let qualifies = is_receive ? checks.filter(item => item.isPending) : checks.filter(item => item.allow2Release);
        if (qualifies.length == 0) {

            helper.msg(`勾选数 = ${checks.length}，可${behavior_text}数 = 0`);
            return;
        }

        let message = `勾选数 = ${checks.length}，可${behavior_text}数 = ${qualifies.length}，是否${behavior_text}？`;
        
        if (behavior_text == '放弃') {
            this.handlers.batchRelease(qualifies);
        }
        else {
            this._dialogId = layer.open({ content: message, yes: () => {
            
                layer.close(this._dialogId);
                is_receive ? this.handlers.batchReceive(qualifies) : this.handlers.batchRelease(qualifies);
            }});
        }
    }

    /**
     * 指令导出
     */
    exportInstructions() {
        this.handlers.exportInstructions();
    }

    /**
     * 批量下单
     */
    batchOrder() {

        let checks = this.handlers.seekChecks();
        if (checks.length == 0) {

            helper.msg('请勾选，至少一条快速交易指令');
            return;
        }

        let incompleteds = checks.filter(item => (item.isApply || item.isPledge) && item.isReceived && !item.isCompleted);
        if (incompleteds.length == 0) {

            helper.msg(`勾选指令数 = ${checks.length}，不包含快速交易指令`);
            return;
        }

        let message = `勾选数 = ${checks.length}，可交易快速指令数 = ${incompleteds.length}，是否下单？`;
        this._dialogId = layer.open({ content: message, yes: () => {
        
            layer.close(this._dialogId);
            this.placeQuickOrders(incompleteds);
        }});
    }

    /**
     * 快速指令批量下单
     * @param {Array<Instruction>} quick_instructions 
     * @param {*} order 
     * @param {*} instruc 
     */
    placeQuickOrders(quick_instructions, order, instruc) {

        if (quick_instructions.length == 0) {
            return;
        }

        const thisObj = this;

        /**
         * @param {OrderInfo} order 
         * @param {Instruction} instruction 
         */
        function sendOrder(order, instruction) {
            thisObj.tradingRepo.placeOrder(order, instruction);
        }

        let load_index = helper.showLoading();

        try {

            quick_instructions.forEach(instruc => {

                let order = new OrderInfo({
                
                    instructionId: instruc.id,
                    portfolioId: instruc.portfolioId,
                    userId: instruc.tradeId,
                    username: instruc.traderName,
                    accountId: instruc.acctNo,
                    entrustBs: instruc.bsFlag,
                    entrustProp: instruc.bsProp,
                    stockCode: instruc.stockCode,
                    entrustVolume:  instruc.leftVolume,
                    entrustPrice: instruc.price,
                    conNum: instruc.conNum,
                });
    
                sendOrder(order, instruc);
            });

            helper.showSuccess(`快速指令下单数量 = ${quick_instructions.length}，已发送`);
            this.handlers.batchQuickOrderCompleted(quick_instructions);
        }
        catch(ex) {
            helper.showError('批量快速下单，产生错误');
        }
        finally {
            helper.hideLoading(load_index);
        }
    }

    setupComponents() {

        const form = layui.form;
        
        /**
         * 添加提示信息
         */
        let $instrucCheckbox = document.getElementById('instruc-checkbox');

        $instrucCheckbox.addEventListener('mouseover', (e) => {

            if (e.target.nodeName.toLowerCase() == 'span' && e.target.textContent == "待执行") {
                layer.tips('已接收，指令进度 < 100%', e.target, {tips: 3});
            }
            else if (e.target.nodeName.toLowerCase() == 'span' && e.target.textContent == "已执行") {
                layer.tips('指令进度 = 100%，成交进度 < 100%', e.target, {tips: 3});
            }
            else if (e.target.nodeName.toLowerCase() == 'span' && e.target.textContent == "已完成") {
                layer.tips('成交进度 = 100%', e.target, {tips: 3});
            } 
        });

        /**
         * 指令状态搜索
         */

        form.on('checkbox(checkbox-instruc)', data => { 

            let $checkboxs = document.getElementsByName('checkbox-instruc');
            
            if (data.value == '01') {
                
                $checkboxs.forEach(checkbox => {
                    checkbox.checked = data.elem.checked;
                }); 
            } 
            else {
                $checkboxs.forEach(item => {
                    if (item.checked == false) {
                        $checkboxs[0].checked = false;
                    }
                });
            }
            
            form.render('checkbox');
            this.search();
        });

        /**
         * 快速交易限定搜索
         */
        
        let quick_filter = 'switch-quick-order';
        this.$quickSwith = document.getElementById(quick_filter);
        form.on(`switch(${quick_filter})`, data => { this.search(); });

        /**
         * 关键字搜索
         */

        let $keywords = this.$container.querySelector('#keywords-instruc');
        $keywords.addEventListener('keydown', e => { e.keyCode == 13 && this.search(); });
        $keywords.addEventListener('change', e => { this.search(); });
        $keywords.addEventListener('blur', e => { this.search(); });
        this.$keywords = $keywords;

        /**
         * 批量接收、批量放弃、批量快速交易
         */

        let $btn_batch_receive = this.$container.querySelector('#quick-btn-receive');
        let $btn_batch_release = this.$container.querySelector('#quick-btn-release');
        let $btn_quick_batch = this.$container.querySelector('#quick-btn-order');
        let $btn_export = this.$container.querySelector('#quick-btn-export');

        $btn_batch_receive && $btn_batch_receive.addEventListener('click', e => { this.batchReceive(); });
        $btn_batch_release && $btn_batch_release.addEventListener('click', e => { this.batchRelease(); });
        $btn_quick_batch && $btn_quick_batch.addEventListener('click', e => { this.batchOrder(); });
        $btn_export && $btn_export.addEventListener('click', e => { this.exportInstructions(); });

        let $refresh_btn = this.$container.querySelector('#user-toolkit-1');
        $refresh_btn.addEventListener('click', e => { this.refresh(); });
    }

    build() {
        this.setupComponents();
    }
}

export { ModuleToolbar };