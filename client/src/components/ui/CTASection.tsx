// Reusable Call-to-Action Section Component
import React from 'react'
import type { ReactNode } from 'react'

interface CTAAction {
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary'
}

interface CTASectionProps {
  title: string
  description: string
  actions: CTAAction[]
  icon?: ReactNode
  className?: string
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  actions,
  icon,
  className = ''
}) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="card-luxury p-8 max-w-2xl mx-auto bg-gradient-to-r from-luxury-champagne to-luxury-pearl">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="space-x-4">
          {actions.map((action, index) => (
            <button 
              key={index}
              onClick={action.onClick}
              className={action.variant === 'primary' ? 'btn-luxury' : 'btn-luxury-outline'}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}