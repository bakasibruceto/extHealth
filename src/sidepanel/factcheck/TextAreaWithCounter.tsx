import './css/TextAreaWithCounter.css'; // Import CSS file

import React, { useEffect, useState, ChangeEvent, FocusEvent, KeyboardEvent, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
interface TextAreaWithCounterProps {
  value: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const TextAreaWithCounter: React.FC<TextAreaWithCounterProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onInput,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 80;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  };

  const textareaClassName = `textarea ${className || ''} ${value.length > maxLength ? 'textarea-exceed' : ''}`.trim();
  return (
    <div className="textarea-container">
      <TextareaAutosize 
        maxRows={3}
        minRows={1}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className={textareaClassName}
        placeholder='Enter a health claim here...'
      />
      {isFocused && (
        <div 
        style={{ color: value.length > maxLength ? 'red' : '' }}
        className="counter">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default TextAreaWithCounter;
