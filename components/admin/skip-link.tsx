"use client"

import React from 'react'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        skip-link
        absolute -top-10 left-6 z-50
        bg-gray-900 dark:bg-white text-white dark:text-gray-900
        px-4 py-2 rounded-md
        font-medium text-sm
        transition-all duration-200 ease-in-out
        focus:top-6 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className || ''}
      `}
      onClick={(e) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target && target instanceof HTMLElement) {
          target.focus()
          target.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      {children}
    </a>
  )
}

export function AdminSkipLinks() {
  return (
    <>
      <SkipLink href="#main-content">
        Saltar al contenido principal
      </SkipLink>
      <SkipLink href="#navigation">
        Saltar a la navegación
      </SkipLink>
      <SkipLink href="#search">
        Saltar a la búsqueda
      </SkipLink>
    </>
  )
}
