import React from 'react';
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('复制成功（旧式）');
    } catch (err) {
        alert('复制失败');
    }
    document.body.removeChild(textArea);
}
const ResultDisplay = ({ remainingValue, remainingValueCNY, currency, calculationSteps, priceDifference }) => {
    const handleCopyToClipboard = () => {
        const markdownContent = `
# 计算结果
**剩余价值：** ${remainingValue} ${currency} ${currency !== 'CNY' ? `(≈ ${remainingValueCNY} CNY)` : ''} \`${priceDifference > 0 ? `溢价：${priceDifference} CNY` : priceDifference < 0 ? `折价：${Math.abs(priceDifference)} CNY` : '交易价格与剩余价值相等'}\`
\`\`\`
${calculationSteps
                .split('\n')
                .map(line => line.trim())
                .join('\n')}
\`\`\`
        `;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            // 现代浏览器支持
            navigator.clipboard.writeText(markdownContent)
                .then(() => alert('复制成功'))
                .catch(err => console.error(err));
        } else {
            // 回退到旧式方案
            fallbackCopyToClipboard(markdownContent);
        }
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