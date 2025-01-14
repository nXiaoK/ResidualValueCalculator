import React, { useEffect, useState } from 'react';

const ExchangeRateSelector = ({ currency, setCurrency, setExchangeRate, setExchangeRateCNY }) => {
    const [currencies, setCurrencies] = useState([]);

    // 定义常用货币
    const commonCurrencies = ['USD', 'EUR', 'CNY', 'GBP', 'JPY', 'AUD', 'CAD', 'HKD'];

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await fetch('https://v6.exchangerate-api.com/v6/请填写自己申请的token值/CNY'); // 替换为你的汇率 API
                const data = await response.json();

                // 缓存数据到 localStorage，添加时间戳
                localStorage.setItem('exchangeRates', JSON.stringify({
                    rates: data.conversion_rates,
                    timestamp: Date.now()
                }));

                // 过滤汇率，只保留常用货币
                const filteredRates = commonCurrencies.reduce((acc, currency) => {
                    if (data.conversion_rates[currency]) {
                        acc[currency] = data.conversion_rates[currency];
                    }
                    return acc;
                }, {});

                setCurrencies(Object.keys(filteredRates)); // 只显示常用货币
                setExchangeRate(filteredRates[currency] || 1);
                setExchangeRateCNY(filteredRates['CNY'] || 1);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };

        const checkAndLoadRates = () => {
            const cachedData = localStorage.getItem('exchangeRates');
            const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数

            if (cachedData) {
                const { rates, timestamp } = JSON.parse(cachedData);
                const now = Date.now();

                // 如果缓存未过期，直接使用缓存数据
                if (now - timestamp < oneDay) {
                    const filteredRates = commonCurrencies.reduce((acc, currency) => {
                        if (rates[currency]) {
                            acc[currency] = rates[currency];
                        }
                        return acc;
                    }, {});

                    setCurrencies(Object.keys(filteredRates)); // 只显示常用货币
                    setExchangeRate(filteredRates[currency] || 1);
                    setExchangeRateCNY(filteredRates['CNY'] || 1);
                    return;
                }
            }

            // 如果缓存过期或不存在，则重新请求数据
            fetchExchangeRates();
        };

        checkAndLoadRates();
    }, [currency, setExchangeRate, setExchangeRateCNY]);

    return (
        <div className="input-group">
            <label>选择货币：</label>
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
            >
                {currencies.map((cur) => (
                    <option key={cur} value={cur}>
                        {cur}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ExchangeRateSelector;