import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

const PasswordInput = ({ 
  name, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  required = false,
  className = "",
  style = {},
  minLength,
  id,
  ...rest 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isRoundedPill = className.includes('rounded-pill');

  return (
    <InputGroup>
      <Form.Control
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={className}
        style={style}
        minLength={minLength}
        id={id}
        {...rest}
      />
      <Button
        variant="outline-secondary"
        onClick={togglePasswordVisibility}
        style={{
          border: '1px solid #ced4da',
          borderLeft: 'none',
          backgroundColor: 'transparent',
          borderRadius: isRoundedPill ? '0 25px 25px 0' : '0 0.375rem 0.375rem 0',
          padding: '0.375rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label={showPassword ? "Hide password" : "Show password"}
        type="button"
      >
        <span style={{ fontSize: '1rem' }}>
          {showPassword ? <EyeSlash /> : <Eye />}
        </span>
      </Button>
    </InputGroup>
  );
};

export default PasswordInput;
