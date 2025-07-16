// Participant Management Component (Premium 2500 only)
import React, { useState, useEffect, useCallback } from 'react'
import type { EventData } from '../../shared-types'
import { useAuthStore } from '../../store/authStore'
import { useEvents } from '../../hooks/useEvents'

interface ParticipantManagementProps {
  event: EventData
  onUpdate: (updatedEvent: EventData) => void
}

interface ParticipantDetail {
  userId: string
  name?: string
  email?: string
  age?: number
  membership?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  paid: boolean
  voucherUsed?: {
    type: '100' | '200'
    amount: number
  }
  joinedAt: Date
  phone?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export const ParticipantManagement: React.FC<ParticipantManagementProps> = ({
  event,
  onUpdate
}) => {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantDetail | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { hasPermission } = useAuthStore()
  const { getEventParticipants, updateEvent } = useEvents()

  // Check if user has permission to manage participants
  const canManageParticipants = hasPermission('viewParticipants')

  const loadParticipants = useCallback(async () => {
    setLoading(true)
    try {
      const participantData = await getEventParticipants(event._id!)
      setParticipants(participantData)
    } catch (error) {
      console.error('Failed to load participants:', error)
    } finally {
      setLoading(false)
    }
  }, [event._id, getEventParticipants])

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const updateParticipantStatus = async (
    participantId: string, 
    newStatus: ParticipantDetail['status']
  ) => {
    setActionLoading(participantId)
    try {
      const updatedParticipants = event.participants?.map(p => 
        p.userId === participantId ? { ...p, status: newStatus } : p
      ) || []

      const success = await updateEvent(event._id!, { 
        participants: updatedParticipants 
      })

      if (success) {
        await loadParticipants()
        // Update parent component
        onUpdate({ ...event, participants: updatedParticipants })
      }
    } catch (error) {
      console.error('Failed to update participant status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const updatePaymentStatus = async (participantId: string, paid: boolean) => {
    setActionLoading(participantId)
    try {
      const updatedParticipants = event.participants?.map(p => 
        p.userId === participantId ? { ...p, paid } : p
      ) || []

      const success = await updateEvent(event._id!, { 
        participants: updatedParticipants 
      })

      if (success) {
        await loadParticipants()
        onUpdate({ ...event, participants: updatedParticipants })
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const removeParticipant = async (participantId: string) => {
    const confirmed = window.confirm('確定要移除此參與者嗎？')
    if (!confirmed) return

    setActionLoading(participantId)
    try {
      const updatedParticipants = event.participants?.filter(p => 
        p.userId !== participantId
      ) || []

      const success = await updateEvent(event._id!, { 
        participants: updatedParticipants 
      })

      if (success) {
        await loadParticipants()
        onUpdate({ ...event, participants: updatedParticipants })
      }
    } catch (error) {
      console.error('Failed to remove participant:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: ParticipantDetail['status']) => {
    const statusConfig = {
      pending: { label: '待確認', className: 'bg-yellow-100 text-yellow-700' },
      confirmed: { label: '已確認', className: 'bg-green-100 text-green-700' },
      cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
      waitlist: { label: '候補', className: 'bg-gray-100 text-gray-700' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getMembershipBadge = (membership?: string) => {
    if (!membership) return null

    const membershipConfig = {
      regular: { label: '一般', className: 'bg-gray-100 text-gray-700' },
      vip: { label: 'VIP', className: 'bg-blue-100 text-blue-700' },
      premium_1300: { label: 'Premium', className: 'bg-purple-100 text-purple-700' },
      premium_2500: { label: 'Premium+', className: 'bg-yellow-100 text-yellow-700' }
    }

    const config = membershipConfig[membership as keyof typeof membershipConfig]
    if (!config) return null

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (!canManageParticipants) {
    return (
      <div className="card-luxury p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">權限不足</h3>
        <p className="text-gray-600">
          您需要Premium $2500會員資格才能查看參與者詳細資訊
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card-luxury p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Participants Summary */}
      <div className="card-luxury p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">參與者管理</h3>
          <div className="text-sm text-gray-600">
            {participants.length} / {event.maxParticipants} 人
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.status === 'confirmed').length}
            </div>
            <div className="text-xs text-gray-600">已確認</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {participants.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-600">待確認</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {participants.filter(p => p.paid).length}
            </div>
            <div className="text-xs text-gray-600">已付款</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {participants.filter(p => p.voucherUsed).length}
            </div>
            <div className="text-xs text-gray-600">使用票券</div>
          </div>
        </div>

        {/* Participants List */}
        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            目前沒有參與者
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-white font-medium">
                    {participant.name?.charAt(0) || 'U'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">
                        {participant.name || `用戶 ${participant.userId.slice(-6)}`}
                      </span>
                      {getMembershipBadge(participant.membership)}
                      {getStatusBadge(participant.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>報名: {new Date(participant.joinedAt).toLocaleDateString('zh-TW')}</span>
                      {participant.age && <span>年齡: {participant.age}</span>}
                      {participant.paid ? (
                        <span className="text-green-600">✓ 已付款</span>
                      ) : (
                        <span className="text-red-600">✗ 未付款</span>
                      )}
                      {participant.voucherUsed && (
                        <span className="text-purple-600">
                          使用${participant.voucherUsed.type}券
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedParticipant(participant)
                      setShowDetailModal(true)
                    }}
                    className="btn-luxury-outline text-xs px-3 py-1"
                  >
                    詳情
                  </button>

                  {/* Status Actions */}
                  {participant.status === 'pending' && (
                    <button
                      onClick={() => updateParticipantStatus(participant.userId, 'confirmed')}
                      disabled={actionLoading === participant.userId}
                      className="btn-luxury text-xs px-3 py-1"
                    >
                      確認
                    </button>
                  )}

                  {participant.status === 'confirmed' && !participant.paid && (
                    <button
                      onClick={() => updatePaymentStatus(participant.userId, true)}
                      disabled={actionLoading === participant.userId}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      標記付款
                    </button>
                  )}

                  <button
                    onClick={() => removeParticipant(participant.userId)}
                    disabled={actionLoading === participant.userId}
                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participant Detail Modal */}
      {showDetailModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">參與者詳情</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                    {selectedParticipant.name?.charAt(0) || 'U'}
                  </div>
                  <h4 className="font-medium">
                    {selectedParticipant.name || `用戶 ${selectedParticipant.userId.slice(-6)}`}
                  </h4>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {getMembershipBadge(selectedParticipant.membership)}
                    {getStatusBadge(selectedParticipant.status)}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedParticipant.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedParticipant.email}</span>
                    </div>
                  )}
                  
                  {selectedParticipant.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">年齡:</span>
                      <span>{selectedParticipant.age}歲</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">報名時間:</span>
                    <span>{new Date(selectedParticipant.joinedAt).toLocaleString('zh-TW')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">付款狀態:</span>
                    <span className={selectedParticipant.paid ? 'text-green-600' : 'text-red-600'}>
                      {selectedParticipant.paid ? '已付款' : '未付款'}
                    </span>
                  </div>

                  {selectedParticipant.voucherUsed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">票券使用:</span>
                      <span className="text-purple-600">
                        ${selectedParticipant.voucherUsed.type}券 (-NT${selectedParticipant.voucherUsed.amount})
                      </span>
                    </div>
                  )}

                  {selectedParticipant.emergencyContact && (
                    <div className="border-t pt-3">
                      <div className="text-gray-600 text-xs mb-2">緊急聯絡人</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">姓名:</span>
                          <span>{selectedParticipant.emergencyContact.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">電話:</span>
                          <span>{selectedParticipant.emergencyContact.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">關係:</span>
                          <span>{selectedParticipant.emergencyContact.relationship}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  {selectedParticipant.status === 'pending' && (
                    <button
                      onClick={() => {
                        updateParticipantStatus(selectedParticipant.userId, 'confirmed')
                        setShowDetailModal(false)
                      }}
                      className="flex-1 btn-luxury text-sm"
                    >
                      確認參與
                    </button>
                  )}
                  
                  {!selectedParticipant.paid && (
                    <button
                      onClick={() => {
                        updatePaymentStatus(selectedParticipant.userId, true)
                        setShowDetailModal(false)
                      }}
                      className="flex-1 text-sm px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      標記付款
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}