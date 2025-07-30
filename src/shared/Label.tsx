import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string
}

export const Label: React.FC<LabelProps> = ({ 
  className = '', 
  children,
  ...props 
}) => {
  return (
    <label 
      className={`
        block text-sm font-medium text-neutral-700 dark:text-neutral-300
        ${className}
      `}
      {...props}
    >
      {children}
    </label>
  )
}

export default Label