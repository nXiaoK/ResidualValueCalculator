import React from 'react';

const ResultDisplay = ({ remainingValue, remainingValueCNY, currency, calculationSteps , priceDifference}) => {
    const handleCopyToClipboard = () => {
        const markdownContent = `
### 计算结果

**剩余价值：** ${remainingValue} ${currency} ${currency !== 'CNY' ? `(≈ ${remainingValueCNY} CNY)` : ''}

### 计算步骤
\`\`\`
${calculationSteps
    .split('\n')
    .map(line => line.trim())
    .join('\n')}
\`\`\`
        `;
        navigator.clipboard.writeText(markdownContent)
            .then(() => {
                alert('计算结果已复制到剪贴板！');
            })
            .catch((err) => {
                alert('复制失败，请重试！');
                console.error(err);
            });
    };

    return (
        <div className="result-display">
            <div className="result-header">
                <h2>计算结果</h2>
                <button className="copy-button" onClick={handleCopyToClipboard}>一键复制</button>
            </div>
            <p>
                剩余价值：<strong>{remainingValue}</strong> {currency}{' '}
                {currency !== 'CNY' && (
                    <>
                        （≈ <strong>{remainingValueCNY}</strong> CNY）
                    </>
                )}
            </p>
            <p>
                {priceDifference > 0
                    ? `溢价：${priceDifference} CNY`
                    : priceDifference < 0
                    ? `折价：${Math.abs(priceDifference)} CNY`
                    : '交易价格与剩余价值相等'}
            </p>
            <div className="calculation-steps">
                <h3>计算步骤</h3>
                <pre>{calculationSteps}</pre>
            </div>
        </div>
    );
};

export default ResultDisplay;