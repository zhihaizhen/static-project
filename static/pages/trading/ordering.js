
import { helper } from '../../component/helper';
import { dictionary } from '../../component/dictionary';
import { BaseModule } from './base';

import { TradingUnit } from '../../component/units/trading-unit';
import { NormalUnit } from '../../component/units/unit-normal';
import { FutureUnit } from '../../component/units/unit-future';
import { OptionUnit } from '../../component/units/unit-option';
import { BatchUnit } from '../../component/units/unit-batch';
import { EqualUnit } from '../../component/units/unit-equal';
import { ApplyUnit } from '../../component/units/unit-apply';
import { ScaleUnit } from '../../component/units/unit-scale';
import { RepoUnit } from '../../component/units/unit-repo';
import { PledgeUnit } from '../../component/units/unit-pledge';
import { ConstrUnit } from '../../component/units/unit-constr';
import { AlgorithmUnit } from '../../component/units/unit-algorithm';
import { BasketUnit } from '../../component/units/unit-basket';

import {

    Instruction, 
    TickData,
    OrderInfo, 
    BatchOrderInfo,
    AlgoOrderInfo,
    FutureOrderInfo,
    OptionOrderInfo,
    ScaleOrderInfo,
    ConstrOrderInfo,
    RepoOrderInfo,
}

from '../../component/models';

const DefaultHandlers = {

    /**
     * 处置交易单元切换事件
     * @param {TradingUnit} unit
     */
    unitSwitched: function (unit) { throw new Error('not implemented'); },

    /**
     * 处置下单（或审批流程）动作
     * @param {Instruction} instruction 下单（或发起审批流程，要作用于的目标指令）
     * @param {*} feedback 订单|委托，或审批流程已发出（指令标识为下单需审批）的处理结果，当为审批流程发出场景时，feedback = undefined
     */
    orderPlaced: function (instruction, feedback) { throw new Error('not implemented'); },

    /**
     * 检索互为公平交易，的所有指令（包含自身在内）
     * @param {Instruction} source_instruction 
     * @returns {Array<Instruction>}
     */
    siblingSeeker: function (source_instruction) { throw new Error('not implemented'); },

    /**
     * 互为公平交易的列条条目，被选中事件
     * @param {Instruction} instruction
     */
    equalSiblingChanged: function (instruction) { throw new Error('not implemented'); },
};

class ModuleOrdering extends BaseModule {
    
    /**
     * @param {HTMLElement} $container
     */
    constructor($container, handlers = DefaultHandlers) {
        
        super($container);
        this.handlers = handlers;

        /**
         * @returns {Array<TradingUnit>}
         */
        function allocateUnits() {
            return [];
        }

        /**
         * 可适用于当前指令的交易单元
         */
        this.applicables = allocateUnits();

        /**
         * 是否有任何的交易单元，对行情有所需求（初始赋值）
         */
        this.resetTickRequired();
    }

    /**
     * 重置TICK REQUIRED标识
     */
    resetTickRequired() {
        this.isAnyTickRequired = this.applicables.length > 0 && this.applicables.some(item => item.isTickRequired);
    }

    /**
     * 创建所有交易单元的实例
     */
    createUnits() {

        let submitter = this.handleSubmit.bind(this);

        /** 普通交易 */
        this.unormal = new NormalUnit('normal', submitter);
        /** 批量交易 */
        this.ubatch = new BatchUnit('batch', submitter);
        
        /** 公平交易 */
        this.uequal = new EqualUnit('equal', submitter, {

            siblingSeeker: () => { return this.seekSiblings(this.instruction); },
            siblingSelected: (instruction) => { return this.handleSiblingSelected(instruction); },
        });

        /** 算法交易 */
        this.ualgorithm = new AlgorithmUnit('algorithm', submitter);
        /** 篮子交易 */
        this.ubasket = new BasketUnit('basket', submitter);

        /** 申购类交易 */
        this.uapply = new ApplyUnit('apply', submitter);

        /** 期货交易 */
        this.ufuture = new FutureUnit('future', submitter);
        /** 期权交易 */
        this.uoption = new OptionUnit('option', submitter);

        /** 大宗交易 */
        this.uscale = new ScaleUnit('scale', submitter);
        /** 回购交易 */
        this.urepo = new RepoUnit('repo', submitter);
        /** 质押出入质 */
        this.upledge = new PledgeUnit('pledge', submitter);
        /** 固定收益交易 */
        this.uconstr = new ConstrUnit('constr', submitter);

        /**
         * 所有交易单元类实例
         */

        let units = [

            this.unormal,
            this.ubatch,
            this.uequal,
            this.ualgorithm,
            this.ubasket,

            this.uapply,

            this.ufuture,
            this.uoption,

            this.uscale,
            this.urepo,
            this.upledge,
            this.uconstr,
        ];

        function bindValidateRule() {

            let formRules = {};

            units.forEach(item => {

                let rules = item.getValidateRule();
                if (!helper.isJson(rules)) {
                    return;
                }

                for (let ruleKey in rules) {
                    
                    let validator = rules[ruleKey];
                    if (typeof validator == 'function') {
                        formRules[ruleKey] = validator;
                    }
                }
            });

            layui.use('form', () => { layui.form.verify(formRules); });
        }

        bindValidateRule();
        return units;
    }

    /**
     * 促使所有，适配当前指令的交易单元，与指令信息保持一次表单重置
     */
    syncUnits() {
        this.applicables.forEach(unit => { unit.sync(); });
    }

    /**
     * 响应交易单元下单数据提交
     * @param {*} order 
     */
    handleSubmit(order) {

        let thisObj = this;

        /**
         * 执行下单完成（或审批流程已发出）回调
         * @param {*} instruction 
         * @param {*} order_feedback 
         */
        function callback(instruction, order_feedback) {

            /**
             * 下单（发起审批）后，重设所有适配的交易单元
             */

            thisObj.handlers.orderPlaced(instruction, order_feedback);
        };

        this.placeOrder(order, callback);
    }

    /**
     * 响应交易单元下单数据提交
     * @param { OrderInfo 
        *        | BatchOrderInfo 
        *        | AlgoOrderInfo 
        *        | FutureOrderInfo 
        *        | OptionOrderInfo 
        *        | ScaleOrderInfo 
        *        | ConstrOrderInfo 
        *        | RepoOrderInfo } order 
     * @param {Function} internalCallback 下单模块内部callback
     */
    async placeOrder(order, internalCallback) {

        let instruction = this.instruction;
        let { startDate, endDate } = instruction;
        let tradingDay = this.tradingDay;

        if (!tradingDay) {

            helper.showError('平台日信息，未获得');
            return;
        }
        else if (startDate > tradingDay) {

            helper.showError(`指令开始日 ${ startDate } > 平台日 ${ tradingDay }，暂不可交易`);
            return;
        }
        else if (endDate < tradingDay) {

            helper.showError(`指令结束日 ${ endDate } < 平台日 ${ tradingDay }，已过期`);
            return;
        }

        if (instruction.approverFlag) {
            
            try {

                let flowCallback = function () {

                    /**
                     * 后端审批流程对指令的短期影响（典型，如冻结数量信息等）未可知，作一定延迟，尽可能使场内交易界面的数据状态接近真实
                     */
                    setTimeout(() => { internalCallback(instruction); }, 500);
                }

                if (order instanceof OrderInfo || order instanceof FutureOrderInfo) { 
                
                    BaseModule.SetAsJoyinPageId('TrdExchange002');
                    BaseModule.StartJoyinWorkflow('TrdExchange002/save', 'TrdExchange002_btn_submit', order, flowCallback);
                }
                else {
    
                    BaseModule.SetAsJoyinPageId('TrdExchange003');
                    BaseModule.StartJoyinWorkflow('TrdExchange003/save', 'TrdExchange003_btn_submit', order, flowCallback);
                }
            }
            catch(ex) {
                helper.showError(`工作流启动发生异常，${ ex.message }`);
            }
        }
        else {

            let resp = await this.tradingRepo.placeOrder(order, instruction);

            if (resp.errorCode == 0) {
            
                internalCallback(instruction, resp.data);
                helper.showSuccess('委托已发送');
            }
            else {
                helper.showError(`订单发送出现错误，${ resp.errorCode }/${ resp.errorMsg }`);
            }
        }
    }

    /**
     * 监听交易单元TAB切换
     * @param {HTMLElement} $tab 
     */
    handleUnitSwitch($tab) {
        
        let matched = this.units.find(x => x.$title === $tab);

        if (matched instanceof TradingUnit) {

            /**
             * 通过回调函数，通知感兴趣的订阅者，交易单元产生了变更
             */
            this.handlers.unitSwitched(matched);
        }
        else {
            console.error('no trading unit matching the given tab', $tab);
        }
    }

    /**
     * 检索互为公平交易，的所有指令（包含自身在内）
     * @param {Instruction} source_instruction 
     * @returns {Array<Instruction>}
     */
    seekSiblings(source_instruction) {
        return this.handlers.siblingSeeker(source_instruction);
    }

    /**
     * 处理互为公平交易的指令列表，选中事件
     * @param {Instruction} instruction 
     */
    handleSiblingSelected(instruction) {
        return this.handlers.equalSiblingChanged(instruction);
    }

    /**
     * 提取适用于当前指令的交易单元
     * @param {Instruction} instruction 
     * @returns {Array<TradingUnit>} 支持当前指令的交易单元列表
     */
    qualify(instruction) {
        
        var $qualifies = [];
        
        if (instruction.isRegular) {

            let siblings = this.seekSiblings(instruction);
            let isEqual = siblings.length >= 2;

            if (isEqual) {
                $qualifies.push(this.uequal);
            }
            else {

                $qualifies.push(this.unormal);
                $qualifies.push(this.ubatch);
                
                /**
                 * mark: 暂时屏蔽算法交易
                 */

                // $qualifies.push(this.ualgorithm); 
            }
        }
        
        if (instruction.isFuture) {
            
            let siblings = this.seekSiblings(instruction);
            let isEqual = siblings.length >= 2;
            
            if (isEqual) {
                $qualifies.push(this.uequal);
            }
            else {
                $qualifies.push(this.ufuture);
                // $qualifies.push(this.ubatch);暂时期货不考虑公平交易去掉。
            }
        }

        if (instruction.isBasket) {
            $qualifies.push(this.ubasket);
        }

        if (instruction.isApply) {
            $qualifies.push(this.uapply);
        }

        if (instruction.isPledge) {
            $qualifies.push(this.upledge);
        }

        if (instruction.isOption) {
            $qualifies.push(this.uoption);
        }
        
        if (instruction.isScale) {
            $qualifies.push(this.uscale);
        }
        
        if (instruction.isRepo) {
            $qualifies.push(this.urepo);
        }

        if (instruction.isConstr) {
            $qualifies.push(this.uconstr);
        }

        return $qualifies;
    }

    /**
     * 设置为当前展示状态下的交易单元
     * @param {TradingUnit} unit 
     */
    setAsFocused(unit) {
        this.focusedUnit = unit;
    }

    /**
     * 显示适用的交易单元 & 隐藏非适用的交易单元
     * @param {Array<TradingUnit>} targetUnits 
     */
    showUnits(targetUnits) {

        if (targetUnits.length == 0) {

            this.setAsFocused(undefined);
            return;
        }
        
        this.setAsFocused(targetUnits[0]);

        /**
         * 遍历所有交易单元，显示或隐藏，每一个交易单元
         */
        
        this.units.forEach(item => {

            if (item === this.focusedUnit) {
                item.focusTab();
            }
            else if (targetUnits.includes(item)) {
                item.showTab();
            }
            else {
                item.hide();
            }
        });
    }

    expand() {

        this.uequal.fitTableColumnWith();
        this.uscale.fitTableColumnWith();
        this.uconstr.fitTableColumnWith();
        this.ubasket.fitTableColumnWith();
    }

    /**
     * @param {Instruction} instruction
     */
    takeAction(instruction) {

        let $qualifies = this.qualify(instruction);
        this.applicables.clear();
        this.applicables.merge($qualifies);

        /**
         * 按适用的交易单元，重置对TICK数据依赖标识
         */
        this.resetTickRequired();
        
        /**
         * 展示适用的交易单元
         */
        this.showUnits($qualifies);
        
        /**
         * 首先，重置所有交易单元，（可能）残留的展示出来的TICK行情数据
         */
        this.brocastTick(null);

        /**
         * 无任何适用的交易单元
         */

        if ($qualifies.length == 0) {
            return;
        }
        
        /**
         * 为适用的交易单元，设置上下文指令信息
         */

        $qualifies.forEach(item => { item.setInstruction(instruction); });

        /**
         * 如果适用的交易单元，至少有一个交易单元，对行情有依赖，则需要请求行情
         */
        if (this.isAnyTickRequired) {
            this.requestLastTick();
        }

        /**
         * 将默认展示的交易单元，向外层传递（无任何适用交易单元的场景，已经在外层模块作过导向）
         */
        this.handlers.unitSwitched(this.focusedUnit);
    }

    /**
     * 向适用的交易单元，广播行情数据
     * @param {TickData} tickData TICK数据
     */
    brocastTick(tickData) {

        this.applicables.forEach(item => {

            /**
             * 仅对行情依赖型交易单元推送TICK行情
             */

            if (item.isTickRequired) {
                item.setTick(tickData);
            }
        });
    }

    /**
     * 请求上下文合约行情
     */
    async requestLastTick() {

        var stock_code = this.instruction.stockCode;
        var tick_data = await this.quoteRepo.queryLastTick(stock_code);
        this.brocastTick(helper.isNotNone(tick_data) ? new TickData(tick_data, stock_code) : null);
    }

    /**
     * 保持行情刷新作业
     */
    keepTickRefreshed() {

        return setInterval(async () => {

            if (this._isRequesting || !this.isInstructionOk || !this.isAnyTickRequired) {
                return;
            }

            this._isRequesting = true;
            await this.requestLastTick();
            this._isRequesting = false;

        }, 1000 * 5);
    }

    build() {

        this.units = this.createUnits();
        layui.element.on('tab(unit-list-tab)', (evt) => { this.handleUnitSwitch(evt.elem.context); });
        this.tickJob = this.keepTickRefreshed();
    }
}

export { ModuleOrdering };