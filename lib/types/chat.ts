export interface Conversation {
  id: string
  user_id: string
  admin_id?: string
  title: string
  description?: string
  status: 'active' | 'waiting' | 'closed' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category_id?: string
  tags?: string[]
  created_at: string
  updated_at: string
  last_message_at: string
  closed_at?: string
  closed_by?: string
  closed_reason?: string
  // Campos calculados
  unread_count?: number
  total_messages?: number
  last_message?: Message
  participants?: ConversationParticipant[]
  user_full_name?: string
  user_email?: string
  user_avatar_url?: string
  admin_full_name?: string
  admin_email?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification'
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  is_read: boolean
  is_edited?: boolean
  edited_at?: string
  reply_to_id?: string
  metadata?: Record<string, unknown>
  created_at: string
  // Campos calculados
  sender?: UserProfile
  sender_avatar_url?: string
  is_own_message?: boolean
  reply_to_content?: string
  reply_to_sender_name?: string
}

export interface ConversationParticipant {
  conversation_id: string
  user_id: string
  role: 'user' | 'admin' | 'moderator' | 'support'
  joined_at: string
  left_at?: string
  last_read_at: string
  is_online: boolean
  is_typing?: boolean
  typing_since?: string
  notification_preferences?: NotificationPreferences
  // Campos calculados
  user?: UserProfile
  unread_count?: number
}

export interface ChatNotification {
  id: string
  user_id: string
  conversation_id: string
  message_id: string
  type: 'message' | 'mention' | 'system' | 'assignment' | 'status_change'
  title?: string
  content?: string
  is_read: boolean
  read_at?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  created_at: string
  // Campos calculados
  conversation?: Conversation
  message?: Message
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
  is_online?: boolean
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

export interface ChatAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  mime_type?: string
  thumbnail_url?: string
  created_at: string
}

export interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  participants: ConversationParticipant[]
  isLoading: boolean
  error: string | null
  unreadCount: number
  typingUsers: TypingIndicator[]
}

export interface CreateConversationRequest {
  title: string
  description?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category_id?: string
  tags?: string[]
  initial_message?: string
}

export interface SendMessageRequest {
  conversation_id: string
  content: string
  message_type?: 'text' | 'image' | 'file' | 'system' | 'notification'
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  reply_to_id?: string
  metadata?: Record<string, unknown>
}

export interface UpdateConversationRequest {
  title?: string
  description?: string
  status?: 'active' | 'waiting' | 'closed' | 'archived'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category_id?: string
  tags?: string[]
  admin_id?: string
  closed_reason?: string
}

export interface ChatFilters {
  status?: 'active' | 'waiting' | 'closed' | 'archived'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category_id?: string
  search?: string
  date_from?: string
  date_to?: string
  assigned_to?: string
  tags?: string[]
}

export interface ChatStats {
  total_conversations: number
  active_conversations: number
  waiting_conversations: number
  closed_conversations: number
  total_messages: number
  avg_response_time: number
  conversations_by_priority: Record<string, number>
  conversations_by_category: Record<string, number>
  conversations_by_status: Record<string, number>
}

export interface TypingIndicator {
  conversation_id: string
  user_id: string
  user_name: string
  is_typing: boolean
  timestamp: number
}

export interface ChatSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'es' | 'en' | 'de' | 'fr'
  notifications_enabled: boolean
  sound_enabled: boolean
  auto_reply_enabled: boolean
  auto_reply_message?: string
  working_hours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  offline_message?: string
}

export interface ChatMetrics {
  response_time: number
  satisfaction_score?: number
  resolution_time?: number
  messages_count: number
  participants_count: number
}

export interface ChatSearchResult {
  conversations: Conversation[]
  messages: Message[]
  total_results: number
  search_query: string
  search_filters: ChatFilters
}
