// Reusable Modal Trigger Component - handles modal state
import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Modal } from './Modal'

interface ModalTriggerProps {
  trigger: (onClick: () => void) => ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const ModalTrigger: React.FC<ModalTriggerProps> = ({
  trigger,
  children,
  size = 'md',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      {trigger(openModal)}
      <Modal 
        isOpen={isOpen} 
        onClose={closeModal}
        size={size}
        className={className}
      >
        {children}
      </Modal>
    </>
  )
}