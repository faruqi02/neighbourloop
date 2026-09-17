import { create } from 'zustand';
import { ChatConversation, ChatMessage } from '../types';
import { mockConversations } from '../services/mockData';

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  getOrCreateConversation: (
    participant: { id: string; name: string; avatarUrl?: string; phone?: string },
    itemContext?: { title: string; price?: number; category?: string }
  ) => string;
  sendMessage: (conversationId: string, text: string, senderId: string, senderName: string) => void;
  markAsRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: mockConversations,
  activeConversationId: null,

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().markAsRead(id);
    }
  },

  getOrCreateConversation: (participant, itemContext) => {
    const state = get();
    // Check if conversation with this participant already exists
    const existing = state.conversations.find((c) => c.participantId === participant.id);
    if (existing) {
      // Update item context if specified
      if (itemContext && !existing.itemContextTitle) {
        set({
          conversations: state.conversations.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  itemContextTitle: itemContext.title,
                  itemContextPrice: itemContext.price,
                  itemContextCategory: itemContext.category,
                }
              : c
          ),
        });
      }
      return existing.id;
    }

    // Create new conversation
    const newId = `conv_${Date.now()}`;
    const newConversation: ChatConversation = {
      id: newId,
      participantId: participant.id,
      participantName: participant.name,
      participantAvatar: participant.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      participantPhone: participant.phone || '',
      itemContextTitle: itemContext?.title,
      itemContextPrice: itemContext?.price,
      itemContextCategory: itemContext?.category,
      lastMessage: 'Perbualan dimulakan',
      lastMessageTime: 'Baru sahaja',
      unreadCount: 0,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          conversationId: newId,
          senderId: participant.id,
          senderName: participant.name,
          text: `Hai! Terima kasih kerana menghubungi saya mengenai ${itemContext?.title || 'perkara ini'}. Ada apa yang boleh saya bantu?`,
          timestamp: 'Baru sahaja',
          isMe: false,
        },
      ],
    };

    set({ conversations: [newConversation, ...state.conversations] });
    return newId;
  },

  sendMessage: (conversationId, text, senderId, senderName) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim(),
            lastMessageTime: 'Baru sahaja',
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      }),
    }));
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    }));
  },
}));

