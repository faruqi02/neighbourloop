import { create } from 'zustand';
import { ChatConversation, ChatMessage } from '../types';
import { apiRequest } from '../services/api';
import { useUserStore } from './useUserStore';

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
  setActiveConversationId: (id: string | null) => void;
  fetchConversations: (silent?: boolean) => Promise<void>;
  getOrCreateConversation: (
    participant: { id: string; name: string; avatarUrl?: string; phone?: string },
    itemContext?: {
      id?: string;
      title: string;
      price?: number;
      category?: string;
      imageUrl?: string;
      condition?: string;
    }
  ) => string;
  sendMessage: (conversationId: string, text: string, senderId: string, senderName: string) => Promise<void>;
  markAsRead: (conversationId: string, otherUserId?: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  loading: false,
  error: null,

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().markAsRead(id);
    }
  },

  fetchConversations: async (silent = false) => {
    const currentUser = useUserStore.getState().currentUser;
    if (!currentUser) return;
    
    if (!silent && get().conversations.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const data = await apiRequest<ChatConversation[]>(`/chat/conversations/${currentUser.id}`);
      if (data && Array.isArray(data)) {
        set((state) => {
          // Merge incoming data with local optimistic messages
          const merged = data.map((incomingConv) => {
            const existingConv = state.conversations.find((c) => c.id === incomingConv.id);
            if (!existingConv) return incomingConv;

            // Retain any pending temp messages that aren't yet in incomingConv
            const pendingMessages = existingConv.messages.filter(
              (m) => m.id.startsWith('msg_temp_') && !incomingConv.messages.some((im) => im.text === m.text && im.isMe)
            );

            if (pendingMessages.length > 0) {
              return {
                ...incomingConv,
                messages: [...incomingConv.messages, ...pendingMessages],
                lastMessage: pendingMessages[pendingMessages.length - 1].text,
                lastMessageTime: 'Baru sahaja',
              };
            }
            return incomingConv;
          });

          // Also keep any local-only conversations (e.g. started before first message)
          const incomingIds = new Set(data.map((d) => d.id));
          const localOnly = state.conversations.filter((c) => !incomingIds.has(c.id));

          return { 
            conversations: [...merged, ...localOnly], 
            loading: false 
          };
        });
      } else {
        set({ loading: false });
      }
    } catch (e) {
      if (!silent) set({ error: 'Gagal memuatkan mesej', loading: false });
      else set({ loading: false });
    }
  },

  getOrCreateConversation: (
    participant: { id: string; name: string; avatarUrl?: string; phone?: string },
    itemContext?: {
      id?: string;
      title: string;
      price?: number;
      category?: string;
      imageUrl?: string;
      condition?: string;
    }
  ) => {
    const state = get();
    // Unique key per item: prefer itemContext.id, fallback to itemContext.title, or none
    const itemKey = itemContext?.id || itemContext?.title?.trim() || '';
    const targetId = itemKey ? `conv_${participant.id}_${itemKey}` : `conv_${participant.id}`;

    // 1. Check if conversation with this exact targetId already exists
    let existing = state.conversations.find((c) => c.id === targetId);

    // 2. Also check if a conversation with same participant and matching itemContext exists
    if (!existing && itemKey) {
      existing = state.conversations.find((c) => 
        c.participantId === participant.id && 
        ((c.itemContextId && c.itemContextId === itemKey) || 
         (c.itemContextTitle && c.itemContextTitle.toLowerCase() === itemKey.toLowerCase()))
      );
    }

    if (existing) {
      // Update itemContext details if they were missing or richer now
      if (itemContext && (!existing.itemContextImage || existing.itemContextPrice === undefined)) {
        set((s) => ({
          conversations: s.conversations.map((c) => 
            c.id === existing!.id 
              ? { 
                  ...c, 
                  itemContextId: itemContext.id || c.itemContextId,
                  itemContextTitle: itemContext.title || c.itemContextTitle,
                  itemContextPrice: itemContext.price !== undefined ? itemContext.price : c.itemContextPrice,
                  itemContextCategory: itemContext.category || c.itemContextCategory,
                  itemContextImage: itemContext.imageUrl || c.itemContextImage,
                  itemContextCondition: itemContext.condition || c.itemContextCondition,
                }
              : c
          )
        }));
      }
      return existing.id;
    }

    // Create local dummy new conversation until first message is sent
    const newId = targetId;
    const newConversation: ChatConversation = {
      id: newId,
      participantId: participant.id,
      participantName: participant.name,
      participantAvatar: participant.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      participantPhone: participant.phone || '',
      itemContextId: itemContext?.id,
      itemContextTitle: itemContext?.title,
      itemContextPrice: itemContext?.price,
      itemContextCategory: itemContext?.category,
      itemContextImage: itemContext?.imageUrl,
      itemContextCondition: itemContext?.condition,
      lastMessage: 'Mula perbualan...',
      lastMessageTime: '',
      unreadCount: 0,
      messages: [],
    };

    set({ conversations: [newConversation, ...state.conversations] });
    return newId;
  },

  sendMessage: async (conversationId, text, senderId, senderName) => {
    if (!text.trim()) return;
    
    const state = get();
    const conv = state.conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const participantId = conv.participantId;
    const itemContext = conv.itemContextId || conv.itemContextTitle || '';

    // Optimistic UI update
    const tempId = `msg_temp_${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      conversationId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text.trim(),
            lastMessageTime: 'Baru sahaja',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      }),
    }));

    try {
      await apiRequest('/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1_id: senderId,
          user2_id: participantId,
          sender_id: senderId,
          context_id: itemContext,
          message: text.trim()
        })
      });
      // Refresh silently to get real IDs and timestamps without UI flicker
      await get().fetchConversations(true);
    } catch(e) {
      console.error('Failed to send message', e);
    }
  },

  markAsRead: (conversationId: string, otherUserId?: string) => {
    const currentUser = useUserStore.getState().currentUser;
    const conv = get().conversations.find((c) => c.id === conversationId);
    const targetOtherUserId = otherUserId || conv?.participantId;
    const targetContextId = conv?.itemContextId || conv?.itemContextTitle;

    // Immediately mark locally as read
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0,
            messages: c.messages.map((m) => (!m.isMe ? { ...m, isRead: true } : m)),
          };
        }
        return c;
      }),
    }));

    // Notify backend to mark read in memory and update Google Sheets
    if (currentUser && targetOtherUserId) {
      apiRequest('/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          other_user_id: targetOtherUserId,
          context_id: targetContextId,
        }),
      }).catch((e) => console.log('markAsRead sync error:', e));
    }
  },
}));
