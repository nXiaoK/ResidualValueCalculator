import React, { useState, useEffect } from 'react';
import ExchangeRateSelector from './components/ExchangeRateSelector';
import PeriodSelector from './components/PeriodSelector';
import DatePicker from './components/DatePicker';
import ResultDisplay from './components/ResultDisplay';
import './style.css';

const App = () => {
    const [currency, setCurrency] = useState('CNY');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [exchangeRateCNY, setExchangeRateCNY] = useState(1);
    const [monthlyPrice, setMonthlyPrice] = useState(10);
    const [period, setPeriod] = useState('1'); // 默认为月付，对应 1 个月
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [remainingValue, setRemainingValue] = useState(0);
    const [remainingValueCNY, setRemainingValueCNY] = useState(0);
    const [calculationSteps, setCalculationSteps] = useState('');
    const [transactionPrice, setTransactionPrice] = useState(0); // 新增交易金额
    const [priceDifference, setPriceDifference] = useState(0); // 溢价或折价金额

    const calculateRemainingValue = () => {
        // 动态计算剩余天数（确保是整数）
        const remainingDays = Math.ceil((new Date(expiryDate) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));

        // 动态计算付款周期的总天数
        let totalDays;
        switch (parseInt(period, 10)) {
            case 1: // 月付
                totalDays = Math.ceil((new Date(transactionDate).setMonth(transactionDate.getMonth() + 1) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 3: // 季付
                totalDays = Math.ceil((new Date(transactionDate).setMonth(transactionDate.getMonth() + 3) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 6: // 半年付
                totalDays = Math.ceil((new Date(transactionDate).setMonth(transactionDate.getMonth() + 6) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 12: // 年付
                totalDays = Math.ceil((new Date(transactionDate).setFullYear(transactionDate.getFullYear() + 1) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 24: // 两年付
                totalDays = Math.ceil((new Date(transactionDate).setFullYear(transactionDate.getFullYear() + 2) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 36: // 三年付
                totalDays = Math.ceil((new Date(transactionDate).setFullYear(transactionDate.getFullYear() + 3) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 48: // 四年付
                totalDays = Math.ceil((new Date(transactionDate).setFullYear(transactionDate.getFullYear() + 4) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            case 60: // 五年付
                totalDays = Math.ceil((new Date(transactionDate).setFullYear(transactionDate.getFullYear() + 5) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
                break;
            default:
                totalDays = Math.ceil((new Date(transactionDate).setMonth(transactionDate.getMonth() + 1) - new Date(transactionDate)) / (1000 * 60 * 60 * 24));
        }


        // 计算每天的价格和剩余价值
        const dailyPrice = monthlyPrice / totalDays; // 每天的价格（以用户选择的货币计算）
        const remainingValue = dailyPrice * remainingDays; // 剩余天数的总价格（以用户选择的货币计算）

        // 转换为 CNY
        let remainingValueCNY = remainingValue / exchangeRate; // 使用目标货币到 CNY 的汇率进行转换

        // 计算溢价或折价
        const priceDifference = transactionPrice - remainingValueCNY;
        setPriceDifference(priceDifference.toFixed(3))

        // 更新结果
        setRemainingValue(remainingValue.toFixed(3)); // 显示用户选择的货币的剩余值
        setRemainingValueCNY(remainingValueCNY.toFixed(3)); // 显示转换为 CNY 的值


        // 生成计算步骤
        const steps = `
1. 付款周期对应的天数为：${totalDays} 天。
2. 每天的价格为：${monthlyPrice} / ${totalDays} ≈ ${dailyPrice.toFixed(3)} ${currency}/天。
3. 剩余天数为：${remainingDays} 天。
4. 剩余价值为：${dailyPrice.toFixed(3)} × ${remainingDays} ≈ ${remainingValue.toFixed(3)} ${currency}。
${currency !== 'CNY' ? `5. 换算为人民币：${remainingValue.toFixed(3)} × ${exchangeRate.toFixed(3)} ≈ ${remainingValueCNY.toFixed(3)} CNY。` : ''}
`;
        setCalculationSteps(steps.trim());
    };

    useEffect(() => {
        calculateRemainingValue();
    }, [exchangeRate, monthlyPrice, period, transactionDate, expiryDate, transactionPrice]); // transactionPrice 已添加
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
                <label>费用金额：</label>
                <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(parseFloat(e.target.value))}
                />
            </div>
            <div className="input-group">
                <label>交易金额：</label>
                <input
                    type="number"
                    value={transactionPrice}
                    onChange={(e) => setTransactionPrice(parseFloat(e.target.value) || 0)} // 确保值有效
                />
            </div>
            <PeriodSelector period={period} setPeriod={setPeriod} />
            <DatePicker
                label="交易日期"
                date={transactionDate}
                setDate={setTransactionDate}
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
                priceDifference={priceDifference} // 传递溢价或折价金额
            />
        </div>
    );
};

export default App;