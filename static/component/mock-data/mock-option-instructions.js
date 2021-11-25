import { dictionary } from '../dictionary';
import { helper } from '../helper';

const MKT = dictionary.market;
const DIR = dictionary.direction;
const MockedUserName = window.UserName;

const HS300List = [

	['10002171.SH', '300ETF购6月3600', '10002180.SH', '300ETF沽6月3600'],
	['10002172.SH', '300ETF购6月3700', '10002181.SH', '300ETF沽6月3700'],
	['10002173.SH', '300ETF购6月3800', '10002182.SH', '300ETF沽6月3800'],
	['10002174.SH', '300ETF购6月3900', '10002183.SH', '300ETF沽6月3900'],
	['10002175.SH', '300ETF购6月4000', '10002184.SH', '300ETF沽6月4000'],
	['10002176.SH', '300ETF购6月4100', '10002185.SH', '300ETF沽6月4100'],
	['10002177.SH', '300ETF购6月4200', '10002186.SH', '300ETF沽6月4200'],
	['10002178.SH', '300ETF购6月4300', '10002187.SH', '300ETF沽6月4300'],
	['10002179.SH', '300ETF购6月4400', '10002188.SH', '300ETF沽6月4400'],
	['10002221.SH', '300ETF购6月4500', '10002222.SH', '300ETF沽6月4500'],
	['10002229.SH', '300ETF购6月4600', '10002230.SH', '300ETF沽6月4600'],
	['10002249.SH', '300ETF购9月3700', '10002258.SH', '300ETF沽9月3700'],
	['10002250.SH', '300ETF购9月3800', '10002259.SH', '300ETF沽9月3800'],
	['10002251.SH', '300ETF购9月3900', '10002260.SH', '300ETF沽9月3900'],
	['10002252.SH', '300ETF购9月4000', '10002261.SH', '300ETF沽9月4000'],
	['10002253.SH', '300ETF购9月4100', '10002262.SH', '300ETF沽9月4100'],
	['10002254.SH', '300ETF购9月4200', '10002263.SH', '300ETF沽9月4200'],
	['10002255.SH', '300ETF购9月4300', '10002264.SH', '300ETF沽9月4300'],
	['10002256.SH', '300ETF购9月4400', '10002265.SH', '300ETF沽9月4400'],
	['10002257.SH', '300ETF购9月4500', '10002266.SH', '300ETF沽9月4500'],
	['10002271.SH', '300ETF购9月3600', '10002272.SH', '300ETF沽9月3600'],
	['10002321.SH', '300ETF购6月3300', '10002324.SH', '300ETF沽6月3300'],
	['10002322.SH', '300ETF购6月3400', '10002325.SH', '300ETF沽6月3400'],
	['10002323.SH', '300ETF购6月3500', '10002326.SH', '300ETF沽6月3500'],
	['10002327.SH', '300ETF购9月3300', '10002330.SH', '300ETF沽9月3300'],
	['10002328.SH', '300ETF购9月3400', '10002331.SH', '300ETF沽9月3400'],
	['10002329.SH', '300ETF购9月3500', '10002332.SH', '300ETF沽9月3500'],
	['10002383.SH', '300ETF购9月4600', '10002384.SH', '300ETF沽9月4600'],
	['10002413.SH', '300ETF购6月3200', '10002414.SH', '300ETF沽6月3200'],
	['10002415.SH', '300ETF购9月3200', '10002416.SH', '300ETF沽9月3200'],
	['10002429.SH', '300ETF购6月3100', '10002430.SH', '300ETF沽6月3100'],
	['10002431.SH', '300ETF购9月3100', '10002432.SH', '300ETF沽9月3100'],
	['10002451.SH', '300ETF购5月3300', '10002460.SH', '300ETF沽5月3300'],
	['10002452.SH', '300ETF购5月3400', '10002461.SH', '300ETF沽5月3400'],
	['10002453.SH', '300ETF购5月3500', '10002462.SH', '300ETF沽5月3500'],
	['10002454.SH', '300ETF购5月3600', '10002463.SH', '300ETF沽5月3600'],
	['10002455.SH', '300ETF购5月3700', '10002464.SH', '300ETF沽5月3700'],
	['10002456.SH', '300ETF购5月3800', '10002465.SH', '300ETF沽5月3800'],
	['10002457.SH', '300ETF购5月3900', '10002466.SH', '300ETF沽5月3900'],
	['10002458.SH', '300ETF购5月4000', '10002467.SH', '300ETF沽5月4000'],
	['10002459.SH', '300ETF购5月4100', '10002468.SH', '300ETF沽5月4100'],
	['10002473.SH', '300ETF购5月4200', '10002474.SH', '300ETF沽5月4200'],
	['10002495.SH', '300ETF购12月3400', '10002504.SH', '300ETF沽12月3400'],
	['10002496.SH', '300ETF购12月3500', '10002505.SH', '300ETF沽12月3500'],
	['10002497.SH', '300ETF购12月3600', '10002506.SH', '300ETF沽12月3600'],
	['10002498.SH', '300ETF购12月3700', '10002507.SH', '300ETF沽12月3700'],
	['10002499.SH', '300ETF购12月3800', '10002508.SH', '300ETF沽12月3800'],
	['10002500.SH', '300ETF购12月3900', '10002509.SH', '300ETF沽12月3900'],
	['10002501.SH', '300ETF购12月4000', '10002510.SH', '300ETF沽12月4000'],
	['10002502.SH', '300ETF购12月4100', '10002511.SH', '300ETF沽12月4100'],
	['10002503.SH', '300ETF购12月4200', '10002512.SH', '300ETF沽12月4200'],
	['10002519.SH', '300ETF购5月4300', '10002520.SH', '300ETF沽5月4300'],
	['10002521.SH', '300ETF购12月4300', '10002522.SH', '300ETF沽12月4300'],
];

const SZ50List = [

	['10001989.SH', '50ETF购6月2755A', '10001998.SH', '50ETF沽6月2755A'],
	['10001990.SH', '50ETF购6月2804A', '10001999.SH', '50ETF沽6月2804A'],
	['10001991.SH', '50ETF购6月2853A', '10002000.SH', '50ETF沽6月2853A'],
	['10001992.SH', '50ETF购6月2903A', '10002001.SH', '50ETF沽6月2903A'],
	['10001993.SH', '50ETF购6月2952A', '10002002.SH', '50ETF沽6月2952A'],
	['10001994.SH', '50ETF购6月3050A', '10002003.SH', '50ETF沽6月3050A'],
	['10001995.SH', '50ETF购6月3149A', '10002004.SH', '50ETF沽6月3149A'],
	['10001996.SH', '50ETF购6月3247A', '10002005.SH', '50ETF沽6月3247A'],
	['10001997.SH', '50ETF购6月3345A', '10002006.SH', '50ETF沽6月3345A'],
	['10002007.SH', '50ETF购6月3444A', '10002008.SH', '50ETF沽6月3444A'],
	['10002009.SH', '50ETF购6月2706A', '10002010.SH', '50ETF沽6月2706A'],
	['10002083.SH', '50ETF购6月2700', '10002092.SH', '50ETF沽6月2700'],
	['10002084.SH', '50ETF购6月2750', '10002093.SH', '50ETF沽6月2750'],
	['10002085.SH', '50ETF购6月2800', '10002094.SH', '50ETF沽6月2800'],
	['10002086.SH', '50ETF购6月2850', '10002095.SH', '50ETF沽6月2850'],
	['10002087.SH', '50ETF购6月2900', '10002096.SH', '50ETF沽6月2900'],
	['10002088.SH', '50ETF购6月2950', '10002097.SH', '50ETF沽6月2950'],
	['10002089.SH', '50ETF购6月3000', '10002098.SH', '50ETF沽6月3000'],
	['10002090.SH', '50ETF购6月3100', '10002099.SH', '50ETF沽6月3100'],
	['10002091.SH', '50ETF购6月3200', '10002100.SH', '50ETF沽6月3200'],
	['10002107.SH', '50ETF购6月3300', '10002108.SH', '50ETF沽6月3300'],
	['10002115.SH', '50ETF购6月3400', '10002116.SH', '50ETF沽6月3400'],
	['10002213.SH', '50ETF购6月3500', '10002214.SH', '50ETF沽6月3500'],
	['10002231.SH', '50ETF购9月2800', '10002240.SH', '50ETF沽9月2800'],
	['10002232.SH', '50ETF购9月2850', '10002241.SH', '50ETF沽9月2850'],
	['10002233.SH', '50ETF购9月2900', '10002242.SH', '50ETF沽9月2900'],
	['10002234.SH', '50ETF购9月2950', '10002243.SH', '50ETF沽9月2950'],
	['10002235.SH', '50ETF购9月3000', '10002244.SH', '50ETF沽9月3000'],
	['10002236.SH', '50ETF购9月3100', '10002245.SH', '50ETF沽9月3100'],
	['10002237.SH', '50ETF购9月3200', '10002246.SH', '50ETF沽9月3200'],
	['10002238.SH', '50ETF购9月3300', '10002247.SH', '50ETF沽9月3300'],
	['10002239.SH', '50ETF购9月3400', '10002248.SH', '50ETF沽9月3400'],
	['10002269.SH', '50ETF购9月2750', '10002270.SH', '50ETF沽9月2750'],
	['10002291.SH', '50ETF购6月2500', '10002295.SH', '50ETF沽6月2500'],
	['10002292.SH', '50ETF购6月2550', '10002296.SH', '50ETF沽6月2550'],
	['10002293.SH', '50ETF购6月2600', '10002297.SH', '50ETF沽6月2600'],
	['10002294.SH', '50ETF购6月2650', '10002298.SH', '50ETF沽6月2650'],
	['10002299.SH', '50ETF购9月2500', '10002304.SH', '50ETF沽9月2500'],
	['10002300.SH', '50ETF购9月2550', '10002305.SH', '50ETF沽9月2550'],
	['10002301.SH', '50ETF购9月2600', '10002306.SH', '50ETF沽9月2600'],
	['10002302.SH', '50ETF购9月2650', '10002307.SH', '50ETF沽9月2650'],
	['10002303.SH', '50ETF购9月2700', '10002308.SH', '50ETF沽9月2700'],
	['10002401.SH', '50ETF购6月2400', '10002403.SH', '50ETF沽6月2400'],
	['10002402.SH', '50ETF购6月2450', '10002404.SH', '50ETF沽6月2450'],
	['10002405.SH', '50ETF购9月2400', '10002407.SH', '50ETF沽9月2400'],
	['10002406.SH', '50ETF购9月2450', '10002408.SH', '50ETF沽9月2450'],
	['10002421.SH', '50ETF购6月2350', '10002422.SH', '50ETF沽6月2350'],
	['10002423.SH', '50ETF购9月2350', '10002424.SH', '50ETF沽9月2350'],
	['10002433.SH', '50ETF购5月2500', '10002442.SH', '50ETF沽5月2500'],
	['10002434.SH', '50ETF购5月2550', '10002443.SH', '50ETF沽5月2550'],
	['10002435.SH', '50ETF购5月2600', '10002444.SH', '50ETF沽5月2600'],
	['10002436.SH', '50ETF购5月2650', '10002445.SH', '50ETF沽5月2650'],
	['10002437.SH', '50ETF购5月2700', '10002446.SH', '50ETF沽5月2700'],
	['10002438.SH', '50ETF购5月2750', '10002447.SH', '50ETF沽5月2750'],
	['10002439.SH', '50ETF购5月2800', '10002448.SH', '50ETF沽5月2800'],
	['10002440.SH', '50ETF购5月2850', '10002449.SH', '50ETF沽5月2850'],
	['10002441.SH', '50ETF购5月2900', '10002450.SH', '50ETF沽5月2900'],
	['10002469.SH', '50ETF购5月2450', '10002470.SH', '50ETF沽5月2450'],
	['10002471.SH', '50ETF购5月2950', '10002472.SH', '50ETF沽5月2950'],
	['10002475.SH', '50ETF购5月3000', '10002476.SH', '50ETF沽5月3000'],
	['10002477.SH', '50ETF购12月2600', '10002486.SH', '50ETF沽12月2600'],
	['10002478.SH', '50ETF购12月2650', '10002487.SH', '50ETF沽12月2650'],
	['10002479.SH', '50ETF购12月2700', '10002488.SH', '50ETF沽12月2700'],
	['10002480.SH', '50ETF购12月2750', '10002489.SH', '50ETF沽12月2750'],
	['10002481.SH', '50ETF购12月2800', '10002490.SH', '50ETF沽12月2800'],
	['10002482.SH', '50ETF购12月2850', '10002491.SH', '50ETF沽12月2850'],
	['10002483.SH', '50ETF购12月2900', '10002492.SH', '50ETF沽12月2900'],
	['10002484.SH', '50ETF购12月2950', '10002493.SH', '50ETF沽12月2950'],
	['10002485.SH', '50ETF购12月3000', '10002494.SH', '50ETF沽12月3000'],
	['10002513.SH', '50ETF购12月2550', '10002514.SH', '50ETF沽12月2550'],
	['10002515.SH', '50ETF购5月3100', '10002516.SH', '50ETF沽5月3100'],
	['10002517.SH', '50ETF购12月3100', '10002518.SH', '50ETF沽12月3100'],
];

const OptionInstruments = [

	{
		market: MKT.shsec.code, 
		stockCode: '10002252.SH',
		stockName: '300ETF购9月4000',
		volume: 1960,
		mainStockCode: '510300.SH',
		mainStockName: '沪深300ETF',
		direction: DIR.buy.code,
	},

	{
		market: MKT.shsec.code, 
		stockCode: '10002261.SH',
		stockName: '300ETF沽9月4000',
		volume: 2270,
		mainStockCode: '510300.SH',
		mainStockName: '沪深300ETF',
		direction: DIR.sell.code,
	},

	{
		market: MKT.shsec.code, 
		stockCode: '10002456.SH',
		stockName: '300ETF购5月3800',
		volume: 1580,
		mainStockCode: '510300.SH',
		mainStockName: '沪深300ETF',
		direction: DIR.buy.code,
	},

	{
		market: MKT.shsec.code, 
		stockCode: '10002089.SH',
		stockName: '50ETF购6月3000',
		volume: 410,
		mainStockCode: '510050.SH',
		mainStockName: '上证50ETF',
		direction: DIR.sell.code,
	},

	{
		market: MKT.shsec.code, 
		stockCode: '10002098.SH',
		stockName: '50ETF沽6月3000',
		volume: 220,
		mainStockCode: '510050.SH',
		mainStockName: '上证50ETF',
		direction: DIR.sell.code,
	},

	{
		market: MKT.shsec.code, 
		stockCode: '10002424.SH',
		stockName: '50ETF沽9月2350',
		volume: 1190,
		mainStockCode: '510050.SH',
		mainStockName: '上证50ETF',
		direction: DIR.buy.code,
	},
];

const OptionInstructions = [];

const today = new Date().getTime();
const vDate = helper.formatDateTime(new Date(new Date() - 1000 * 60 * 60 * 24 * 7), 'yyyy-MM-dd');
const mDate = helper.formatDateTime(new Date(), 'yyyy-MM-dd');

for (let idx = 0; idx < OptionInstruments.length; idx++) {

	const opt = OptionInstruments[idx];

	OptionInstructions.push({

		entrustId: 'JY-OPTION-' + new Date().format('yyyyMMdd') + (2991 + idx),
		portfolioId: 'JYXTCSCP50',
		portfolioName: '期权模拟3A专项',
		finprodId: opt.stockCode,
		finprodAbbr: opt.stockName,
		finprodName: opt.stockName,
		assetType: dictionary.assetType.option.code,
		acctNo: '8A09:5220899101',
		ccy: 'CNY',
		busiAcctNo: '5220899101',
		acctName: '期权测试账号3A',
		secAcctId: 'JY92GG0013B2',
		secAcctName: '期权测试账号3A',
		stockHolderNo: '周侃侃',
		tradeMarket: opt.market,
		tradePlat: undefined,
		finprodMarketId: opt.stockCode,
		ps: opt.direction,
		counterId: 'JYOPT30000193',
		counterSeat: undefined,
		counterTrader: undefined,
		counterInfo: undefined,
		counterDealerId: undefined,
		appointmentNumber: undefined,
		dealNo: undefined,
		trdMatchId: undefined,
		quoterefId: undefined,
		tradeDate: new Date().format('yyyy-MM-dd'),
		vdate: vDate,
		mdate: mDate,
		entrustAmt: 0,
		entrustNum: opt.volume,
		entrustLeftAmt: 0,
		frozenQuantity: 0,
		entrustStatus: dictionary.instatus.received.code,
		entrustPrice: 0,
		fullPrice: 0,
		priceMode: dictionary.priceMode.limited.code,
		entrustLeftAmt: 0,
		settleSpeed: 0,
		valueDate: today,
		valueDate2: today,
		termDays: 0,
		termDays2: 0,
		purchType: undefined,
		saleCode: undefined,
		minAmt: 0,
		tarFinprodId: opt.mainStockCode,
		tarinprodMarketId: opt.mainStockCode,
		tarinprodAbbr: opt.mainStockName,
		tradeId: MockedUserName,
		traderName: MockedUserName,
		invManagerId: 'jiaoyi902',
		assetType1: undefined,
	});
}




const Option2TargetGroupMap = {

	'510300.SH': HS300List,
	'510050.SH': SZ50List,
};

/**
 * 寻找某个主合约下的期权列表
 * @param {String} main_stock_code 期权对应主合约代码
 * @returns {Array<{ longStockCode: String, longStockName: String, shortStockCode: String, shortStockName: String, strikePrice: Number }>}
 */
function SiblingOptionsSeeker(main_stock_code) {

	let matched = Option2TargetGroupMap[main_stock_code];

	if (matched instanceof Array) {

		return matched.map(x => ({

			longStockCode: x[0], 
			longStockName: x[1], 
			shortStockCode: x[2], 
			shortStockName: x[3], 
			strikePrice: +(parseInt(x[1].split('月')[1]) * 0.001).toFixed(4),
		}));
	}
	else {
		return [];
	}
}

export { OptionInstructions, SiblingOptionsSeeker };