import React from 'react';

const DatePicker = ({ label, date, setDate, defaultDate }) => {
  const handleChange = (e) => {
    const value = e.target.value;
    if (value) {
      setDate(new Date(value)); // 正常设置日期
    } else {
      setDate(defaultDate); // 如果为空，则设置为默认日期
    }
  };

  return (
    <div className="input-group">
      <label>{label}：</label>
      <input
        type="date"
        value={date ? date.toISOString().split('T')[0] : ""}
        onChange={handleChange}
      />
    </div>
  );
};

export default DatePicker;