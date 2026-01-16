import { create } from 'zustand';

interface UIStore {
    // Modal states
    isReportModalOpen: boolean;
    reportTargetUserId: string | null;
    reportTargetMessageId: string | null;

    isBlockModalOpen: boolean;
    blockTargetUserId: string | null;

    isNewChatModalOpen: boolean;
    isSettingsOpen: boolean;

    // Toast notifications
    toasts: Toast[];

    // Loading states
    globalLoading: boolean;

    // Actions
    openReportModal: (userId: string, messageId?: string) => void;
    closeReportModal: () => void;

    openBlockModal: (userId: string) => void;
    closeBlockModal: () => void;

    setNewChatModalOpen: (open: boolean) => void;
    setSettingsOpen: (open: boolean) => void;

    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;

    setGlobalLoading: (loading: boolean) => void;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export const useUIStore = create<UIStore>((set) => ({
    // Initial state
    isReportModalOpen: false,
    reportTargetUserId: null,
    reportTargetMessageId: null,

    isBlockModalOpen: false,
    blockTargetUserId: null,

    isNewChatModalOpen: false,
    isSettingsOpen: false,

    toasts: [],
    globalLoading: false,

    // Actions
    openReportModal: (userId, messageId) =>
        set({
            isReportModalOpen: true,
            reportTargetUserId: userId,
            reportTargetMessageId: messageId ?? null,
        }),

    closeReportModal: () =>
        set({
            isReportModalOpen: false,
            reportTargetUserId: null,
            reportTargetMessageId: null,
        }),

    openBlockModal: (userId) =>
        set({
            isBlockModalOpen: true,
            blockTargetUserId: userId,
        }),

    closeBlockModal: () =>
        set({
            isBlockModalOpen: false,
            blockTargetUserId: null,
        }),

    setNewChatModalOpen: (open) => set({ isNewChatModalOpen: open }),
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),

    addToast: (toast) =>
        set((state) => ({
            toasts: [
                ...state.toasts,
                { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
            ],
        })),

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
