import React, { useState, useEffect } from 'react';

interface AutocompleteProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean; // 是否允许输入自定义值
  id?: string; // 唯一标识符，用于隔离状态
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
  value,
  options,
  onChange,
  onSelect,
  placeholder,
  className,
  allowCustom = true,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // 当外部 value 变化时更新内部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleSelect = (option: string) => {
    setInternalValue(option);
    onChange(option);
    onSelect?.(option);
    setIsOpen(false);
  };

  const handleFocus = () => {
    // 聚焦时直接打开下拉框
    setIsOpen(true);
  };

  const handleBlur = () => {
    // 延迟关闭，允许点击下拉选项
    setTimeout(() => setIsOpen(false), 200);
  };

  // 获取过滤后的选项
  const getFilteredOptions = () => {
    if (!internalValue.trim()) {
      return options;
    }
    return options.filter(opt =>
      opt.toLowerCase().includes(internalValue.toLowerCase())
    );
  };

  const filteredOptions = getFilteredOptions();

  return (
    <div className="relative">
      <input
        type="text"
        className={className}
        value={internalValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={`${id}-${index}`}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
