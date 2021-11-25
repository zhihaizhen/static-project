import { helper } from '../helper';
import { TradingUnit, NumberControl, SelectControl, BaseUserControl } from './trading-unit';
import { dictionary } from '../dictionary';
import { JoyinTable } from '../joyin-table';
import { Instruction, PledgedInstrument, RepoQuote } from '../models';

const RepoOpers = dictionary.repoOperation;
const Dir = dictionary.direction;
const NumberElementOptions = {

    /**
     * 最大值
     */
    max: 0,

    /**
     * 最小值
     */
    min: 0,

    /**
     * 步长
     */
    step: 0,

    /**
     * 数值小数精度（默认 = 0）
     */
    precision: 0,

    /**
     * 是否使用千分位分割数值（默认 = false）
     */
    enableComma: false,

    /**
     * 是否作为整数对待
     */
    asInteger: false,

    /**
     * 内容变化回调函数
     */
    handler: function (cur_value) {
        /** not implemented */
    },
};

const UserElementOptions = {

    /**
     * 用户元素LABEL字样
     */
    label: null,

    /**
     * 用户元素计量单位LABEL字样
     */
    unitLabel: '',

    /**
     * 用户元素绑定数据元素（名称）
     */
    property: null,

    /**
     * 在下单时，该用户元素，应当映射的字段名称（如未提供，则与所绑定的数据元素，字段名称保持一致）
     */
    exposedProperty: null,

    /**
     * 出席订单参数，是否作为普通字符串类型（默认 = false）
     */
    asText: false,

    /**
     * 用户要素在，6种回购操作场景 * 正逆回购方向 * 市场，可读可写规则（配置总数 = 12）
     */
    rules: 'RW,RW,RW,RW,RW,RW,RW,RW,RW,RW,RW,RW',

    /**
     * 用户要素在，6种回购操作场景，下单时，参数必要性规则（配置总数 = 6）
     */
    necessaries: 'Y,Y,Y,Y,Y,Y',

    /**
     * 用户要素控件DOM结构（字符串）
     */
    template: null,

    /**
     * 用户要素控件最大输入长度（字符串）
     */
    maxlen: 50,

    /**
     * 用户要素控件验证规则（字符串）
     */
    verify: '',

    /**
     * 要素高级选项（针对具有递增、递减功能的数值输入要素，具有普适性）
     */
    advanced: NumberElementOptions,

    /**
     * 用户要素，输出值转换器（期望值类型，方法）
     * @param {Number|String} value 要素原始输出值
     * @param {UserElement} element
     */
    converter: null,
};

const Verifies = {

    /**
     * 非必填，无需验证（内容缺省，可接受）
     */
    optional: '',

    /**
     * 填写即可（内容不可缺省）
     */
    required: 'required',

    /**
     * 必填，且按照对应字段默认映射的验证方法，进行规则验证
     */
    nameRegulated: 'name-regulated',
};

const Templates = {

    text: `<div class="layui-inline {property} repo-{property}">
                <label class="layui-form-label">{label}</label>
                <div class="layui-input-inline">
                    <input type="text" name="{property}" maxlength="{maxlen}" lay-verify="{verify}" autocomplete="off" class="layui-input">
                </div>
            </div>`,

    number: `<div class="layui-inline {property} repo-{property}">
                <label class="layui-form-label">{label}</label>
                <div class="layui-input-inline">
                    <div class="number-ctr">
                        <button type="button" class="decrease-button">-</button>
                        <input type="text" name="{property}" maxlength="{maxlen}" lay-verify="{verify}" autocomplete="off" class="layui-input" value="0">
                        <button type="button" class="increase-button">+</button>
                    </div>
                </div>
            </div>`,

    select: `<div class="layui-inline {property} repo-{property}">
                <label class="layui-form-label">{label}</label>
                <div class="layui-input-inline">
                    <select name="{property}" lay-verify="{verify}"></select>
                </div>
            </div>`,
};

const RuleSetting = `201,RW,上海R/深圳RW,R,R,R,R,R,R,上海RW/深圳R,上海R/深圳R,N,N
                    202,RW?,上海R/深圳RW?,R,R,R,R,N,N,R,R,R,R
                    203,RW?,上海R/深圳RW?,R,R,R,R,N,N,R,R,R,R
                    204,R,R,R,R,R,R,N,N,R,R,R,R
                    205,RW,上海R/深圳RW,R,R,R,R,N,N,上海RW/深圳R,上海R/深圳R,N,N
                    206,RW,上海R/深圳RW,R,R,R,R,N,N,R,R,R,R
                    207,R,R,R,R,R,R,N,N,R,R,R,R
                    208,R,R,R,R,R,R,R,R,R,R,N,N
                    209,R,R,R,R,R,R,R,R,R,R,N,N
                    210,R,R,R,R,R,R,N,N,R,R,N,N
                    211,RW,上海R/深圳RW,上海R/深圳RW,上海R/深圳RW,RW,RW,R,R,RW,上海R/深圳RW,N,N
                    212,R,R,R,R,R,R,N,N,R,R,N,N
                    213,R,R,R,R,R,R,R,R,R,R,N,N
                    214,上海RW,上海R,上海RW,N,上海RW,上海RW,上海RW,N,上海RW,N,上海RW,N
                    215,RW?,上海R/深圳RW?,R,R,R,R,R,R,上海RW?/深圳R,R,R,R
                    216,上海RW,上海R,上海RW,N,上海RW,上海RW,上海RW,N,上海RW,N,上海RW,N
                    217,N,上海R,N,N,N,上海R,N,上海R,N,上海R,N,上海R
                    218,上海RW,上海R,上海RW,上海R,上海RW,上海RW,上海RW,上海R,上海RW,上海R,上海RW,上海R
                    219,深圳RW,深圳RW,深圳RW,深圳RW,深圳RW,深圳RW,N,N,深圳RW,深圳RW,N,N
                    220,深圳RW,深圳RW,深圳RW,深圳RW,深圳RW,深圳RW,N,N,深圳RW,深圳RW,N,N
                    221,N,N,上海R,上海R,上海R,上海R,上海R,上海R,上海R,上海R,上海R,上海R
                    222,N,N,深圳R,深圳R,深圳R,深圳R,N,N,深圳R,深圳R,N,N
                    223,N,N,N,N,N,N,RW?,R,N,N,N,N
                    224,N,N,N,N,N,N,RW?,R,N,N,N,N
                    225,N,N,N,N,N,N,RW,R,N,N,N,N
                    226,N,N,N,N,N,N,RW,R,N,N,N,N
                    227,N,N,N,N,N,N,R,R,N,N,N,N
                    228,N,N,N,N,N,N,R,R,N,N,N,N
                    229,N,N,N,N,N,N,R,R,N,N,N,N
                    230,N,N,N,N,N,N,R,R,N,N,N,N
                    231,N,N,N,N,N,N,R,R,N,N,N,N`;

const RuleMap = RuleSetting.split('\n').filter(item => item.length > 0).map(item => item.trim()).groupBy(item => item.substr(0, 3));

function GetRule(ruleNo) {
    return RuleMap[ruleNo][0].substr(4);
}

/**
 * 要素行为属性
 */
class Behavior {

    /**
     * 获取特定于市场的规则
     * @param {Boolean} isShMarket 是否为沪市
     */
    getRule(isShMarket) {

        let markable = isShMarket ? this.shMarkables : this.szMarkables;
        
        return {

            /** 是否，不适用于该市场 */
            isUnsuitable: markable.isUnsuitable,
            /** 是否为只读 */
            isReadonly: markable.isReadonly,
            /** 是否为半写入（原始取值若存在，则不可写；原始取值若缺省，则允许写入） */
            isHalfWritable: markable.isHalfWritable,
            /** 是否完全可写 */
            isWritable: markable.isWritable,
        };
    }

    /**
     * @param {String} ruleStr 
     */
    constructor(ruleStr) {

        this.shMarket = '上海';
        this.szMarket = '深圳';

        let characters = ruleStr.toUpperCase().split('/').slice(0, 2).map(item => item.trim());
        let diff_by_market = characters.length == 2;

        if (diff_by_market) {

            let shInfo = characters.find(item => item.indexOf(this.shMarket) == 0);
            let szInfo = characters.find(item => item.indexOf(this.szMarket) == 0);
            if (shInfo && szInfo) {
                this._analyze(shInfo, szInfo);
            }
            else {

                /**
                 * 该要素，状态属性，设置非法，无法进行解析
                 */
                this.isInvalid = true;
                console.error(`rule string [${ ruleStr }] is invalid`);
            }
        }
        else {

            let flag = characters[0];
            let onlySh = flag.indexOf(this.shMarket) >= 0;
            let onlySz = flag.indexOf(this.szMarket) >= 0;

            if (onlySh) {

                /**
                 * 限定了沪市，则深市不适用
                 */
                this._analyze(flag, 'N');
            }
            else if (onlySz) {

                /**
                 * 限定了深市，则沪市不适用
                 */
                this._analyze('N', flag);
            }
            else {

                /**
                 * 未限定市场，则沪深市场均适用同一规则
                 */
                this._analyze(flag, flag);
            }
        }
    }

    /**
     * 分析提取，要素于两市的行为规则
     * @param {String} shFlag 
     * @param {String} szFlag 
     */
    _analyze(shFlag, szFlag) {

        /**
         * @param {String} flag 
         */
        function resolve(flag) {

            return {

                /**
                 * 当前要素不适合（需隐藏）
                 */
                isUnsuitable: flag == 'N',
                isReadonly: flag == 'R',
                isHalfWritable: flag.indexOf('W?') >= 0,
                isWritable: flag.indexOf('?') < 0 && flag.indexOf('W') >= 0,
            };
        }

        this.shMarkables = resolve(shFlag.replace(this.shMarket, ''));
        this.szMarkables = resolve(szFlag.replace(this.szMarket, ''));
    }
}

const Resources = {

    $formInnerContainer: document.createElement('div'),
};

/**
 * 用户输入项
 */
class UserElement {

    /**
     * 设置用户输入要素容器
     * @param {HTMLElement} $container 
     */
    static SetContainer($container) {
        Resources.$formInnerContainer = $container;
    }

    /**
     * 格式化验证方法名称
     * @param {String} property 
     */
    static formatValidatorName(property) {
        return 'validate' + property.substr(0, 1).toUpperCase() + property.substr(1);
    }

    /**
     * @param {TradingUnit} unit 
     */
    constructor(unit, options = UserElementOptions) {

        this.unitIns = unit;
        /** 要素控件文字说明 */
        this.label = options.label;
        /** 要素控件内容，度量单位文字 */
        this.unitLabel = options.unitLabel;
        /** 要素所绑定数据，的字段名称 */
        this.property = options.property;
        /** 下单时，该要素出席时，应映射的新名称 */
        this.exposedProperty = typeof options.exposedProperty == 'string' ? options.exposedProperty.trim() : null;
        /** 要素原始值格式化器 */
        this.converter = options.converter;

        let validator = this.verify = options.verify;
        if (validator == Verifies.nameRegulated) {
            validator = UserElement.formatValidatorName(this.property);
        }

        let templateStr = options.template.replace(new RegExp('\{label\}', 'g'), this.label)
                                          .replace(new RegExp('\{property\}', 'g'), this.property)
                                          .replace(new RegExp('\{maxlen\}', 'g'), options.maxlen)
                                          .replace(new RegExp('\{verify\}', 'g'), validator);

        Resources.$formInnerContainer.appendChild(document.createElement('div'));
        Resources.$formInnerContainer.lastElementChild.outerHTML = templateStr;
        this.$node = Resources.$formInnerContainer.lastElementChild;

        if (helper.isNotNone(options.rules)) {
            this._extractRules(options.rules.split(',').map(item => item.trim()));
        }

        if (helper.isNotNone(options.necessaries)) {
            this._extractNecessaries(options.necessaries.split(',').map(item => item.trim()));
        }
    }

    /**
     * @param {BaseUserControl} control 
     */
    _setAsControl(control) {
        this.control = control;
    }

    /**
     * 提取要素，对于不同协议回购操作，的行为规则
     * @param {Array<String>} rules 规则列表
     */
    _extractRules(rules) {

        if (rules.length != 12) {

            console.error('user element rules.length != 12', this);
            return;
        }

        this.behaviors = [
            
            /** 首期，状态行为  */
            { positive: new Behavior(rules[0]), reversed: new Behavior(rules[1]) },
            /** 到期购回，状态行为  */
            { positive: new Behavior(rules[2]), reversed: new Behavior(rules[3]) },
            /** 提前购回，状态行为  */
            { positive: new Behavior(rules[4]), reversed: new Behavior(rules[5]) },
            /** 中途换券，状态行为  */
            { positive: new Behavior(rules[6]), reversed: new Behavior(rules[7]) },
            /** 到期续作，状态行为  */
            { positive: new Behavior(rules[8]), reversed: new Behavior(rules[9]) },
            /** 解除质押，状态行为  */
            { positive: new Behavior(rules[10]), reversed: new Behavior(rules[11]) },
        ];
    }

    /**
     * 提取要素，对于不同协议回购操作，的出席必要性
     * @param {Array<String>} necessaries 规则列表
     */
    _extractNecessaries(necessaries) {

        if (necessaries.length != 6) {

            console.error('user element necessaries.length != 6', this);
            return;
        }

        this.necessaries = [

            necessaries[0].toUpperCase() == 'Y',
            necessaries[1].toUpperCase() == 'Y',
            necessaries[2].toUpperCase() == 'Y',
            necessaries[3].toUpperCase() == 'Y',
            necessaries[4].toUpperCase() == 'Y',
            necessaries[5].toUpperCase() == 'Y',
        ];
    }

    /**
     * 要素当前值
     */
    get value() {
        return this.control.value;
    }

    /**
     * 要素当前值（原始内容）
     */
    get plainValue() {
        return this.control instanceof NumberControl ? this.control.plainValue : this.control.value;
    }

    /**
     * 给要素设置一个值
     */
    setValue(value) {
        return this.control.setValue(value);
    }

    /**
     * 展示要素
     */
    show() {
        this.control.show();
    }

    /**
     * 隐藏要素
     */
    hide() {
        this.control.hide();
    }

    /**
     * 要素是否展示中
     */
    get isShowing() {
        return this.control.isShowing();
    }

    /**
     * 要素是否隐藏中
     */
    get isHidden() {
        return this.control.isHidden();
    }

    /**
     * 要素是否只读状态
     */
    get isReadonly() {
        return this.control.isReadonly === true;
    }

    /**
     * 要素设置为可编辑状态
     */
    enable() {
        this.control.enable();
    }

    /**
     * 要素设置为只读状态
     */
    disable() {
        this.control.disable();
    }
}

/**
 * 用户选择要素
 */
class SelectElement extends UserElement {

    /**
     * @returns {SelectControl}
     */
    get typedControl() {
        return this.control;
    }

    /**
     * @param {TradingUnit} unit 
     * @param {Function} handler 
     */
    constructor(unit, options = UserElementOptions, handler) {

        super(unit, options);
        this._setAsControl(new SelectControl({

            unit: this.unitIns,
            $control: this.$node,
            handler: handler,
        }));
    }
}

/**
 * 用户输入要素
 */
class TextElement extends UserElement {

    /**
     * @returns {NumberControl}
     */
    get typedControl() {
        return this.control;
    }

    /**
     * @param {TradingUnit} unit 
     */
    constructor(unit, options = UserElementOptions) {

        super(unit, options);

        let mixedOptions = {};
        helper.extend(mixedOptions, {

            unit: this.unitIns,
            unitLabel: this.unitLabel,
            bizName: this.label,
            asText: options.asText,
            $control: this.$node,
        });
        helper.extend(mixedOptions, options.advanced);
        this._setAsControl(new NumberControl(mixedOptions));
    }
}

class RepoUnit extends TradingUnit {

    get unitHeight() {
        return 450;
    }

    get isTickRequired() {
        return false;
    }

    /**
     * 回购操作类型
     */
    get repoOperation() {
        return this.instruction.repoOperation;
    }

    /**
     * 是否为首期
     */
    get isRepoSq() {
        return this.repoOperation == RepoOpers.establish.code;
    }

    /**
     * 是否为到期购回
     */
    get isRepoDqgh() {
        return this.repoOperation == RepoOpers.terminate.code;
    }

    /**
     * 是否为到期续作
     */
    get isRepoDqxz() {
        return this.repoOperation == RepoOpers.renew.code;
    }

    /**
     * 是否为提前购回
     */
    get isRepoTqgh() {
        return this.repoOperation == RepoOpers.precede.code;
    }

    /**
     * 是否为中途换券
     */
    get isRepoZthq() {
        return this.repoOperation == RepoOpers.change.code;
    }

    /**
     * 是否为解除质押
     */
    get isRepoJczy() {
        return this.repoOperation == RepoOpers.release.code;
    }

    /**
     * 是否原始质押券缺失
     */
    get isSourcePledgeAbsent() {
        return this.instruction.pledgeList.length == 0;
    }

    /**
     * 首条质押券（无，或有且仅有1条质押券）
     */
    get firstPledged() {

        if (!this.isSourcePledgeAbsent) {
            return this.instruction.pledgeList[0];
        }
        else {

            return new PledgedInstrument(this.instruction, {

                entrustId: 0,
                finprodMarketId: null,
                finprodAbbr: null,
                pledgeFaceValue: 0,
                pledgeNumber: 0,
                pledgeRatio: 0,
                pledgeAmt: 0,
            });
        }
    }

    /**
     * 是否对对手方行情有所依赖
     */
    get isQuoteRequired() {

        /**
         * 暂不考虑支持交易员人为选择对手方行情
         */
        return;
        return this.isShSecMarket && this.isReversedRepo;
    }

    /**
     * 点选的对手行情
     * @returns {RepoQuote}
     */
    get selectedQuote() {
        return this.tquote.selectedRow;
    }

    /**
     * 行情条数
     */
    get quoteCount() {
        return this.tquote.rowCount;
    }

    /**
     * 质押券面额
     */
    get decidedPaperValue() {
        return this.isSourcePledgeAbsent ? 100 : +this.firstPledged.paperValue;
    }

    /**
     * 交易对手Id
     */
    get counterId() {
        return this.instruction.counterId;
    }
    
    /**
     * 协议回购数量步长限定为1，不挂钩资产类型
     */
    get repoVolumeStep() {

        return 1;
        // return this.contextVolumeStep;
    }

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {

        super(identifier, submitter);
        this.setUnitName(TradingUnit.UnitNames.repo);
    }

    createQuoteTable() {

        /**
         * 暂不考虑支持交易员人为选择对手方行情
         */
        return;

        this.tquote = new JoyinTable(document.getElementById('repoTable'), this.identifyRecord_tquote, this, {
            
            tableName: 'joyin-table-quotationTable',
            headerHeight: this.settings.rowheight,
            rowHeight: this.settings.rowheight,
            footerHeight: this.settings.rowheight,
            pageSize: 999999,
            rowSelected: this.handleQuoteSelected.bind(this),
        });

        this.tquote.setMaxHeight(160);
    }

    /**
     * @param {RepoQuote} record 
     */
    identifyRecord_tquote(record) {
        return record.entrustNo;
    }

    createUserElements() {

        // 静态只读要素
        
        this.elePortfolioName = new TextElement(this, {

            label: '组合名称', 
            property: 'portfolioName', 
            template: Templates.text, 
            verify: Verifies.required,
            asText: true,
        });

        this.eleAccountName = new TextElement(this, { 

            label: '资金账号', 
            property: 'tradeAccountId', 
            template: Templates.text, 
            verify: Verifies.required,
            asText: true,
        });

        this.eleDirection = new SelectElement(this, { 

            label: '委托方向', 
            property: 'direction', 
            template: Templates.select, 
            verify: Verifies.required,
        });

        this.eleMarketId = new SelectElement(this, { 

            label: '交易市场',
            property: 'marketId', 
            template: Templates.select, 
            verify: Verifies.required,
        });

        this.eleTermDays = new TextElement(this, { 

            label: '回购期限', 
            unitLabel: '天',
            property: 'termDays',
            template: Templates.text,
            verify: Verifies.optional,
            asText: true,
        });

        // 其他场景类字段

        this.eleRepoAmount = new TextElement(this, {

            label: '回购金额',
            unitLabel: '元',
            property: 'repoAmount',
            exposedProperty: 'entrustBalance',
            maxlen: 15,
            rules: GetRule(201),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.text,
            verify: Verifies.nameRegulated,
            advanced: {

                enableComma: true,
                step: 0.01,
                precision: 2,
                handler: this._handleRepoAmountChange.bind(this),
            },
		});
            
        this.elePledgedStock = new TextElement(this, {

            label: '质押券代码',
            property: 'pledgedStockCode',
            exposedProperty: 'stockCode',
            maxlen: 20,
            rules: GetRule(202),
            necessaries: 'Y,Y,Y,N,Y,Y',
            asText: true,
            template: Templates.text,
            verify: Verifies.nameRegulated,
        });
        
        this.elePledgedStockName = new TextElement(this, {

            label: '质押券名称',
            property: 'pledgedStockName',
            maxlen: 20,
            rules: GetRule(203),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.optional,
            asText: true,
        });

        this.elePledgedMaxVolume = new TextElement(this, {

            label: '质押券总数',
            property: 'maxPledgedVolume', 
            unitLabel: '张',
            maxlen: 12,
            rules: GetRule(204),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.optional,
            advanced: {
                asInteger: true,
            }
        });

        this.elePledgeRatio = new TextElement(this, {

            label: '折算比例',
            unitLabel: '%',
            property: 'pledgeRatio',
            exposedProperty: 'discount',
            maxlen: 6,
            rules: GetRule(205),
            necessaries: 'Y,Y,Y,N,Y,N',
            template: Templates.number,
            verify: Verifies.nameRegulated,
            advanced: {
                
                max: 100,
                min: 0,
                step: 0.01,
                precision: 2,
                handler: this._handlePledgeRateChange.bind(this),
            },
            converter: this.convertPledgeRatio.bind(this),
        });

        this.elePledgedVolume = new TextElement(this, {

            label: '质押数量',
            unitLabel: '张',
            property: 'totalVolume',
            exposedProperty: 'entrustVolume',
            maxlen: 12,
            rules: GetRule(206),
            necessaries: 'Y,Y,Y,N,Y,Y',
            template: Templates.number, 
            verify: Verifies.nameRegulated,
            advanced: {

                asInteger: true,
                enableComma: true,
                max: () => { return this.isSourcePledgeAbsent ? 999999999 : this.firstPledged.totalVolume; },
                min: 0,
                step: () => { return this.repoVolumeStep; },
                handler: this._handlePledgedVolumeChange.bind(this),
            },
        });

        this.elePaperAmount = new TextElement(this, {

            label: '券面总额',
            unitLabel: '元',
            property: 'paperAmount',
            maxlen: 15,
            rules: GetRule(207),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.nameRegulated,
            advanced: {

                step: 0.01,
                precision: 2,
            }
		});

        this.eleFirstSettleDate = new TextElement(this, { 

            label: '首次结算日',
            property: 'firstSettleDate',
            maxlen: 10,
            rules: GetRule(208),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
            converter: (date) => { return typeof date == 'string' ? date.replace(/-/g, '') : date; },
		});

        this.eleMaturityDate = new TextElement(this, {

            label: '到期结算日',
            property: 'maturityDate',
			exposedProperty: 'backDate',
            maxlen: 10,
            rules: GetRule(209),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
            converter: (date) => { return typeof date == 'string' ? date.replace(/-/g, '') : date; },
		});

        this.eleOccupyDays = new TextElement(this, { 

            label: '占款天数',
            unitLabel: '天',
            property: 'occupyDays',
            maxlen: 3,
			rules: GetRule(210),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
		});

        this.eleRepoRate = new TextElement(this, {

            label: '回购利率',
            unitLabel: '%',
            property: 'price',
            exposedProperty: 'entrustPrice',
            maxlen: 6,
            rules: GetRule(211),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.number, 
            verify: Verifies.nameRegulated,
            advanced: {

                max: 100,
                min: 0,
                step: 0.01,
                precision: 2,
                handler: this._handleRepoRateChange.bind(this),
            },
        });

        this.eleInterest = new TextElement(this, {

            label: '回购利息',
            unitLabel: '元',
            property: 'interest',
            maxlen: 8,
            rules: GetRule(212),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            advanced: {
                enableComma: true,
            },
        });
        
        this.eleMaturitySettleAmount = new TextElement(this, {

            label: '到期结算额',
            unitLabel: '元',
            property: 'maturitySettleAmount',
            exposedProperty: 'backBalance',
            maxlen: 15,
            rules: GetRule(213),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            advanced: {

                step: 0.01,
                enableComma: true,
            },
		});

        this.eleOurTrader = new SelectElement(this, {

            label: '本方交易员',
            property: 'ourTrader',
            exposedProperty: 'sellerNo',
            maxlen: 10,
            rules: GetRule(214),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.select, 
            verify: Verifies.nameRegulated,
		});

        this.eleCounterId = new SelectElement(this, { 

            label: '交易对手',
            property: 'counterName',
            exposedProperty: 'liaisonName',
            maxlen: 20,
            rules: GetRule(215),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.select, 
            verify: Verifies.nameRegulated,
		});

        this.eleCounterTrader = new SelectElement(this, { 

            label: '对手交易员',
            property: 'counterTrader',
            exposedProperty: 'liaisonTel',
            maxlen: 10,
            rules: GetRule(216),
            necessaries: 'Y,Y,Y,Y,Y,Y',
            template: Templates.select,
            verify: Verifies.nameRegulated,
        });

        this.eleExchangeRequestId = new TextElement(this, { 

            label: '请求号',
            property: 'exchangeRequestId',
            exposedProperty: 'contractId',
            necessaries: 'Y,N,Y,Y,Y,Y',
            maxlen: 30,
			rules: GetRule(217),
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleRemark = new TextElement(this, {

            label: '补充协议',
            property: 'remark',
            maxlen: 200,
            rules: GetRule(218),
            necessaries: 'Y,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleOppoSeat = new SelectElement(this, {

            label: '对手席位',
            property: 'counterSeat',
            exposedProperty: 'propSeatNo',
            maxlen: 30,
            rules: GetRule(219),
            necessaries: 'Y,Y,Y,N,Y,N',
            template: Templates.select,
            verify: Verifies.nameRegulated,
		});

        this.eleAppointmentNumber = new TextElement(this, { 

            label: '约定号',
            property: 'appointmentNumber',
            exposedProperty: 'contractId',
            maxlen: 30,
            rules: GetRule(220),
            necessaries: 'Y,Y,Y,N,Y,N',
            template: Templates.text,
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleDealNo = new TextElement(this, {

            label: '成交编号',
            property: 'dealNo',
            exposedProperty: 'origSerialNo',
            maxlen: 30,
            rules: GetRule(221),
            necessaries: 'N,Y,Y,Y,Y,Y',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleOriginalDealNo = new TextElement(this, {

            label: '初始交易编号',
            property: 'trdMatchId',
            exposedProperty: 'origSerialNo',
            maxlen: 30,
            rules: GetRule(222),
            necessaries: 'N,Y,Y,N,Y,N',
            template: Templates.text,
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleNewPledgedStock = new TextElement(this, {

            label: '新质押券代码',
            property: 'pledgedStockCode',
            exposedProperty: 'stockCode',
            maxlen: 20,
            rules: GetRule(223),
            necessaries: 'N,N,N,Y,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
        });
        
        this.eleNewPledgedStockName = new TextElement(this, {

            label: '新质押券名称', 
            property: 'pledgedStockName',
            maxlen: 20,
            rules: GetRule(224),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.optional,
            asText: true,
        });

        this.eleNewPledgeRatio = new TextElement(this, {

            label: '新折算比例',
            unitLabel: '%',
            property: 'pledgeRatio',
            exposedProperty: 'discount',
            maxlen: 6,
            rules: GetRule(225),
            necessaries: 'N,N,N,Y,N,N',
            template: Templates.number, 
            verify: Verifies.nameRegulated,
            advanced: {

                max: 100,
                min: 0,
                step: 0.01,
                precision: 2,
                handler: this._handleNewPledgeRateChange.bind(this),
            },
            converter: this.convertPledgeRatio.bind(this),
        });

        this.eleNewPledgedVolume = new TextElement(this, {

            label: '新质押数量',
            unitLabel: '张',
            property: 'totalVolume',
            exposedProperty: 'entrustVolume',
            maxlen: 12,
            rules: GetRule(226),
            necessaries: 'N,N,N,Y,N,N',
            template: Templates.number, 
            verify: Verifies.nameRegulated,
            advanced: {
                max: () => { return this.isSourcePledgeAbsent ? 999999999 : this.firstPledged.totalVolume; },
                min: 0,
                step: () => { return this.repoVolumeStep; },
                handler: this._handleNewPledgeVolumeChange.bind(this),
            },
        });

        this.eleNewPaperAmount = new TextElement(this, {

            label: '新券面总额',
            unitLabel: '元',
            property: 'paperAmount',
            maxlen: 15,
            rules: GetRule(227),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
		});

        this.eleOriginalPledgedStock = new TextElement(this, {

            label: '原质押券',
            property: 'oldPledgedStockCode',
            maxlen: 20,
            rules: GetRule(228),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
            asText: true,
		});

        this.eleOriginalPledgedRatio = new TextElement(this, { 

            label: '原折算比例',
            unitLabel: '%',
            property: 'oldPledgeRatio',
            maxlen: 6,
            rules: GetRule(229),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
		});

        this.eleOriginalNumber = new TextElement(this, { 

            label: '原质押数量',
            unitLabel: '张',
            property: 'oldTotalVolume',
            maxlen: 10,
            rules: GetRule(230),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text,
            verify: Verifies.nameRegulated,
		});

        this.eleOriginalPaperAmount = new TextElement(this, { 

            label: '原券面总额',
            unitLabel: '元',
            property: 'oldPaperValue',
            maxlen: 15,
            rules: GetRule(231),
            necessaries: 'N,N,N,N,N,N',
            template: Templates.text, 
            verify: Verifies.nameRegulated,
		});
    }

    /**
     * 转换这算比例输出值
     * @param {Number} value 
     */
    convertPledgeRatio(value) {
        return typeof value == 'number' ? value * 0.01 : value;
    }

    initializeControls() {

        // 将纯静态展示要素，置为只读

        this.elePortfolioName.disable();
        this.eleAccountName.disable();
        this.eleDirection.disable();
        this.eleMarketId.disable();
        this.eleTermDays.disable();
        this.elePledgedMaxVolume.disable();

        
        //增加本方交易员，对手交易员，对手席位的添加按钮
        let $addOurTraderBtn = document.createElement("div");
        $addOurTraderBtn.setAttribute('class', 'newInformation');
        $addOurTraderBtn.innerHTML = `<button type="button" class="addInformation-button">+</button>`;
        $addOurTraderBtn.onclick = this.showAddPromptOurTrader.bind(this);

        let $addCounterTraderBtn = $addOurTraderBtn.cloneNode(true);
        $addCounterTraderBtn.onclick = this.showAddPromptCounterTrader.bind(this);

        let $addOppoSeatBtn = $addOurTraderBtn.cloneNode(true);
        $addOppoSeatBtn.onclick = this.showAddPromptOppoSeat.bind(this);

        this.eleOurTrader.control.$control.append($addOurTraderBtn);
        this.eleCounterTrader.control.$control.append($addCounterTraderBtn);
        this.eleOppoSeat.control.$control.append($addOppoSeatBtn);
        
        // 添加交易对手监听
        this.monitorAddCounter();

        // 下拉列表数据填充

        this.eleMarketId.typedControl.fill(dictionary.market);
    }

    /**
     * 交易对手增加添加监听
     */
    monitorAddCounter() {

        layui.form.on('select(counterRule)', (element) => {
            
            let counterValue = element.value;

            if (counterValue) {
                this.inputCounter = counterValue;
                this.requestAllTraders(counterValue);
            }
            else {

                this.instruction.counterId = '';

                //将下拉框回复默认状态
                this.eleOurTrader.typedControl.fill([]);
                this.eleCounterTrader.typedControl.fill([]);
                this.eleOppoSeat.typedControl.fill([]);
                
                this.controlShowAllTradersInformation();
            }
        });

        
    }
    
    showAddPromptOurTrader() {
        
        layer.prompt({

            formType: 0,
            title: '请输入要添加的本方交易员！',
            value: '',
        }, async (ourTraderId, index, elem) => {
            
                if (ourTraderId.length != 6) {

                    helper.msg("本方交易员必须为6位！请重新输入");
                    return ;
                }

                let resp = await this.manageRepo.addOurTrader(this.counterId ? this.counterId : this.inputCounter, ourTraderId);
                
                if (resp.errorCode == 0) {
                    
                    this.OurTraderList.unshift({code: ourTraderId, mean: ourTraderId});
                    this.eleOurTrader.typedControl.fill(this.OurTraderList);
                    layui.form.render('select', this.formFilter);
                }
                else {
                    helper.msg("添加本方交易员失败！");
                }

                layer.close(index);
            }
        );
    }

    showAddPromptCounterTrader() {
        
        layer.prompt({

            formType: 0,
            title: '请输入要添加的对手交易员！',
            value: '',
        }, async (counterTraderId, index, elem) => {
             
                if (counterTraderId.length != 6) {

                    helper.msg("对手交易员必须为6位！请重新输入");
                    return ;
                }

                let resp = await this.manageRepo.addCounterTrader(this.counterId ? this.counterId : this.inputCounter, counterTraderId);
                
                if (resp.errorCode == 0) {
                    
                    this.CounterTraderList.unshift({code: counterTraderId , mean: counterTraderId});
                    this.eleCounterTrader.typedControl.fill(this.CounterTraderList);
                    layui.form.render('select', this.formFilter);
                }
                else {
                    helper.msg("添加对手交易员失败！");
                }

                layer.close(index);
            }
        );
    }

    showAddPromptOppoSeat() {
        
        layer.prompt({

            formType: 0,
            title: '请输入要添加的对手席位！',
            value: '',
        }, async (counterSeatId, index, elem) => {

                if (counterSeatId.length > 6 ) {
                    
                    helper.msg("对手席位最多为6位！请重新输入");
                    return ;
                }

                let resp = await this.manageRepo.addOppoSeat(this.counterId ? this.counterId : this.inputCounter, counterSeatId);
                
                if (resp.errorCode == 0) {

                    this.OppoSeatList.unshift({code: counterSeatId, mean: counterSeatId});
                    this.eleOppoSeat.typedControl.fill(this.OppoSeatList);
                    layui.form.render('select', this.formFilter);
                }
                else {
                    helper.msg("添加对手席位失败！");
                }

                layer.close(index);
            }
        );
    }

    /**
     *  获取本方交易员、对手方交易员、对手席位信息,并渲染到select选择
     * @param {String} counterValue 
     */
    async requestAllTraders(counterValue) {
        
        if (!counterValue) {
            return;
        }
        
        //清除添加按钮上的disabled状态，以防止上交所逆回购时使其不可点，影响后面代码执行
        let addInfoBtn = document.querySelectorAll(".addInformation-button");
        addInfoBtn.forEach(item => item.removeAttribute('disabled', ''));

        //本方交易员控件渲染
        if (this.isShSecMarket && !(this.isShSecMarket && this.isReversedRepo)) {
            
            let our_traders = await this.manageRepo.queryOurTrader(counterValue);
            
            if (our_traders.errorCode == 0) {

                if (this.instruction.ourTrader) {
            
                    let  findIndex = our_traders.data.findIndex(item =>  item.ourTraderId == this.instruction.ourTrader);
                    
                    if (findIndex == -1) {
                        our_traders.data.unshift({ ourTraderId: this.instruction.ourTrader} );
                    }
                    else {
                        our_traders.data.unshift(our_traders.data.splice(findIndex , 1)[0]);
                    }        
                }
    
                our_traders.data = our_traders.data.map(item => ({ code: item.ourTraderId, mean: item.ourTraderId }));
                this.OurTraderList = our_traders.data;
                this.eleOurTrader.typedControl.fill(our_traders.data);
            }
            else {
    
                our_traders.data = [];
                helper.msg("查询本方交易员失败！");
            }

            this.eleOurTrader.enable();
            this.eleOurTrader.typedControl.$select.setAttribute('lay-search', '');
        }

        //对手交易员控件渲染
        if (this.isShSecMarket && !(this.isShSecMarket && this.isReversedRepo)) {
            
            let counter_traderList = await this.manageRepo.queryCounterTrader(counterValue);
            
            if (counter_traderList.errorCode == 0) {

                if(this.instruction.counterTrader){
    
                    let  findIndex = counter_traderList.data.findIndex(item =>  item.counterTraderId == this.instruction.counterTrader);
                    
                    if (findIndex == -1 ) {
                        counter_traderList.data.unshift({ counterTraderId: this.instruction.counterTrader} );
                    }
                    else {
    
                        counter_traderList.data.unshift(counter_traderList.data.splice(findIndex , 1)[0]);
                    }
                }
                
                counter_traderList.data = counter_traderList.data.map(item => ({ code: item.counterTraderId, mean: item.counterTraderId }));
                this.CounterTraderList = counter_traderList.data;
                this.eleCounterTrader.typedControl.fill(counter_traderList.data);

            }
            else {
                counter_traderList.data = [];
                helper.msg("查询对手交易员失败！");
            }
    
            this.eleCounterTrader.enable();
            this.eleCounterTrader.typedControl.$select.setAttribute('lay-search', '');
        }

        //对手席位控件渲染
        if (this.isSzSecMarket) {

            let oppo_seatList = await this.manageRepo.queryOppoSeat(counterValue);

            if (oppo_seatList.errorCode == 0) {
           
                if (this.instruction.counterSeat) {
           
                    let  findIndex = oppo_seatList.data.findIndex(item =>  item.counterSeatId == this.instruction.counterSeat);
                    
                    if (findIndex == -1) {
                        oppo_seatList.data.unshift({ counterSeatId: this.instruction.counterSeat} );
                    }
                    else {
                        oppo_seatList.data.unshift(oppo_seatList.data.splice(findIndex , 1)[0]);
                    }
                }
                
                oppo_seatList.data = oppo_seatList.data.map(item => ({ code: item.counterSeatId, mean: item.counterSeatId }));
                this.OppoSeatList = oppo_seatList.data;
                this.eleOppoSeat.typedControl.fill(oppo_seatList.data);
            }
            else {
    
                oppo_seatList.data = [];
                helper.msg("查询对手席位失败！");
            }

            this.eleOppoSeat.enable();
            this.eleOppoSeat.typedControl.$select.setAttribute('lay-search', '');
        }

        layui.form.render('select', this.formFilter);
    }

    /**
     * 控制交易员，对手交易员，对手席位控件的只读
     */ 
    controlShowAllTradersInformation() {

        if (!this.counterId || (this.isShSecMarket && this.isReversedRepo)) {
            
            let addInfoBtn = document.querySelectorAll(".addInformation-button");
            addInfoBtn.forEach(item => item.setAttribute('disabled', 'true'));
            
            // 下拉列表可自行输入,排除在上交所，逆回购得情况
            this.eleOurTrader.typedControl.$select.removeAttribute('lay-search', '');
            this.eleCounterTrader.typedControl.$select.removeAttribute('lay-search', '');
            this.eleOppoSeat.typedControl.$select.removeAttribute('lay-search', '');
            
            this.eleOurTrader.disable();
            this.eleCounterTrader.disable();
            this.eleOppoSeat.disable();

            layui.form.render('select', this.formFilter);
            return ;
        }


    }
     
    build() {

        /** 为动态加载的要素，配置根节点 */
        UserElement.SetContainer(this.$form.querySelector('.control-package'));

        /**创建行情表格，在是上交所和逆回购 */
        this.createQuoteTable();
        /** 动态创建要素 */
        this.createUserElements();
        /** 初始化控件 */
        this.initializeControls();
        /** 为动态创建的要素，转换为有效的表单元素 */
        layui.form.render('select', this.formFilter);

        /**
         * 重置按钮
         */
        var $btnReset = layui.$(`form button[lay-filter='reset-form-repo']`);
        $btnReset[0].onclick = this.resetForm.bind(this);
    }

    /**
     * 决定需要使用的委托属性
     */
    decideEntrustProp() {
        
        const EP = dictionary.entrustProp;
        const isSh = this.isShSecMarket;
        const isPos = this.isPositiveRepo;

        if (this.isRepoSq) {
            return isSh ? (isPos ? EP.repo_bpb.code : EP.repo_bph.code) : EP.repo_bpn.code;
        }
        else if (this.isRepoDqxz) {
            return isSh ? (isPos ? EP.repo_bpc.code : EP.repo_bpj.code) : EP.repo_bpt.code;
        }
        else if (this.isRepoJczy) {
            return isSh ? (isPos ? EP.repo_bpd.code : EP.repo_bpl.code) : null;
        }
        else if (this.isRepoZthq) {
            return isSh ? (isPos ? EP.repo_bpe.code : EP.repo_bpo.code) : null;
        }
        else if (this.isRepoTqgh) {
            return isSh ? (isPos ? EP.repo_bpf.code : EP.repo_bpq.code) : EP.repo_bpr.code;
        }
        else if (this.isRepoDqgh) {
            return isSh ? EP.repo_bpg.code : EP.repo_bpr.code;
        }
    }

    /**
     * 获取协议回购交易单元，录入的下单信息
     * @param {*} field_data 表单原始提交数据
     */
    customizeData(field_data) {

        let index = -1;

        if (this.isRepoSq) {
            index = 0;
        }
        else if (this.isRepoDqgh) {
            index = 1;
        }
        else if (this.isRepoTqgh) {
            index = 2;
        }
        else if (this.isRepoZthq) {
            index = 3;
        }
        else if (this.isRepoDqxz) {
            index = 4;
        }
        else if (this.isRepoJczy) {
            index = 5;
        }

        let instruc = this.instruction;
        let orderInfo = {

            instructionId: instruc.id,
            portfolioId: instruc.portfolioId,
            accountId: instruc.acctNo,
            market: instruc.marketId,
            entrustBs: instruc.bsFlag,
            userId: instruc.tradeId,
            username: instruc.traderName,
            entrustProp: this.decideEntrustProp(),
            compactTerm: instruc.termDays,
        };

        this.elements.forEach(elem => {

            let propertyName = elem.exposedProperty || elem.property;
            let isNecessary = elem.necessaries instanceof Array && elem.necessaries[index] === true;
            let shouldPresent = false;

            if (elem.isShowing) {

                /**
                 * 显示状态下，忽略必要性设置，直接提取该值
                 */

                shouldPresent = true;
            }
            else {

                /**
                 * 非显示状态下，某个要素为必要，且尚未被取值，才提取该值
                 */

                shouldPresent = isNecessary && orderInfo[propertyName] === undefined;;
            }

            /**
             * 仅当该元素必要、且显示于界面的要素，才出席下单参数
             */

            if (shouldPresent) {
                orderInfo[propertyName] = typeof elem.converter == 'function' ? elem.converter(elem.value, elem) : elem.value;
            }
        });

        // throw new Error('it is prohibited');
        return orderInfo;
    }

    /**
     * 根据当前的协议回购操作类型，将所有的要素状态，进行重置
     */
    toggleElementStates() {

        let index = -1;
        let isShMarket = this.isShSecMarket;
        let emptyContent = '';

        if (this.isRepoSq) {
            index = 0;
        }
        else if (this.isRepoDqgh) {
            index = 1;
        }
        else if (this.isRepoTqgh) {
            index = 2;
        }
        else if (this.isRepoZthq) {
            index = 3;
        }
        else if (this.isRepoDqxz) {
            index = 4;
        }
        else if (this.isRepoJczy) {
            index = 5;
        }

        this.elements.forEach(elem => {

            if (!(elem.behaviors instanceof Array) || elem.behaviors.length == 0) {
                return;
            }

            /**
             * 获得特定于，当前协议回购操作类型的，行为规则
             */
            let matched = elem.behaviors[index];
            let behavior = this.isPositiveRepo ? matched.positive : matched.reversed;
            
            if (behavior.isInvalid) {

                elem.setValue(emptyContent);
                elem.hide();
            }
            else {

                let rule = behavior.getRule(isShMarket);
                
                if (rule.isUnsuitable) {

                    elem.hide();
                    return;
                }

                if (rule.isReadonly) {
                    elem.disable();
                }
                else if (rule.isWritable) {
                    elem.enable();
                }
                else if (rule.isHalfWritable) {
                    
                    if (helper.isNotNone(elem.plainValue)) {
                        elem.disable();
                    }
                    else {
                        elem.enable();
                    }
                }

                elem.show();
            }
        });
    }

     /**
     * 更改回购利率信息联动
     */
    _handleRepoRateChange() {
        this._setInterestAndSettleAmount();
    }

    /**
     * 计算利息
     */
    _setInterestAndSettleAmount() {

        let amount = this.eleRepoAmount.value;
        let days = this.eleOccupyDays.value;
        let repoRate = this.eleRepoRate.value;

        if (isNaN(amount) || amount <= 0) {

            this.eleInterest.setValue(0);
            this.eleMaturitySettleAmount.setValue(0);
            return;
        }

        if (typeof days == 'number' && days > 0 && typeof repoRate == 'number' && repoRate > 0) {
            
            let daysRatio = days / 365;
            let interest = amount * repoRate * daysRatio * 0.01;
            this.eleInterest.setValue(interest);
            this.eleMaturitySettleAmount.setValue(amount + interest);
        }
        else {

            this.eleInterest.setValue(0);
            this.eleMaturitySettleAmount.setValue(amount);
        }
    }

    /**
     * 监听回购金额变化
     */
    _handleRepoAmountChange() {

        this._setVolumeByAmountAndRatio();
        this._setInterestAndSettleAmount();
    }

    /**
     * 更改折算比例监听
     */
    _handlePledgeRateChange() {
        this._setVolumeByAmountAndRatio();
    }

    /**
     * 响应回购金额变化，或回购利率变化，设置适合的数量，满足换算规则
     */
    _setVolumeByAmountAndRatio() {

        let amount = this.eleRepoAmount.value;
        let ratio = this.elePledgeRatio.value;

        if (isNaN(amount) || amount <= 0 || isNaN(ratio) || ratio <= 0) {

            this.elePledgedVolume.setValue(0);
            this.alignPaperAmount();
            return;
        }

        let volume = amount / (this.decidedPaperValue * ratio * 0.01);
        let trimedVolume = (volume % this.repoVolumeStep) == 0 ? volume : this.trimVolume(volume, this.repoVolumeStep) + this.repoVolumeStep;
        this.elePledgedVolume.setValue(trimedVolume);
        this.alignPaperAmount();
    }

    /**
     * 更改新折算利率监听
     */
    _handleNewPledgeRateChange() {

        const instruc = this.instruction;
        const paperValue = this.decidedPaperValue;
        const pledgedVolume = this.eleNewPledgedVolume.value;
        const ratio = this.eleNewPledgeRatio.value;

        const amount = pledgedVolume * paperValue * ratio / 100;
        const repoInterest = pledgedVolume * paperValue * ratio / 100 * instruc.termDays * instruc.price / 365;
        
        this.setVal({ 

            repoAmount: helper.thousandsDecimal(amount, 2), // 回购金额
            interest: helper.thousandsDecimal(repoInterest, 2), // 回购利息
        });
    }

    /**
     * 新质押券数量更改监听
     */
    _handleNewPledgeVolumeChange() {

        const instruc = this.instruction;
        const paperValue = this.decidedPaperValue;
        const volume = this.eleNewPledgedVolume.value;
        const NewConversionRatio = this.eleNewPledgeRatio.value;

        const paperAmount = volume * paperValue;
        const amount = volume * paperValue * NewConversionRatio / 100;
        const repoInterest = volume * paperValue * NewConversionRatio / 100 * instruc.termDays * instruc.price / 365;
        
        this.setVal({ 

            repoAmount: helper.thousandsDecimal(amount, 2), // 回购金额
            paperAmount: helper.thousandsDecimal(paperAmount, 2), // 券面总额
            interest: helper.thousandsDecimal(repoInterest, 2), // 回购利息
        });

        this.alignNewPaperAmount();
    }

    /**
     * 质押券数量更改监听
     */
    _handlePledgedVolumeChange() {

        let amount = this.eleRepoAmount.value;
        let volume = this.elePledgedVolume.value;

        if (isNaN(amount) || amount <= 0 || isNaN(volume) || volume <= 0) {

            this.elePledgeRatio.setValue(0);
            return;
        }

        let ratio = 100 * amount / (this.decidedPaperValue * volume);
        this.elePledgeRatio.setValue(ratio);
        this.alignPaperAmount();
    }

    /**
     * @param {Instruction} ins 
     */
    formInsData(ins) {

        let data = {};
        let insKeys = Object.keys(ins);
        let firstp = this.firstPledged;
        let plegeKeys = Object.keys(firstp || {});
        let allKeys = insKeys.concat(plegeKeys);
        let sourceData = {};

        helper.extend(sourceData, ins);
        helper.extend(sourceData, firstp);

        this.allElemets.forEach(elem => {

            let propertyName = elem.property;
            let hasData = allKeys.indexOf(propertyName) >= 0;

            /**
             * 原始数据未有对应字段，则重置该要素
             */
            data[propertyName] = hasData ? sourceData[propertyName] : null;
        });

        let pledgeInfo = {

            maxPledgedVolume: firstp.totalVolume,
            // 回购金额，初始值设置为 min(指令金额, 质押券最大可质押金额)
            repoAmount: 0,
            paperAmount: firstp.paperValue * firstp.totalVolume,
        };

        helper.extend(data, pledgeInfo);
        return this.formData = data;
    }

    /**
     * 对初始化填入的回购金额，依据指令（回购）金额 / 质押券（数量）金额，朝收窄方向进行对齐
     * @param {Instruction} ins 
     */
    alignRepoAmount(ins) {

        if (this.isPositiveRepo) {

            let firstp = this.firstPledged;
            let pledgeAmount = firstp.totalAmount;
            let lessAmount = Math.min(ins.leftAmount, pledgeAmount);

            if (pledgeAmount > lessAmount) {

                let volume = lessAmount / (firstp.paperValue * firstp.pledgeRatio * 0.01);
                let trimedVolume = (volume % this.repoVolumeStep) == 0 ? volume : this.trimVolume(volume, this.repoVolumeStep) + this.repoVolumeStep;
                this.eleRepoAmount.setValue(lessAmount);
                this.elePledgedVolume.setValue(trimedVolume);
            }
            else {
                this.eleRepoAmount.setValue(lessAmount);
            }
        }
        else {
            this.eleRepoAmount.setValue(ins.leftAmount);
        }

        if (this.eleNewPaperAmount.isShowing) {
            this.alignNewPaperAmount();
        }
        else {
            this.alignPaperAmount();
        }
    }

    specializeElements() {
        
        /**
         * 根据价格模式（回购利率）是否为指定不能更改，设置回购利率要素的可输入性
         */

        let eleRepoRate = this.eleRepoRate;
        if (this.isFixedPrice) {

            if (!eleRepoRate.isReadonly) {
                eleRepoRate.disable();
            }
        }
        else {

            if (eleRepoRate.isReadonly) {
                eleRepoRate.enable();
            }
        }
    }

    resetForm() {
        
        this.refillSelects();
        let insData = this.formInsData(this.instruction);
        this.setVal(insData);

        // 对于当前回购操作类型，动态展示用户要素
        this.toggleElementStates();
        // 对非规则场景，对用户要素进行特别设置
        this.specializeElements();
        // 对于交易对手相关联的交易员，交易对手交易员，对手席位，进行选择，添加控制
        this.controlShowAllTradersInformation();
        // 给交易对手赋予初始值
        this.setDefaultValue();
        // 初始化，为回购金额设置合适的数值
        this.alignRepoAmount(this.instruction);
        // 初始阶段，计算回购利息、到期回购结算金额
        this._setInterestAndSettleAmount();
        // 逆回购方，请求正回购方，行情列表
        this.requestRepoQuote();
    }

    /**
     * 在有值得情况下，交易对手设置初始值，并只能只读
     */
    setDefaultValue() {
        
        if (this.counterId) {

            this.eleCounterId.setValue(this.counterId);
            this.eleCounterId.disable();
        }

    }

    async requestCounterparties() {
        
        if (this.counterId) {

            let cList = [{ 'code': this.counterId, 'mean': this.instruction.counterName }];
            this.eleCounterId.typedControl.fill(cList);
            this.eleCounterId.typedControl.$select.removeAttribute('lay-search', '');
        }
        else {

            let resp = await this.manageRepo.queryCounterList();
            
            if (resp.errorCode != 0) {

                helper.showError(`交易对手数据，查询异常( ${ resp.errorMsg } )`);
                return;
            }
           
            let counterList = resp.data ? resp.data : [];
            let cList = counterList.map(counter => { return {'code': counter.counterId, 'mean': counter.counterName }});
            this.eleCounterId.typedControl.fill(cList, false);

            if(!(this.isShSecMarket && this.isReversedRepo) && !(this.isSzSecMarket && this.isPositiveRepo)) {

                this.eleCounterId.typedControl.$select.setAttribute('lay-search', '');
                this.eleCounterId.typedControl.$select.setAttribute('lay-filter', 'counterRule');
            }
        }
        
        layui.form.render('select', this.formFilter);
    }

    refillSelects() {

        /**
         * 重新填充方向
         */

        let matched = dictionary.repoOperations.find(item => item.code == this.repoOperation);
        let repoName = matched ? matched.mean : RepoOpers.establish.mean;
        let dirs = [Dir.positiveRepo, Dir.reversedRepo].map(item => ({ code: item.code, mean: `${item.mean}-${repoName}` }));
        this.eleDirection.typedControl.fill(dirs);

        /**
         * 重新填充交易对手数据
         */
        this.requestCounterparties();

        /** 获取本方交易员、对手方交易员、对手席位*/
        this.requestAllTraders(this.counterId);
    }

    /**
     * 处置行情点选事件
     * @param {RepoQuote} quote 
     */
    handleQuoteSelected(quote) {

        this.eleNewPledgedStock.setValue(quote.stockCode);
        this.eleNewPledgedStockName.setValue(quote.stockName);
        this.eleNewPledgedVolume.setValue(quote.impawnAmount);
        this.eleNewPledgeRatio.setValue(quote.funderRatio);

        this.eleOriginalPledgedStock.setValue(quote.oldImpawnCode);
        this.eleOriginalPaperAmount.setValue(quote.prevImpawnBalance / quote.funderRatio);

        this.eleRepoAmount.setValue(quote.impawnBalance);
        this.eleAppointmentNumber.setValue(quote.cbpconferId);
        this.eleTermDays.setValue(quote.repoTerm);
        this.eleOccupyDays.setValue(quote.fundUsedDays);
        this.eleMaturityDate.setValue(quote.settleEndDate);
        this.eleInterest.setValue(quote.profit);
        this.eleMaturitySettleAmount.setValue(quote.settleBalance);
        this.eleOurTrader.setValue(quote.traderId);
        this.eleOppoSeat.setValue(quote.propSeatNo);
        this.eleCounterTrader.setValue(quote.oppoTraderId);
        this.eleRemark.setValue(quote.remark);
    }

    alignPaperAmount() {
        
        let volume = this.elePledgedVolume.value || 0;
        let paperv = this.firstPledged.paperValue;
        this.elePaperAmount.setValue(volume * paperv);
    }

    alignNewPaperAmount() {

        let volume = this.eleNewPledgedVolume.value || 0;
        let paperv = this.firstPledged.paperValue;
        this.eleNewPaperAmount.setValue(volume * paperv);
    }

    /**
     * 补充协议验证规则，非必填，没具体验证规则
     */
    validateRemark() {

    }
    
    /**
     * 回购金额验算规则
     */
    validateRepoAmount() {
        
        let amount = this.eleRepoAmount.value;
        if (isNaN(amount)) {
            return '回购金额，非数值';
        }
        else if (amount <= 0) {
            return '回购金额，非正值';
        }

        /**
         * 指令金额，超限检查
         */
        
        let leftAmount = this.instruction.leftAmount;
        if (amount > leftAmount) {
            return `回购金额 ${ helper.thousandsDecimal(amount) } > 指令回购金额 ${ helper.thousandsDecimal(leftAmount) }`;
        }

        /**
         * 正回购方，最大可质押金额，超限检查
         */

        if (!this.isSourcePledgeAbsent) {
            
            let samount = this.firstPledged.totalAmount;
            if (amount > samount) {
                return `回购金额 ${ helper.thousandsDecimal(amount) } > 质押券最大可质押金额 ${ helper.thousandsDecimal(samount) }`;
            }
        }

        /**
         * 逆回购方，最大可质押金额，超限检查
         */

        if (this.isQuoteRequired) {
            
            if (this.quoteCount == 0) {
                return '上海市场，无正回购行情，逆回购方，无法进行交易';
            }

            let selected = this.selectedQuote;
            if (!selected) {
                return '请选择一个，正回购方行情';
            }
            else if (amount != selected.impawnBalance) {
                return `质押金额 ${amount} != 正回购方行情金额 ${selected.impawnBalance}`;
            }
        }
    }

    /**
     * 占款天数验证规则
     */
    validateOccupyDays(){

        const days = this.eleOccupyDays.value;
      
        if (isNaN(days)) {
            return '占款天数，非数值';
        }
        else if (days <= 0) {
            return '占款天数，非正值';
        }
        else if (!Number.isInteger(days)) {
            return '占款天数，非整数';
        }
    }

    /**
     * 回购利息验证规则
     */
    validateInterest() {

        const interest = this.eleInterest.value;
       
        if (isNaN(interest)) {
            return '回购利息，非数值';
        }
        else if (interest <= 0) {
            return '回购利息，非正值';
        }
    }

    /**
     * 折算比例验证规则
     */
    validatePledgeRatio() {

        let ratio = this.elePledgeRatio.isShowing ? this.elePledgeRatio.value : this.eleNewPledgeRatio.value;
        let firstp = this.firstPledged;
        
        if (isNaN(ratio)) {
            return '折算比例，非数值';
        }
        else if (ratio <= 0) {
            return '折算比例，非正值';
        }
        else if (ratio > 100) {
            return '折算比例，不能超过100%';
        }

        if (this.isSourcePledgeAbsent) {
            return;
        }
        
        if (this.isPositiveRepo) {

            if (ratio < firstp.pledgeRatio) {
                return `正回购方，折算比例不能 < ${firstp.pledgeRatio}%`;
            }
        }
        else if (this.isReversedRepo) {
            
            if (ratio > firstp.pledgeRatio) {
                return `逆回购方，折算比例不能 > ${firstp.pledgeRatio}%`;
            }
        }
    }

    /**
     * 质押数量验证规则
     */
    validateTotalVolume() {

        let volume = this.elePledgedVolume.isShowing ? this.elePledgedVolume.value
                                                     : this.eleNewPledgedVolume.value;
        
        if (isNaN(volume)) {
            return '质押券数量，非数值';
        }
        else if (volume <= 0) {
            return '质押券数量，非正值';
        }
        else if (!this.isSourcePledgeAbsent && volume > this.firstPledged.totalVolume) {
            return `质押券数量，超过了最大可质押数量 ${this.firstPledged.totalVolume}`;
        }
    }

    /**
     * 回购利率验证规则
     */
    validatePrice() {

        let instrucRate = this.instruction.price;
        let repoRate = this.eleRepoRate.value;

        if (isNaN(repoRate)) {
            return '回购利率，非数值';
        }
        else if (repoRate <= 0) {
            return '回购利率，非正值';
        }
        else if (repoRate > 100) {
            return '回购利率，超过上限100%';
        }

        if (this.isFixedPrice) {

            if (repoRate != instrucRate) {
                return `回购利率 ${ repoRate }% != 指定回购利率 ${ instrucRate }%`;
            }
        }
        else if (this.isLimitedPrice) {

            if (this.isPositiveRepo && repoRate > instrucRate) {
                return `回购利率${ repoRate }% > 指令回购利率${ instrucRate }%`;
            } 
            else if (this.isReversedRepo && repoRate < instrucRate) {
                return `回购利率${ repoRate }% < 指令回购利率${ instrucRate }%`;
            }
        }
    }

    /**
     * 本方交易员验证规则
     */
    validateOurTrader() {

        const trader = this.eleOurTrader.plainValue;

        if (trader.length == 0) {
            return '本方交易员必填';
        }
        else if (trader.length !== 6) {
            return '本方交易员，必须为6位字符';
        }
    }

    /**
     * 到期结算额验证规则
     */
    validateMaturitySettleAmount() {

        const amount = this.eleMaturitySettleAmount.value;

        if (isNaN(amount)) {
            return '到期结算额，非数值';
        }
        else if (amount <= 0) {
            return '到期结算额，非正值';
        }
    }

    /**
     * 交易对手验证规则
     */
    validateCounterName() {

        const counterId = this.eleCounterId.plainValue;
        if (counterId.length == 0) {
            return '交易对手必填';
        }
    }

    /**
     * 对手交易员验证规则
     */
    validateCounterTrader() {

        const counterTrader = this.eleCounterTrader.plainValue;
        if (counterTrader.length == 0) {
            return '对手交易员必填';
        }
        else if (counterTrader.length !== 6) {
            return '对手交易员，必须为6位字符';
        }
    }

    /**
     * 请求号验证规则
     */
    validateExchangeRequestId() {

        const reqeustId = this.eleExchangeRequestId.plainValue;
        if (reqeustId.length == 0) {
            return '请求号必填';
        }
    }

    /**
     * 首次结算日验证规则
     */
    validateFirstSettleDate() {

        const date = this.eleFirstSettleDate.plainValue;
        if (date.length == 0) {
            return '首次结算日必填';
        }
    }

    /**
     * 到期结算日验证规则
     */
    validateMaturityDate() {

        const date = this.eleMaturityDate.plainValue;
        if (date.length == 0) {
            return '到期结算日必填';
        }
    }

    /**
     * 对手席位验证规则
     */
    validateCounterSeat() {

        if (this.isPositiveRepo) {
            return;
        }

        const seat = this.eleOppoSeat.plainValue;
        if (seat.length == 0) {
            return '对手席位必填';
        } 
        else if (seat.length > 6) {
            return '对手席位最多6位字符';
        }
    }

    /**
     * 约定号验证规则
     */
    validateAppointmentNumber() {

        const appointmentNumber = this.eleAppointmentNumber.plainValue;
        if (appointmentNumber.length == 0) {
            return '约定号必填';
        } 
        else if (appointmentNumber.length > 6) {
            return '约定号最多6位字符';
        }
    }

    /**
     * 成交编号验证规则
     */
    validateDealNo() {

        let dealNo = this.eleDealNo.plainValue;
        if (dealNo.length <= 0) {
            return '请填写成交编号';
        }
        
    }

    /**
     * 初始交易编号验证规则
     */
    validateTrdMatchId() {

        let dealNo = this.eleOriginalDealNo.plainValue;
        if (dealNo.length <= 0) {
            return '请填写初始交易编号';
        }
    }
    
    /**
     * 质押券代码验证规则
     */
    validatePledgedStockCode() {

        const pledgedCode = this.elePledgedStock.isShowing ? this.elePledgedStock.plainValue 
                                                           : this.eleNewPledgedStock.plainValue;
        if (pledgedCode.length <= 0) {
            return '请填写质押券代码';
        }        
    }

    /**
     * 新券面总额验证规则
     */
    validateNewPaperAmount() {

        const amount = this.eleNewPaperAmount.value;
        
        if (isNaN(amount)) {
            return '新券面总额，非数值';
        }
        else if (amount <= 0) {
            return '新券面总额，非正值';
        }
    }

    /**
     * 原质押券代码验证规则
     */
    validateOldPledgedStockCode() {

        const originalPledgedCode = this.eleOriginalPledgedStock.plainValue;
        if (originalPledgedCode.length <= 0) {
            return '请填写原质押卷代码';
        }        
    }

    /**
     * 原折算比例验证规则
     */
    validateOldPledgeRatio() {

        const originalConversionRatio = this.eleOriginalPledgedRatio.value;
        
        if (isNaN(originalConversionRatio)) {
            return '原折算比例，非数值';
        }
        if (originalConversionRatio <= 0) {
            return '原折算比例，非正值';
        }
    }

    /**
     * 原质押数量验证规则
     */
    validateOldTotalVolume() {

        const originalNumber = this.eleOriginalNumber.value;
        
        if (isNaN(originalNumber)) {
            return '原质押数量，非数值';
        }
        if (originalNumber <= 0) {
            return '原质押数量，非正值';
        }
    }

    /**
     * 原券面总额验证规则
     */
    validateOldPaperValue() {

        const originalAmount = this.eleOriginalPaperAmount.value;
     
        if (isNaN(originalAmount)) {
            return '原券面总额，非数值';
        }
        else if (originalAmount <= 0) {
            return '原券面总额，非正值';
        }
    }

    /**
     * 券面总额验证规则
     */
    validatePaperAmount() {

        const paperAmount = this.elePaperAmount.value;
       
        if (isNaN(paperAmount)) {
            return '券面总额，非数值';
        }
        if (paperAmount <= 0) {
            return '券面总额，非正值';
        }
    }

    getValidateRule() {

        var elems = this.elements = [

            this.eleRepoAmount,
            this.elePledgedStock,
            this.elePledgedStockName,
            this.elePledgedMaxVolume,
            // this.elePledgedMaxVolume,
            this.elePledgeRatio,
            this.elePledgedVolume,
            this.elePaperAmount,
            this.eleFirstSettleDate,
            this.eleMaturityDate,
            this.eleOccupyDays,
            this.eleRepoRate,
            this.eleInterest,
            this.eleMaturitySettleAmount,
            this.eleOurTrader,
            this.eleCounterId,
            this.eleCounterTrader,
            this.eleExchangeRequestId,
            this.eleRemark,
            this.eleOppoSeat,
            this.eleAppointmentNumber,
            this.eleDealNo,
            this.eleOriginalDealNo,
            this.eleNewPledgedStock,
            this.eleNewPledgedStockName,
            this.eleNewPledgeRatio,
            this.eleNewPledgedVolume,
            this.eleNewPaperAmount,
            this.eleOriginalPledgedStock,
            this.eleOriginalPledgedRatio,
            this.eleOriginalNumber,
            this.eleOriginalPaperAmount,
        ];

        this.allElemets = elems.concat([

            this.elePortfolioName,
            this.eleAccountName,
            this.eleDirection,
            this.eleMarketId,
            this.eleTermDays,
        ]);

        const mappedEvents = {};
        const thisObj = this;

        elems.forEach(item => {

            if (item.verify != Verifies.nameRegulated) {
                return;
            }

            let validatorName = UserElement.formatValidatorName(item.property);
            let matched = mappedEvents[validatorName];
            if (typeof matched == 'function') {
                return;
            }

            mappedEvents[validatorName] = (string_val, $control) => {
                
                let methodRef = thisObj[validatorName];
                if (typeof methodRef != 'function') {
                    throw new Error(`the expected validator with name = [${validatorName}] is not found`, $control, string_val);   
                }

                if (item.isHidden || item.isReadonly) {
                    return undefined;
                }

                /**
                 * 返回验证逻辑，最后返回的结果
                 */
                let checkResult = methodRef.call(thisObj, string_val, $control);
                return checkResult === true ? undefined : checkResult;
            };
        });

        return mappedEvents;
    }

    /**
     * 请求协议回购行情
     */
    async requestRepoQuote() {

        /**
         * 暂不考虑支持交易员人为选择对手方行情
         */
        return;

        if (!this.isQuoteRequired) {

            this.tquote.$component.classList.add(this.classes.hidden);
            this.tquote.refill([]);
            return;
        }

        this.tquote.$component.classList.remove(this.classes.hidden);
        let resp = await this.quoteRepo.queryRepoQuotes(this.instruction.acctNo,  '协议回购行情查询');
        let records = resp.data;
        let quotes = records instanceof Array ? records.map(item => new RepoQuote(item)) : [];
        this.tquote.refill(quotes);
        this.tquote.fitColumnWidth();
    }
}

export {
    RepoUnit
};