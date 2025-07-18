import React, { useState } from 'react';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import type { EventData } from '../../../shared-types';

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: EventData['status'];
  onStatusChange: (newStatus: EventData['status']) => Promise<void>;
}

// Status definitions based on business rules
const eventStatusDefinitions = {
  draft: {
    name: "草稿",
    description: "活動正在籌備中，尚未公開",
    color: "bg-gray-500/20 text-gray-400",
    nextStatuses: ["published", "cancelled"] as const
  },
  published: {
    name: "已發佈",
    description: "活動已公開發佈，開放報名",
    color: "bg-emerald-500/20 text-emerald-400",
    nextStatuses: ["full", "ready", "suspended", "cancelled"] as const
  },
  full: {
    name: "已滿",
    description: "活動報名人數已達上限",
    color: "bg-orange-500/20 text-orange-400",
    nextStatuses: ["ready", "published", "cancelled"] as const
  },
  suspended: {
    name: "已暫停",
    description: "活動暫時停止報名",
    color: "bg-yellow-500/20 text-yellow-400",
    nextStatuses: ["published", "cancelled"] as const
  },
  ready: {
    name: "準備就緒",
    description: "活動籌備完成，等待開始",
    color: "bg-blue-500/20 text-blue-400",
    nextStatuses: ["cancelled"] as const
  },
  cancelled: {
    name: "已取消",
    description: "活動已取消，不會舉行",
    color: "bg-red-500/20 text-red-400",
    nextStatuses: [] as const
  }
};

// Action button definitions
type StatusActionType = {
  [K in EventData['status']]: {
    [N in EventData['status']]?: { label: string; color: string }
  }
};

const statusActions: StatusActionType = {
  draft: {
    published: { label: "上架", color: "bg-emerald-500 hover:bg-emerald-600" },
    cancelled: { label: "取消", color: "bg-red-500 hover:bg-red-600" }
  },
  published: {
    full: { label: "標記已滿", color: "bg-orange-500 hover:bg-orange-600" },
    ready: { label: "準備就緒", color: "bg-blue-500 hover:bg-blue-600" },
    suspended: { label: "暫停", color: "bg-yellow-500 hover:bg-yellow-600" },
    cancelled: { label: "取消", color: "bg-red-500 hover:bg-red-600" }
  },
  full: {
    ready: { label: "準備就緒", color: "bg-blue-500 hover:bg-blue-600" },
    published: { label: "重新開放", color: "bg-emerald-500 hover:bg-emerald-600" },
    cancelled: { label: "取消", color: "bg-red-500 hover:bg-red-600" }
  },
  suspended: {
    published: { label: "重新上架", color: "bg-emerald-500 hover:bg-emerald-600" },
    cancelled: { label: "取消", color: "bg-red-500 hover:bg-red-600" }
  },
  ready: {
    cancelled: { label: "取消", color: "bg-red-500 hover:bg-red-600" }
  },
  cancelled: {}
};

export const EventStatusManager: React.FC<EventStatusManagerProps> = ({
  eventId,
  currentStatus,
  onStatusChange
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<EventData['status'] | null>(null);
  const { apiCall } = useAdminAuth();

  // Get the current status definition
  const statusDef = eventStatusDefinitions[currentStatus] || eventStatusDefinitions.draft;

  // Handle status change
  const handleStatusChange = async (newStatus: EventData['status']) => {
    if (newStatus === 'cancelled') {
      // For cancelled status, show confirmation first
      setConfirmStatus(newStatus);
      return;
    }
    
    try {
      setIsUpdating(true);
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Failed to update event status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (!confirmStatus) return;
    
    try {
      setIsUpdating(true);
      await onStatusChange(confirmStatus);
      setConfirmStatus(null);
    } catch (error) {
      console.error('Failed to update event status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-luxury-platinum/80">狀態:</span>
        <span className={`px-2 py-1 rounded-md text-sm ${statusDef.color}`}>
          {statusDef.name}
        </span>
        <span className="text-xs text-luxury-platinum/60">{statusDef.description}</span>
      </div>

      {/* Status Change Actions */}
      {!isUpdating && !confirmStatus && (
        <div className="flex flex-wrap gap-2">
          {statusDef.nextStatuses.map(nextStatus => {
            const actionKey = currentStatus;
            const nextStatusKey = nextStatus as EventData['status'];
            const action = statusActions[actionKey][nextStatusKey];
            
            if (!action) return null;
            
            return (
              <button
                key={nextStatus}
                onClick={() => handleStatusChange(nextStatusKey)}
                className={`px-3 py-1 rounded-md text-sm text-white ${action.color}`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmStatus && (
        <div className="p-4 border border-red-500/30 rounded-md bg-red-500/10">
          <p className="text-sm text-red-300 mb-3">
            確定要{
              (() => {
                const actionKey = currentStatus;
                const confirmKey = confirmStatus;
                const action = statusActions[actionKey][confirmKey];
                return action ? action.label : '更改狀態';
              })()
            }此活動嗎？此操作無法撤銷。
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleConfirm}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              disabled={isUpdating}
            >
              確認
            </button>
            <button
              onClick={() => setConfirmStatus(null)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
              disabled={isUpdating}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUpdating && (
        <div className="flex items-center space-x-2 text-luxury-platinum/60">
          <div className="animate-spin h-4 w-4 border-2 border-luxury-gold border-t-transparent rounded-full"></div>
          <span className="text-sm">更新中...</span>
        </div>
      )}
    </div>
  );
};

// Status Badge component for displaying event status in lists
export const EventStatusBadge: React.FC<{ status: EventData['status'] }> = ({ status }) => {
  const statusDef = eventStatusDefinitions[status] || eventStatusDefinitions.draft;
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs ${statusDef.color}`}>
      {statusDef.name}
    </span>
  );
};
