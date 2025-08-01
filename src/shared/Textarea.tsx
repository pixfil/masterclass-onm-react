import React, { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', children, ...args }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`block w-full rounded-2xl border-neutral-200 bg-white focus:border-blue-300 focus:ring-3 focus:ring-blue-200/50 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-blue-600/25 ${className}`}
      rows={4}
      {...args}
    >
      {children}
    </textarea>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
