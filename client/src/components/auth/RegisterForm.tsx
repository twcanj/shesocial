// Placeholder RegisterForm component
import React from 'react'

export const RegisterForm: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">註冊</h2>
      <input 
        type="text" 
        placeholder="姓名"
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
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
        註冊
      </button>
    </div>
  )
}