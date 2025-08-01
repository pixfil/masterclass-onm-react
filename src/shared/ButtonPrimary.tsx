import React from 'react'
import { Button, ButtonProps } from './Button'

const ButtonPrimary: React.FC<ButtonProps> = ({ color, outline, plain, children, ...props }) => {
  return (
    <Button color={color || "blue"} {...props}>
      {children}
    </Button>
  )
}

export default ButtonPrimary
