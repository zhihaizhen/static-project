
/**
 * 场内交易依赖样式
 */

import './css/trading.scss';
import '../component/joyin-table.scss';

/**
 * 浏览器和语法兼容
 */

import "babel-polyfill";

/**
 * 导入各个视图模块
 */

import { BaseModule } from './trading/base';
import { ModuleToolbar } from './trading/toolbar';
import { ModuleInstruction } from './trading/instruction';
import { ModuleDetail } from './trading/detail';
import { ModuleOrdering } from './trading/ordering';
import { ModuleRecords } from './trading/records';
import { ModuleWorker } from './trading/worker';

import { Instruction } from '../component/models';
import { DataRepo } from '../component/repos/data-repo';
import { TradingUnit } from '../component/units/unit-level2';

class PageController {

    constructor() {

        /**
         * 为LEVEL2依赖型交易单元，准备必要的DOM结构
         */
        ModuleWorker.setupLevel2Doms();

        /** 工具栏模块 */
        this.mtoolbar = new ModuleToolbar(document.querySelector('#toolbar'), {

            seekChecks: this.seekChecks.bind(this),
            searcher: this.search.bind(this),
            refresher: this.refresh.bind(this),
            batchReceive: this.batchReceive.bind(this),
            batchRelease: this.batchRelease.bind(this),
            batchQuickOrderCompleted: this.batchQuickOrderCompleted.bind(this),
            exportInstructions: this.exportInstructions.bind(this)
        });

        /** 指令列表模块 */
        this.minstruc = new ModuleInstruction(document.querySelector(BaseModule.Selectors.tinstruc), { rowInsSelected: this.handleRowInsSelect.bind(this) });
        /** 指令详情展示模块 */
        this.mdetail = new ModuleDetail(document.querySelector(BaseModule.Selectors.detailp));
        /** 交易单元模块 */
        this.mordering = new ModuleOrdering(document.querySelector(BaseModule.Selectors.leftp), {
            
            unitSwitched: this.handleUnitSwitched.bind(this),
            orderPlaced: this.handleOrderPlaced.bind(this),
            siblingSeeker: this.seekSiblings.bind(this),
            equalSiblingChanged: this.handleEqualSiblingChanged.bind(this),
        });

        /** 交易数据模块 */
        this.mrecords = new ModuleRecords(document.querySelector(BaseModule.Selectors.rightp), {

            orderCanceled: this.handleOrderCanceled.bind(this),
            entrustCanceled: this.handleEntrustCanceled.bind(this),
        });

        /** 打杂工作模块 */
        this.mworker = new ModuleWorker(document.querySelector('#content-root'), {
            
            mdetail: this.mdetail, 
            mordering: this.mordering,
            mrecords: this.mrecords,
        });

        /**
         * 数据访问模块
         */
        this.dataRepo = new DataRepo();
    }

    /**
     * @param {Instruction} instruction
     */
    handleRowInsSelect(instruction) {
        this.mworker.takeAction(instruction);
    }

    /**
     * 处置交易单元切换事件
     * @param {TradingUnit} unit
     */
    handleUnitSwitched(unit) {
        this.mrecords.handleUnitSwitched(unit);
    }

    /**
     * 同步当前指令适配的交易单元状态 - 在获取新的指令信息后
     * @param {Instruction} instruction
     */
    syncUnits(instruction) {

        let thisObj = this;

        /**
         * 下单完成，延迟一定时长，对原始指令作反向刷新，以反映指令最新状态
         */
        setTimeout(async function() {

            await thisObj.minstruc.request2Update(instruction.id);
            thisObj.mordering.syncUnits(); }, 1000);
    }

    /**
     * 处置下单事件
     * @param {Instruction} instruction 下单所属目标指令
     * @param {*} feedback 下单反馈
     */
    handleOrderPlaced(instruction, feedback) {

        this.syncUnits(instruction);

        /**
         * 通知数据列表模块，有新的订单（委托产生）
         */
        this.mrecords.handleOrderPlaced(instruction, feedback);
    }

    /**
     * 处置撤订单事件
     * @param {Instruction} instruction 撤订单所属目标指令
     * @param {*} feedback 撤订单反馈
     */
    handleOrderCanceled(instruction, feedback) {
        this.syncUnits(instruction);
    }

    /**
     * 处置撤委托事件
     * @param {Instruction} instruction 撤委托所属目标指令
     * @param {*} feedback 撤委托反馈
     */
    handleEntrustCanceled(instruction, feedback) {
        this.syncUnits(instruction);
    }

    /**
     * 查找互为公平交易的指令
     * @param {Instruction} source_instruction
     * @returns {Array<Instruction>}
     */
    seekSiblings(source_instruction) {
        return this.isEqualTradingEnabled ? this.minstruc.filterSiblings(source_instruction) : [];
    }

    /**
     * 处理互为公平交易的指令列表，选中事件
     * @param {Instruction} instruction 
     */
    handleEqualSiblingChanged(instruction) {
        this.mrecords.takeAction(instruction);
    }

    /**
     * 探查处于勾选状态的指令
     * @returns {Array<Instruction>}
     */
    seekChecks() {
        return this.minstruc.getCheckeds();
    }

    /**
     * 指令列表导出
     */
    exportInstructions() {
        return this.minstruc.exportInstructs();
    }

    /**
     * 探查处于勾选状态的指令
     * @param {*} condition
     * @returns {Array<Instruction>}
     */
    search(options) {

        this.minstruc.uncheckAll();
        return this.minstruc.filter(options);
    }

    /**
     * 执行刷新会执行回调
     * @param {Function} callback 
     */
    refresh(callback) {
        this.minstruc.requestInstructions().then(_ => { callback(); });
    }

    /**
     * 批量接收指令
     * @param {Array<Instruction>} instructions
     */
    batchReceive(instructions) {

        this.minstruc.receive(instructions);
        this.minstruc.uncheckAll();
    }

    /**
     * 批量放弃指令
     * @param {Array<Instruction>} instructions
     */
    batchRelease(instructions) {

        this.minstruc.release(instructions);
        this.minstruc.uncheckAll();
    }

    /**
     * 批量快速下单
     * @param {Array<Instruction>} instructions
     */
    batchQuickOrderCompleted(instructions) {

        console.log('batch quick done', instructions);
        this.minstruc.uncheckAll();
    }

    /**
     * 请求 & 设置，平台交易日
     */
    async requestSetPlatDate() {

        let resp_date = await this.dataRepo.queryPlatDate();

        if (resp_date.errorCode == 0 ) {
            
            let plat_date = resp_date.data;

            /**
             * 平台交易日，格式 yyyy-MM-dd
             */
            this.tradingDay = new Date(plat_date).format('yyyy-MM-dd');

            /**
             * 设置为平台交易日
             */
            BaseModule.SetAsTradingDay(this.tradingDay);
        }
        else {
            console.error(resp_date);
        }
    }

    /**
     * 请求 & 设置，公平交易标识
     */
    async requestSetEqualFlag() {

        let resp_equal = await this.dataRepo.requestEqualFlag();
        
        /** 系统是否启用公平交易 */
        this.isEqualTradingEnabled = resp_equal.paramValue == '01';
    }

    /**
     * 请求指令数据
     */
    requestInstructions() {
        this.minstruc.requestInstructions();
    }

    build() {

        this.requestSetPlatDate();
        this.requestSetEqualFlag();
        this.requestInstructions();
    }
}

window.pgc = new PageController();
window.pgc.build();
