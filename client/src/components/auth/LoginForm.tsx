// Placeholder LoginForm component
import React from 'react'

export const LoginForm: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">登入</h2>
      <input 
        type="email" 
        placeholder="電子郵件"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      <input 
        type="password" 
        placeholder="密碼"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      <button className="btn-luxury w-full">
        登入
      </button>
    </div>
  )
}