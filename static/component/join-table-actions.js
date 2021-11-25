
import { helper } from './helper';
import { dictionary } from './dictionary';
import { Instruction, DowningDto, Entrust, Exchange, ScaleEntrust, Order } from './models';

const Unspecified = '---';

function formatUnusualVal(field_val) {
    return helper.isNone(field_val) ? Unspecified : field_val;
}

const JoyinTableActions = {

    formatUnusualVal: function (row_data, field_value, field_name) {
        return formatUnusualVal(field_value);
    },

    formatDateTime: function (row_data, date_time, field_name) {
        return helper.formatDateTime(date_time, 'yyyy-MM-dd hh:mm:ss');
    },

    formatDate: function (row_data, date_time, field_name) {
        return helper.formatDateTime(date_time, 'yyyy-MM-dd');
    },

    formatTime: function (row_data, date_time, field_name) {
        return helper.formatDateTime(date_time, 'hh:mm:ss');
    },

    formatCheckCol: function (row_data, data, field_name) {
        return `<input type="checkbox" />`;
    },

    formatTerminalType: function (row_data, type, field_name) {

        var matched = dictionary.terminalTypes.find(x => x.code == type);
        return matched ? matched.mean : type;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatUnitedVolume: function (row_data, volume, field_name) {

        let matched = dictionary.assetTypes.find(x => x.code == row_data.assetType);
        let unit = matched ? matched.unit : '';
        return typeof volume == 'number' ? helper.thousands(volume) + unit : volume;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatScaleReportType: function (row_data, report_type, field_name) {

        var matched = dictionary.scaleReportTypes.find(x => x.code == report_type);
        return matched ? matched.mean : report_type;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatInstrucDirection: function (row_data) {

        var direction = row_data.direction;
        var matched = dictionary.directions.find(x => x.code == direction);
        if (matched === undefined) {
            return direction;
        }

        let dirName = matched.mean;

        /**
         * 期货交易
         */
        if (row_data.isFuture) {

            let offsetFlag = row_data.offsetFlag;
            let matchedFuture = dictionary.positionEffects.find(x => x.code == offsetFlag);
            return matchedFuture === undefined  ? dirName : `${dirName}${matchedFuture.mean}`;
        }

        if (helper.isNone(row_data.repoOperation)) {
            return matched.mean;
        }

        let matchedRepo = dictionary.repoOperations.find(x => x.code == row_data.repoOperation);
        return matchedRepo === undefined ? dirName : `${dirName}-${matchedRepo.mean}`;
    },

    /**
     * @param {DowningDto} record 
     */
    formatHsDirection: function (record) {

        const DIR = dictionary.direction;
        const HSD = dictionary.hsdirection;
        const ETP = dictionary.entrustProp;
        const AST = dictionary.assetType;

        let hsdir = record.direction;
        let hsdirName = hsdir == HSD.buy.code ? HSD.buy.mean : HSD.sell.mean;
        let isBuy = hsdir == HSD.buy.code;
        let eprop = record.entrustProp;
        let asset = record.assetType;
        
        /**
         * 普通限价委托
         */

        if (eprop == ETP.normal.code) {
            return hsdirName;
        }
        
        /**
         * 质押出入质
         */

        if (eprop == ETP.pledge.code) {
            return isBuy ? DIR.unseal.mean : DIR.seal.mean;
        }
        
        /**
         * 回购
         */

        if (eprop == ETP.repurchase.code || asset == AST.standardVoucher.code) {
            return isBuy ? DIR.positiveRepo.mean : DIR.reversedRepo.mean;
        }

        /**
         * 快速交易大类
         */

        if (this._dictQuickProps === undefined) {

            let quicks = dictionary.entrustProps.filter(item => item.isQuick === true);
            this._dictQuickProps = helper.array2Dict(quicks, item => item.code);
        }

        let quickInfo = this._dictQuickProps[eprop];
        if (quickInfo) {
            return quickInfo.mean;
        }

        /**
         * 大宗交易
         */

        // if (this._dictScaleProps === undefined) {

        //     let scales = dictionary.entrustProps.filter(item => item.isScale === true);
        //     this._dictScaleProps = helper.array2Dict(scales, item => item.code);
        // }

        // let scaleInfo = this._dictScaleProps[eprop];
        // if (scaleInfo) {
        //     return scaleInfo.mean;
        // }

        /**
         * 固收交易
         */

        // if (this._dictConstrProps === undefined) {

        //     let constrs = dictionary.entrustProps.filter(item => item.isConstr === true);
        //     this._dictConstrProps = helper.array2Dict(constrs, item => item.code);
        // }

        // let constrInfo = this._dictConstrProps[eprop];
        // if (constrInfo) {
        //     return constrInfo.mean;
        // }

        /**
         * 协议回购交易
         */

        if (this._dictRepoProps === undefined) {

            let repos = dictionary.entrustProps.filter(item => item.isRepo === true);
            this._dictRepoProps = helper.array2Dict(repos, item => item.code);
        }

        let repoInfo = this._dictRepoProps[eprop];
        if (repoInfo) {
            return isBuy ? DIR.positiveRepo.mean : DIR.reversedRepo.mean;
        }

        return hsdirName;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatRepoDirection: function (row_data, direction, field_name) {

        const dir = dictionary.direction;
        if (direction == dir.positiveRepo.code) {
            return dir.positiveRepo.mean;
        }
        else if (direction == dir.reversedRepo.code) {
            return dir.reversedRepo.mean;
        }
        return Unspecified;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatMarket: function (row_data, market_id, field_name) {

        if (market_id == 'SH') {
            return dictionary.market.shsec.mean;
        }
        else if (market_id == 'SZ') {
            return dictionary.market.szsec.mean;
        }

        var matched = dictionary.markets.find(x => x.code == market_id);
        return matched ? matched.mean : formatUnusualVal(market_id);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatPlatform: function (row_data, trade_plat, field_name) {

        var matched = dictionary.platforms.find(x => x.code == trade_plat);
        return matched ? matched.mean : formatUnusualVal(trade_plat);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatAssetType: function (row_data, asset_type, field_name) {

        var matched = dictionary.assetTypes.find(x => x.code == asset_type);
        return matched ? matched.mean : formatUnusualVal(asset_type);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatRepoType: function (row_data, repo_type, field_name) {

        var matched = dictionary.repoTypes.find(x => x.code == repo_type);
        return matched ? matched.mean : '';
    },

    /**
     * @param {Instruction} row_data 
     */
    formatPriceMode: function (row_data, price_mode, field_name) {

        var matched = dictionary.priceModes.find(x => x.code == price_mode);
        return matched ? matched.mean : formatUnusualVal(price_mode);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatPrice: function (row_data, price, field_name) {
        return helper.thousandsDecimal(price, row_data.queryStockPricePrecision(row_data.tradePlat));
    },

    /**
     * @param {Instruction} row_data 
     */
    formatInstrucStatus: function (row_data, ins_status, field_name) {

        var matched = dictionary.instatuses.find(x => x.code == ins_status);
        return matched ? matched.mean : formatUnusualVal(ins_status);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatDealProgress: function(row_data, deal_progress, field_name) {

        if(row_data.isApply) {
            return `<span class="s-color-gray">N/A</span>`;
        }
        else{
            return this.formatProgress(deal_progress, true);
        }
    },

    /**
     * @param {Instruction} row_data 
     */
    formatDealProgressText: function(row_data, deal_progress, field_name) {

        if(row_data.isApply) {
            return `<span class="s-color-gray">N/A</span>`;
        }
        else{
            return this.formatProgress(deal_progress, true, true);
        }
    },

    /**
     * @param {Instruction} row_data 
     */
    formatInstrucProgress: function (row_data, ins_progress, field_name) {
        return this.formatProgress(ins_progress, true);
    },

    /**
     * @param {Instruction} row_data 
     */
    formatInstrucProgressText: function (row_data, ins_progress, field_name) {
        return this.formatProgress(ins_progress, true, true);
    },

    /**
     * @param {Number} progress 
     * @param {Boolean} by100 
     * @param {Boolean} asText 
     */
    formatProgress: function (progress, by100 = true, asText = false) {
        
        let factor = by100 == true ? 100 : 1;
        let calculated = typeof progress == 'number' ? progress * factor : 0;
        let percent = calculated.toFixed(2);
        let title_percent = calculated.toFixed(5);

        if (asText) {
            return percent + '%';
        }

        return `<div class="layui-progress layui-progress-big" title="${ title_percent }%">
                    <div class="layui-progress-bar" style="width: ${ percent }%;">
                        <span class="layui-progress-text">${ percent }%</span>
                    </div>
                </div>`;
    },

    /**
     * @param {Instruction} row_data 
     */
    formatEntrustProgress: function (row_data, ins_progress, field_name) {
        
        let percent = 0
        if (!(isNaN(ins_progress) || ins_progress <0 || ins_progress > 1)) {
            percent = +(100 * ins_progress).toFixed(2);
        }
        return `<div class="layui-progress layui-progress-big">
                    <div class="layui-progress-bar" style="width: ${ percent }%;">
                        <span class="layui-progress-text">${ percent }%</span>
                    </div>
                </div>`;
    },

    /**
     * @param {Entrust|ScaleEntrust} row_data 
     * @param {String} entrust_prop 
     * @param {String} field_name 
     */
    formatEntrustProp: function (row_data, entrust_prop, field_name) {

        var matched = dictionary.scaleReportTypes.find(x => x.code == entrust_prop);
        if (matched) {
            return matched.mean;
        }

        matched = dictionary.constrReportTypes.find(x => x.code == entrust_prop);
        if (matched) {
            return matched.mean;
        }

        matched = dictionary.entrustProps.find(x => x.code == entrust_prop);
        return matched ? matched.mean : formatUnusualVal(entrust_prop);
    },

    /**
     * @param {Order} row_data 
     * @param {String} entrust_status 
     * @param {String} field_name 
     */
    formatOrderStatus: function (row_data, order_status, field_name) {

        var matched = dictionary.orderStatuses.find(x => x.code == order_status);
        return matched ? matched.mean : formatUnusualVal(order_status);
    },

    /**
     * @param {Entrust|ScaleEntrust} row_data 
     * @param {String} entrust_status 
     * @param {String} field_name 
     */
    formatEntrustStatus: function (row_data, entrust_status, field_name) {

        var matched = dictionary.entrustStatuses.find(x => x.code == entrust_status);
        return matched ? matched.mean : formatUnusualVal(entrust_status);
    },

    /**
     * @param {Entrust|ScaleEntrust} row_data 
     * @param {Number} entrust_volume 
     * @param {String} field_name 
     */
    formateEntrustAmount: function (row_data, entrust_volume, field_name) {

        var amount = row_data.assetType == dictionary.assetType.standardVoucher.code ? 
                     row_data.entrustVolume * 100 :
                     row_data.entrustVolume * row_data.entrustPrice;

        return amount.toFixed(2);
    },

    /**
     * @param {Entrust} row_data 
     * @param {Number} entrust_volume 
     * @param {String} field_name 
     */
    formatEntrustStandardBondVolume: function (row_data, entrust_volume, field_name) {

        var pledged_ratio = row_data.entrustPrice;
        var volume = entrust_volume * (pledged_ratio / 100);
        return helper.thousandsInteger(volume);
    },

    /**
     * @param {Entrust} row_data 
     * @param {Number} entrust_volume 
     * @param {String} field_name 
     */
    formatBond2StockVolume: function (row_data, entrust_volume, field_name) {

        var stockVolume = entrust_volume * 100 / row_data.entrustPrice;
        return helper.thousandsInteger(stockVolume);
    },

    /**
     * 
     * @param {Exchange} row_data 
     * @param {Number} traded_volume 
     * @param {String} field_name 
     */
    formatExchangeStandardBondVolume: function (row_data, traded_volume, field_name) {

        var pledged_ratio = row_data.tradedPrice;
        var standardBondVolume = traded_volume * (pledged_ratio / 100);
        return  helper.thousandsInteger(standardBondVolume);
    },

    /**
     * @param {*} row_data 
     * @param {Number} field_value 
     * @param {String} field_name 
     */
    thousands: function (row_data, field_value, field_name) {
        return helper.thousands(field_value);
    },

    /**
     * @param {*} row_data 
     * @param {Number} field_value 
     * @param {String} field_name 
     */
    thousandsInteger: function (row_data, field_value, field_name) {
        return helper.thousandsInteger(field_value);
    },
}

export { JoyinTableActions };