import { helper } from '../helper';
import { TickData, Instruction } from '../models';
import { dictionary } from '../dictionary';
import { TradingUnit, NumberControl, SelectControl } from './trading-unit';

class LevelItem {

    /**
     * @param {HTMLElement} $item 
     */
    constructor ($item) {
        
        this.$price = $item.querySelector('.level-price');
        this.$volume = $item.querySelector('.level-volume');
    }
}

class LevelPanel {

    /**
     * 
     * @param {HTMLElement} $root 
     */
    constructor ($root) {

        var $bulletin = $root.querySelector('.price-bulletin');
        var $boundary = $root.querySelector('.price-boundary');
        var $level_sell = $root.querySelector('.level-sell');
        var $level_buy = $root.querySelector('.level-buy');

        this.$header = $root.querySelector('h3');

        this.$lastPrice = $bulletin.querySelector('.latest-price > a');
        this.$up = $bulletin.querySelector('.change-direction > .icon-up');
        this.$down = $bulletin.querySelector('.change-direction > .icon-down');
        this.$change = $bulletin.querySelector('.change-info > .change');
        this.$percent = $bulletin.querySelector('.change-info > .percentage');

        this.$open = $boundary.querySelector('.item-open > a');
        this.$preclose = $boundary.querySelector('.item-preclose > a');
        this.$ceiling = $boundary.querySelector('.item-ceiling > a');
        this.$floor = $boundary.querySelector('.item-floor > a');

        /**
         * 卖出档位，数组顺序 ~ 卖N > 卖1 (顺序见html文档内容)
         */
        this.$sells = this._makeLevel2($level_sell);

        /**
         * 买入档位，数组顺序 ~ 买1 > 买N (顺序见html文档内容)
         */
        this.$buys = this._makeLevel2($level_buy);
    }

    /**
     * @param {HTMLElement} $level_root 
     * @returns {Array<LevelItem>} 
     */
    _makeLevel2 ($level_root) {

        var levels = [];
        var $items = $level_root.querySelectorAll('.level-item');
        
        for (let idx = 0; idx < $items.length; idx++) {
            levels.push(new LevelItem($items[idx]));
        }

        return levels;
    }
}

/**
 * 带有LEVEL2行情的交易单元
 */
class Level2Unit extends TradingUnit {

    /**
     * @param {String} identifier
     * @param {Function} submitter
     */
    constructor(identifier, submitter) {
        super(identifier, submitter);
    }

    build() {

        /** level2 组件 */
        this.level2 = new LevelPanel(this.$content.querySelector('.level2-panel'));

        /** 绑定价格锚点，快捷方式 */
        this._enablePriceAnchor();
    }

    setTick(tick_data) {

        super.setTick(tick_data);

        /**
         * 更新level2显示数据
         */
        this.updateLevel2(tick_data);
    }

    /**
     * 设置为下单价格
     * @param {Number} price 
     */
    setAsPrice(price) {
        console.error('price setting request not handled');
    }

    _enablePriceAnchor() {

        const thisObj = this;
        const level2 = this.level2;
        const $anchors = [

            level2.$lastPrice,
            level2.$open, 
            level2.$preclose, 
            level2.$ceiling, 
            level2.$floor,
            ...level2.$sells.map(x => x.$price),
            ...level2.$buys.map(x => x.$price)
        ];

        $anchors.forEach($anchor => {
            $anchor.onclick = function() {
                
                if (helper.isNumber(+event.target.innerText)) {
                    thisObj.setAsPrice(+event.target.innerText);
                }
                else {
                    thisObj.setAsPrice(0);
                }
               
            }
        });
    }

    /**
     * 更新level2面板数据信息
     * @param {TickData} tick_data 
     */
    updateLevel2(tick_data) {
        
        var level2 = this.level2;
        var precision = this.contextPricePrecision;
        const instruc = this.instruction;

        /**
         * @param {LevelPanel} levelp 
         * @param {TickData} tick_data 
         * @param {Instruction} instruc 
         */
        function updateLevels(levelp, tick_data, instruc) {
            
            let levelIndex = levelp.$sells.length - 1;
            /**
             * 债券及质押式回购行情数据源是张，不用处理;其它资产行情数据源是手，数量需除100处理;
             */
            let countNum = 0.01;
            
            if(instruc.assetType == dictionary.assetType.bond.code || instruc.assetType == dictionary.assetType.standardVoucher.code) {
                countNum = 1;
            }

            levelp.$sells.forEach(($item, level_no) => {

                $item.$price.textContent = (calculationData(tick_data.sells[levelIndex], instruc) || 0).toFixed(precision);
                $item.$volume.textContent = Math.floor((tick_data.sellVolumes[levelIndex--] || 0) * countNum);
                
            });

            levelp.$buys.forEach(($item, level_no) => {
                
                $item.$price.textContent = (calculationData(tick_data.buys[level_no], instruc) || 0).toFixed(precision);
                $item.$volume.textContent = Math.floor((tick_data.buyVolumes[level_no] || 0) * countNum);
            });
        };

        /**
         * 行情展示数据处理，是最小差价得倍数
         * @param {*} processedValue 
         * @param {Instruction} instruc 
         */
        function calculationData(processedValue, instruc) {
            
            if (!processedValue) {
                return processedValue;
            }
            
            let minStep = instruc.priceSettings.length > 0 ? instruc.priceSettings[0].minStep : 0;

            if (minStep) {
                return Math.floor(processedValue / minStep) * minStep;
            }
            else {
                return processedValue;
            } 
        }

        /**
         * 清除已设置合约level2行情信息
         */

        if (!tick_data) {

            const zero = '0.00'

            level2.$lastPrice.textContent = zero;
            level2.$lastPrice.className = 'price-anchor';
            level2.$up.style.display = 'none';
            level2.$down.style.display = 'none';
            level2.$change.textContent = zero;
            level2.$change.className = 'change';
            level2.$percent.textContent = '0.00%';
            level2.$percent.className = 'percentage';
            level2.$open.textContent = zero;
            level2.$open.className = 'price-anchor';
            level2.$preclose.textContent = zero;
            level2.$ceiling.textContent = zero;
            level2.$floor.textContent = zero;

            level2.$sells.forEach(($item, level_no) => {

                $item.$price.textContent = zero;
                $item.$volume.textContent = 0;
            });

            level2.$buys.forEach(($item, level_no) => {

                $item.$price.textContent = zero;
                $item.$volume.textContent = 0;
            });

            delete this._last_tick_data;
        }

        else if (this._last_tick_data === undefined || this._last_tick_data.stockCode !== tick_data.stockCode) {

            /**
             * 新合约
             */

            let change = tick_data.latest - tick_data.preclose;
            let is_up = change > 0;
            let is_down = change < 0;
            let color_class = is_up ? 's-color-red' : is_down ? 's-color-green' : '';
            let anchor_class = 'price-anchor ' + color_class;
            let direction_flag = is_up ? '+' : is_down ? '-' : '';

            level2.$lastPrice.textContent = calculationData(tick_data.latest, instruc).toFixed(precision);
            level2.$lastPrice.className = anchor_class;
            level2.$up.style.display = is_up ? 'inline' : 'none';
            level2.$down.style.display = is_down ? 'inline' : 'none';
            level2.$change.textContent = direction_flag + change.toFixed(precision);
            level2.$change.className = 'change ' + color_class;
            level2.$percent.textContent = direction_flag + (100 * change / tick_data.preclose).toFixed(2) + '%';
            level2.$percent.className = 'percentage ' + color_class;
            level2.$open.textContent = calculationData(tick_data.open, instruc).toFixed(precision);
            level2.$open.className = anchor_class;
            level2.$preclose.textContent = calculationData(tick_data.preclose, instruc).toFixed(precision);
            level2.$ceiling.textContent = tick_data.ceiling >= 10000000 ? '-----' : calculationData(tick_data.ceiling, instruc).toFixed(precision);
            level2.$floor.textContent = calculationData(tick_data.floor, instruc).toFixed(precision);

            updateLevels(level2, tick_data, instruc);
            this._last_tick_data = tick_data;
        }
        else {

            /**
             * 合约未产生变化，行情发生变化
             */

            let change = tick_data.latest - tick_data.preclose;
            let hot_change = tick_data.latest - this._last_tick_data.latest;

            if (hot_change == 0) {
                return;
            }

            let is_up = change > 0;
            let is_down = change < 0;
            let is_hot_up = hot_change > 0;
            let is_hot_down = hot_change < 0;

            let color_class = is_up ? 's-color-red' : is_down ? 's-color-green' : '';
            let anchor_class = 'price-anchor ' + color_class;
            let direction_flag = is_up ? '+' : is_down ? '-' : '';

            level2.$lastPrice.textContent = calculationData(tick_data.latest, instruc).toFixed(precision);
            level2.$lastPrice.className = anchor_class;
            level2.$up.style.display = is_hot_up ? 'inline' : 'none';
            level2.$down.style.display = is_hot_down ? 'inline' : 'none';
            level2.$change.textContent =  direction_flag + change.toFixed(precision);
            level2.$change.className = 'change ' + color_class;
            level2.$percent.textContent = direction_flag + (100 * change / tick_data.preclose).toFixed(2) + '%';
            level2.$percent.className = 'percentage ' + color_class;

            /**
             * 如果合约未产生变化，仅为tick数据变更，则仅更新level2各档位价格和数量，不再检查各表单的价格值是否在有效涨跌停范围内
             */
            updateLevels(level2, tick_data, instruc);
            
            this._last_tick_data = tick_data;
        }
    }
}

export { TradingUnit, Level2Unit, NumberControl, SelectControl };