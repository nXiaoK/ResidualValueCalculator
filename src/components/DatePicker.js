import React from 'react';

const DatePicker = ({ label, date, setDate }) => {
  return (
    <div className="input-group">
      <label>{label}：</label>
      <input
        type="date"
        value={date.toISOString().split('T')[0]}
        onChange={(e) => setDate(new Date(e.target.value))}
      />
    </div>
  );
};

export default DatePicker;