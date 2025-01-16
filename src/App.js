import React, { useState, useEffect } from 'react';
import ExchangeRateSelector from './components/ExchangeRateSelector';
import PeriodSelector from './components/PeriodSelector';
import DatePicker from './components/DatePicker';
import ResultDisplay from './components/ResultDisplay';
import './style.css';

/** 计算两个日期之间的天数（向上取整） */
function daysBetween(a, b) {
    return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
}

/** 获取指定日期所在自然月的总天数 (28 ~ 31) */
function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return new Date(year, month, 0).getDate();
}

/**
 * 精确月付：按“整月 + 部分月”计算费用
 * 例：1/16 ~ 2/15，不足1个自然月 => (30 / 31) * monthlyPrice
 *     1/16 ~ 2/16 => 1个月
 *     1/16 ~ 2/17 => 1个月 + 1天(用当月天数做分母或固定30视你需要)
 */
function calculateMonthlyCostPrecisely(start, end, monthlyPrice) {
    if (end <= start) return 0;

    let current = new Date(start);
    let totalCost = 0;

    while (true) {
        const daysInThisMonth = getDaysInMonth(current);

        // 下个月对日
        const nextMonth = new Date(current);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // 尝试保留同一天的日期
        const expectedDay = current.getDate();
        nextMonth.setDate(expectedDay);

        if (nextMonth > end) {
            // 不满1个月，计算“部分月”
            const partialDays = daysBetween(current, end);
            const partialDailyPrice = monthlyPrice / daysInThisMonth;
            totalCost += partialDays * partialDailyPrice;
            break;
        } else {
            // 整月
            totalCost += monthlyPrice;
            current = nextMonth;
            if (current >= end) {
                break;
            }
        }
    }

    return totalCost;
}

/**
 * 通用 N 个月付：半年(6)/一年(12)/两年(24)等
 * 根据到期日往前推 periodInMonths 个月，求对应区间天数 -> 得出日单价
 * 再看“实际剩余天数”若超出周期天数则封顶
 */
function calculateRemainingValueForNMonths(
    startDate,
    endDate,
    price,
    periodInMonths
) {
    // 周期的“起点” = endDate - periodInMonths(反向)
    const periodStart = new Date(endDate);
    periodStart.setMonth(periodStart.getMonth() - periodInMonths);

    // 周期天数
    const totalDays = daysBetween(periodStart, endDate);

    // 日单价
    const dailyCost = price / totalDays;

    // 实际剩余天数(从 startDate 到 endDate)
    let leftoverDays = daysBetween(startDate, endDate);

    // 剩余天数不超过周期总天数
    if (leftoverDays > totalDays) {
        leftoverDays = totalDays;
    }

    return leftoverDays * dailyCost;
}

/** 构造计算步骤文案，减少在主函数内拼接 */
function buildCalculationSteps({
    period,
    startDate,
    endDate,
    currency,
    exchangeRate,
    periodicPrice,
    resultValue,
}) {
    const periodMonths = parseInt(period, 10);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // 月付场景
    if (periodMonths === 1) {
        return `
1. 按月付（精确到整月+剩余天）计算。
2. 交易日: ${startDateStr} ~ 到期日: ${endDateStr} 期间，逐月计算费用。
3. 剩余价值 = ${resultValue.toFixed(3)} ${currency}。
4. 折合人民币 ≈ ${(resultValue / exchangeRate).toFixed(3)} CNY。
`.trim();
    }

    // 非月付场景
    // 例如半年(6)/1年(12)/2年(24)... => “周期天数 + 日单价 * 剩余天数” 计算法
    const periodEnd = new Date(endDate);
    periodEnd.setMonth(periodEnd.getMonth() - periodMonths);
    const totalDays = daysBetween(periodEnd, endDate);
    const dailyPrice = (periodicPrice / totalDays).toFixed(3);
    const remainingDays = daysBetween(startDate, endDate);
    const periodDateStr = periodEnd.toISOString().split('T')[0];
    return `
1. 到期日逆推${periodMonths}个月的日期为${periodDateStr}。
2. 此周期天数为: ${totalDays}天, 每天单价 = ${periodicPrice}/${totalDays} = ${dailyPrice} ${currency}/天。
3. 交易日 ${startDateStr} ~ 到期日 ${endDateStr} => 剩余天数 = ${remainingDays}。
4. 剩余价值 = ${dailyPrice} × ${remainingDays} = ${resultValue.toFixed(3)} ${currency}。
${currency !== 'CNY'
            ? `5. 折合人民币 ≈ ${(resultValue / exchangeRate).toFixed(3)} CNY。`
            : ''
        }
`.trim();
}

const App = () => {
    const [currency, setCurrency] = useState('CNY');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [exchangeRateCNY, setExchangeRateCNY] = useState(1);

    // "周期金额"。若 period=6，则表示“半年价格”，若=12则是“一年价格”
    const [periodicPrice, setPeriodicPrice] = useState(10);

    // period='1' => 月付；'6' => 半年；'12' => 年付；'24' => 两年付等
    const [period, setPeriod] = useState('1');

    // 交易日 & 到期日
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [expiryDate, setExpiryDate] = useState(() => {
        const today = new Date();
        today.setMonth(today.getMonth() + 1)
        return today;
    });

    // 计算结果
    const [remainingValue, setRemainingValue] = useState(0);
    const [remainingValueCNY, setRemainingValueCNY] = useState(0);
    const [calculationSteps, setCalculationSteps] = useState('');
    const [transactionPrice, setTransactionPrice] = useState(0);
    const [priceDifference, setPriceDifference] = useState(0);

    /** 主计算函数 */
    const calculateRemainingValue = () => {
        const start = new Date(transactionDate);
        const end = new Date(expiryDate);
        const periodMonths = parseInt(period, 10);

        // 1) 计算剩余价值
        let valueInUserCurrency = 0;
        if (periodMonths === 1) {
            // 按月付（整月+剩余天）
            valueInUserCurrency = calculateMonthlyCostPrecisely(start, end, periodicPrice);
        } else {
            // 半年/年/多年的通用处理
            valueInUserCurrency = calculateRemainingValueForNMonths(
                start, end, periodicPrice, periodMonths
            );
        }

        // 2) 汇率换算
        const valueCNY = valueInUserCurrency / exchangeRate;
        const diffPrice = transactionPrice - valueCNY;

        setRemainingValue(valueInUserCurrency.toFixed(3));
        setRemainingValueCNY(valueCNY.toFixed(3));
        setPriceDifference(diffPrice.toFixed(3));

        // 3) 拼接计算过程说明
        const steps = buildCalculationSteps({
            period,
            startDate: start,
            endDate: end,
            currency,
            exchangeRate,
            periodicPrice,
            resultValue: valueInUserCurrency
        });
        setCalculationSteps(steps);
    };

    useEffect(() => {
        // 如果到期日期无效，就清空结果，避免继续计算
        if (!expiryDate || isNaN(new Date(expiryDate).getTime())) {
            setRemainingValue('0.000');
            setRemainingValueCNY('0.000');
            setPriceDifference('0.000');
            setCalculationSteps('到期日期无效，无法计算');
            return;
        }
        calculateRemainingValue();
    }, [
        exchangeRate,
        periodicPrice,
        period,
        transactionDate,
        expiryDate,
        transactionPrice
    ]);

    return (
        <div className="app">
            <h1>VPS 剩余价值计算器</h1>
            <ExchangeRateSelector
                currency={currency}
                setCurrency={setCurrency}
                setExchangeRate={setExchangeRate}
                setExchangeRateCNY={setExchangeRateCNY}
            />

            <div className="input-group">
                <label>周期金额：</label>
                <input
                    type="number"
                    value={periodicPrice}
                    onChange={(e) => setPeriodicPrice(parseFloat(e.target.value) || 0)}
                />
            </div>

            <div className="input-group">
                <label>交易金额：</label>
                <input
                    type="number"
                    value={transactionPrice}
                    onChange={(e) => setTransactionPrice(parseFloat(e.target.value) || 0)}
                />
            </div>

            <PeriodSelector period={period} setPeriod={setPeriod} />

            <DatePicker
                label="交易日期"
                date={transactionDate}
                setDate={setTransactionDate}
                defaultDate={new Date()}
            />
            <DatePicker
                label="到期日期"
                date={expiryDate}
                setDate={setExpiryDate}
            />

            <ResultDisplay
                remainingValue={remainingValue}
                remainingValueCNY={remainingValueCNY}
                currency={currency}
                calculationSteps={calculationSteps}
                priceDifference={priceDifference}
            />
        </div>
    );
};

export default App;