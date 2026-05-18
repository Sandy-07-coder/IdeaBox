import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useUserStore } from '../../store';
import '../../design/messages.css';

export default function Messages() {
  const { itemId: conversationIdFromUrl } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  const {
    conversations, activeConversation, messages,
    loadingConversations, loadingMessages,
    fetchConversations, fetchMessages, sendMessage,
    markAsRead, setActiveConversation,
    subscribeToMessages, subscribeToTyping, broadcastTyping,
    fetchPresence, onlineUsers, cleanup,
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typingStatus, setTypingStatus] = useState({});
  const [isMobileShowChat, setIsMobileShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingChannelRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchConversations(currentUser.id);
    }
    return () => cleanup();
  }, [currentUser?.id]);

  // Auto-select conversation from URL
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationIdFromUrl);
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [conversationIdFromUrl, conversations]);

  // Fetch presence for conversation participants
  useEffect(() => {
    if (conversations.length > 0) {
      const userIds = conversations.map(c => c.otherId).filter(Boolean);
      fetchPresence(userIds);
    }
  }, [conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    setIsMobileShowChat(true);
    fetchMessages(conv.id);
    markAsRead(conv.id, currentUser?.id);
    subscribeToMessages(conv.id, currentUser?.id);

    // Subscribe to typing
    if (typingChannelRef.current) {
      typingChannelRef.current.unsubscribe();
    }
    const typeCh = subscribeToTyping(conv.id, ({ userId, isTyping }) => {
      if (userId !== currentUser?.id) {
        setTypingStatus(prev => ({ ...prev, [userId]: isTyping }));
        if (isTyping) {
          setTimeout(() => setTypingStatus(prev => ({ ...prev, [userId]: false })), 3000);
        }
      }
    });
    typingChannelRef.current = typeCh;

    // Update URL
    const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '/dashboard';
    navigate(`${basePath}/messages/${conv.id}`, { replace: true });
  }, [currentUser?.id, navigate]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !activeConversation) return;
    setMessageText('');

    await sendMessage(activeConversation.id, currentUser.id, text);
    broadcastTyping(activeConversation.id, currentUser.id, false);

    // Refresh conversations to update last_message
    fetchConversations(currentUser.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Broadcast typing
    if (activeConversation) {
      broadcastTyping(activeConversation.id, currentUser.id, true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(activeConversation.id, currentUser.id, false);
      }, 2000);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDateDivider = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const shouldShowDateDivider = (msg, idx) => {
    if (idx === 0) return true;
    const prev = new Date(messages[idx - 1].created_at).toDateString();
    const curr = new Date(msg.created_at).toDateString();
    return prev !== curr;
  };

  const getOtherUserStatus = () => {
    if (!activeConversation) return 'offline';
    const otherId = activeConversation.otherId;
    if (typingStatus[otherId]) return 'typing';
    if (onlineUsers[otherId]?.is_online) return 'online';
    return 'offline';
  };

  const getLastSeenText = () => {
    if (!activeConversation) return '';
    const otherId = activeConversation.otherId;
    const presence = onlineUsers[otherId];
    if (!presence) return 'Offline';
    if (presence.is_online) return 'Online';
    return `Last seen ${formatRelativeTime(presence.last_seen)} ago`;
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    return c.otherProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleBackToList = () => {
    setIsMobileShowChat(false);
    setActiveConversation(null);
    const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '/dashboard';
    navigate(`${basePath}/messages`, { replace: true });
  };

  return (
    <section>
      <div className="fd-section-header">
        <h2 className="fd-section-title">Messages</h2>
      </div>

      <div className="chat-container" style={{ position: 'relative' }}>
        {/* Conversation List Sidebar */}
        <div className={`chat-sidebar ${isMobileShowChat ? 'hidden' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Chats</h3>
          </div>

          <div className="chat-search">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chat-list">
            {loadingConversations ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#d1d5db' }}>chat_bubble</span>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {searchQuery ? 'No results found' : 'No conversations yet'}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#d1d5db' }}>
                  Start a chat from someone's profile or project
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = activeConversation?.id === conv.id;
                const isOnline = onlineUsers[conv.otherId]?.is_online;
                const unread = conv.lastMessage && !conv.lastMessage.is_read && conv.lastMessage.sender_id !== currentUser?.id;

                return (
                  <div
                    key={conv.id}
                    className={`chat-list-item ${isActive ? 'active' : ''}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="avatar">
                      {conv.otherProfile?.avatar_url ? (
                        <img src={conv.otherProfile.avatar_url} alt="" />
                      ) : (
                        (conv.otherProfile?.full_name || 'U').charAt(0).toUpperCase()
                      )}
                      {isOnline && <span className="online-dot" />}
                    </div>
                    <div className="info">
                      <div className="name" style={{ fontWeight: unread ? '700' : '600' }}>
                        {conv.otherProfile?.full_name || 'Unknown User'}
                      </div>
                      <div className="last-msg" style={{ fontWeight: unread ? '600' : '400', color: unread ? '#111827' : '#6b7280' }}>
                        {conv.lastMessage
                          ? (conv.lastMessage.sender_id === currentUser?.id ? 'You: ' : '') + conv.lastMessage.content
                          : 'No messages yet'}
                      </div>
                    </div>
                    <div className="meta">
                      <span className="time">
                        {conv.lastMessage ? formatRelativeTime(conv.lastMessage.created_at) : ''}
                      </span>
                      {unread && <span className="unread-badge">1</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="chat-main">
            {/* Chat Header */}
            <div className="chat-header">
              <button className="back-btn" onClick={handleBackToList}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="avatar">
                {activeConversation.otherProfile?.avatar_url ? (
                  <img src={activeConversation.otherProfile.avatar_url} alt="" />
                ) : (
                  (activeConversation.otherProfile?.full_name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="header-info">
                <div className="name">{activeConversation.otherProfile?.full_name || 'Unknown'}</div>
                <div className={`status ${getOtherUserStatus()}`}>
                  {getOtherUserStatus() === 'typing' && (
                    <>
                      <span style={{ display: 'inline-flex', gap: '2px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4F46E5', animation: 'bounce 1.4s infinite', animationDelay: '0s' }} />
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4F46E5', animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }} />
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#4F46E5', animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }} />
                      </span>
                      typing...
                    </>
                  )}
                  {getOtherUserStatus() === 'online' && (
                    <>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                      Online
                    </>
                  )}
                  {getOtherUserStatus() === 'offline' && (
                    <span>{getLastSeenText()}</span>
                  )}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/profile/${activeConversation.otherId}`)}
                  style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                  title="View Profile"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>person</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {loadingMessages ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', margin: 'auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '0.5rem', display: 'block' }}>waving_hand</span>
                  <p style={{ margin: 0, fontWeight: '500' }}>Say hello to start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <React.Fragment key={msg.id}>
                      {shouldShowDateDivider(msg, idx) && (
                        <div className="date-divider">
                          <span>{formatDateDivider(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`message-bubble ${msg.sender_id === currentUser?.id ? 'sent' : 'received'}`}>
                        {msg.content}
                        <div className="msg-time">{formatTime(msg.created_at)}</div>
                      </div>
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="chat-input">
              <textarea
                ref={textareaRef}
                rows="1"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!messageText.trim()}
                title="Send message"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-empty">
            <span className="material-symbols-outlined icon">forum</span>
            <h3>Your Messages</h3>
            <p>Select a conversation to start messaging, or tap the chat icon on someone's profile to begin.</p>
          </div>
        )}
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
}
