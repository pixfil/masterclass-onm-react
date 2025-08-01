'use client'

import * as Headless from '@headlessui/react'
import NextLink, { type LinkProps } from 'next/link'
import React, { forwardRef } from 'react'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  // Filter out custom props that shouldn't be passed to DOM elements
  const { sizeClass, loading, ...filteredProps } = props as any

  return (
    <NextLink
      {...filteredProps}
      ref={ref}
    />
  )
})
