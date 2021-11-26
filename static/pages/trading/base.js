
import { JoyinTable } from '../../component/joyin-table';
import { helper } from '../../component/helper';
import { Instruction } from '../../component/models';
import { DataRepo } from '../../component/repos/data-repo';
import { TradingRepo } from '../../component/repos/trading-repo';
import { QuoteRepo } from '../../component/repos/quote-repo';
import { InstructionRepo } from '../../component/repos/instruction-repo';

/**
 * 模块内部资源
 */
const LocalResource = {

    InstructionMap: {},
    ContextInstruction: null,
    TradingDay: null,

    repos: {

        general: null,
        instruction: null,
        quote: null,
        trading: null,
    },
    
    Selectors: {

        tinstruc: '#table-instruction',
        detailp: '#detail-panel',
        bottomp: '#bottom-panel',
        tradingp: '#slides-panel',
        leftp: '#bottom-left-panel',
        rightp: '#bottom-right-panel',
    },

    Classes: {

        hidden: 'is-hidden',
        layshow: 'layui-show',
        laythis: 'layui-this',
    }
};

class BaseModule {

    /**
     * 模块公用样式配置
     */
    static get Classes() {
        return LocalResource.Classes;
    }

    /**
     * 模块公用选择器配置
     */
    static get Selectors() {
        return LocalResource.Selectors;
    }

    /**
     * 建立（更新）全局指令索引
     * @param {Array<Instruction>} instructions 
     */
    static MapInstructions(instructions) {
        instructions.forEach(item => { LocalResource.InstructionMap[item.id] = item; });
    }

    /**
     * 检索期望的指令
     * @param {*} instruction_id 
     * @returns {Instruction}
     */
    static SeekInstruction(instruction_id) {
        return LocalResource.InstructionMap[instruction_id];
    }

    /**
     * 设置为上下文指令对象（作为下属所有交易模块，公用之数据）
     * @param {Instruction} instruction 
     */
    static SetAsContextInstruction(instruction) {

        /** 标记为当前选择指令的交易员ID - 数据访问层将用到 */
        window.instructionTraderId = instruction.tradeId;
        LocalResource.ContextInstruction = instruction;
    }

    /**
     * 设置为平台交易日
     * @param {String} tradingDay 平台交易日，格式 = yyyy-MM-dd
     */
    static SetAsTradingDay(tradingDay) {
        LocalResource.TradingDay = tradingDay;
    }

    /**
     * 扩展TABLE组件选项
     * @param {*} tableOptions 
     */
    static ExtendTableOption(tableOptions) {

        let height = 24;        
        return helper.extend({ headerHeight: height, rowHeight: height, footerHeight: height }, tableOptions);
    }

    /**
     * 设置为兆尹集成环境页面标识
     * @param {String} identity 
     */
    static SetAsJoyinPageId(identity) {
        window.pageId = identity;
    }

    /**
     * 发起一个兆尹工作流
     * @param {String} service_name 提交到目标服务名称 <required>
     * @param {String} button_identity 触发提交form表单的控件 <required>
     * @param {*} data 要提交的form表单数据 <required>
     * @param {Function} callback <optional>
     * @param {Function} errorCallback <optional>
     */
    static StartJoyinWorkflow(service_name, button_identity, data, callback, errorCallback) {
        WorkFlow.doSubmitList(`${window.ServerBaseUrl}/invest/trade/investtrade/exchangesystem/${service_name}`, data, button_identity, 0, callback, errorCallback);
    }

    /**
     * 上下文指令对象
     * @returns {Instruction}
     */
    get instruction() {
        return LocalResource.ContextInstruction;
    }

    /**
     * 当前上下文指令是否OK
     */
    get isInstructionOk() {
        return LocalResource.ContextInstruction instanceof Instruction;
    }

    /**
     * 当前上下文指令是否，仍然可以继续交易
     */
    get isInstructionStillTradable() {
        
        return LocalResource.ContextInstruction instanceof Instruction
                && LocalResource.ContextInstruction.isReceived
                && !LocalResource.ContextInstruction.isCompleted;
    }

    /**
     * 平台交易日（格式yyyy-MM-dd）
     */
    get tradingDay() {
        return LocalResource.TradingDay;
    }

    /**
     * @returns {DataRepo}
     */
    get dataRepo() {
        return LocalResource.repos.general || (LocalResource.repos.general = new DataRepo());
    }

    /**
     * @returns {TradingRepo}
     */
    get tradingRepo() {
        return LocalResource.repos.trading || (LocalResource.repos.trading = new TradingRepo());
    }

    /**
     * @returns {QuoteRepo}
     */
    get quoteRepo() {
        return LocalResource.repos.quote || (LocalResource.repos.quote = new QuoteRepo());
    }

    /**
     * @returns {InstructionRepo}
     */
    get instrucRepo() {
        return LocalResource.repos.instruction || (LocalResource.repos.instruction = new InstructionRepo());
    }

    /**
     * @param {HTMLElement} $container 
     */
    constructor($container) {

        this.$container = $container;
        this.build();
    }

    /**
     * 构建模块功能
     */
    build() {
        throw new Error('not implemented');
    }

    /**
     * 通知该模块进行伸展
     */
    expand() {

        /**
         * 实现展示模块的扩展需求，如：表格横向（或纵向）扩充
         */
    }

    /**
     * 显示该展示模块
     */
    show() {
        this.$container.classList.remove('is-hidden');
    }
    
    /**
     * 隐藏该展示模块
     */
    hide() {
        this.$container.classList.add('is-hidden');
    }

    /**
     * 响应指令变化
     * @param {Instruction} instruction 上下文指令
     */
    takeAction(instruction) {
        console.error('this operation is not applicable for this module', this);
    }

    /**
     * 获取单选组件选中值
     * @param {String} radio_name 单选按钮名称
     * @param {*} default_value 控件未选中，返回默认值
     */
    getRadioValue(radio_name, default_value) {

        let $radios = document.getElementsByName(radio_name);
        for (let idx = 0; idx < $radios.length; idx++) {
            if ($radios[idx].checked) {
                return $radios[idx].value;
            }
        }

        return default_value;
    }

    getCheckboxValue(checkbox_name, default_value) {

        let $checkbox = document.getElementsByName(checkbox_name);
        let chenkboxValue = [];
        
        for (let idx = 0; idx < $checkbox.length; idx++) {
            if ($checkbox[idx].checked) {
                chenkboxValue.push($checkbox[idx].value) ;
            }
        }

        if (chenkboxValue.length > 0) {
            return chenkboxValue
        }
        return default_value;
    }

    /**
     * 创建一个Joyin Table组件
     * @param {*} table_options 
     */
    _createTable(table_options) {

        let row_height = 24;
        let basic_options = {

            headerHeight: row_height,
            rowHeight: row_height,
            footerHeight: row_height,
        };

        /**
         * 场内交易，各个模块内，表格组件公用主键函数
         * @param {*} record 
         */
        function identifier(record) {
            return record.id;
        }

        return new JoyinTable(this.$container, identifier, this, BaseModule.ExtendTableOption(table_options));
    }
}

export { BaseModule };