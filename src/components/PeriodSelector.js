import React from 'react';

const PeriodSelector = ({ period, setPeriod }) => {
  return (
    <div className="input-group">
      <label>选择付款周期：</label>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="1">月付</option>
        <option value="3">季付</option>
        <option value="6">半年付</option>
        <option value="12">年付</option>
        <option value="24">两年付</option>
        <option value="36">三年付</option>
        <option value="48">四年付</option>
        <option value="60">五年付</option>
      </select>
    </div>
  );
};

export default PeriodSelector;