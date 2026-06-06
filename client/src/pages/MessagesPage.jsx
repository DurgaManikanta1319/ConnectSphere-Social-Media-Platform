import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { MessageSquare, Send, Image, Search, X, ArrowLeft, Check, CheckCheck, Loader } from 'lucide-react';

/* ── tiny toast hook (Instagram-style slide-down banner) ───────── */
const useToast = () => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, icon = '✅') => {
    clearTimeout(timerRef.current);
    setToast({ msg, icon, phase: 'in' });
    timerRef.current = setTimeout(() => {
      setToast(t => t ? { ...t, phase: 'out' } : null);
      setTimeout(() => setToast(null), 300);
    }, 2800);
  }, []);

  return { toast, showToast };
};

const MessagesPage = () => {
  const { user, socket, onlineUsers } = useAuth();
  const { toast, showToast } = useToast();

  /* ── state ─────────────────────────────────────────────────── */
  const [conversations,   setConversations]   = useState([]);
  const [activeChatUser,  setActiveChatUser]  = useState(null);
  const [messages,        setMessages]        = useState([]);
  const [isLoadingChats,  setIsLoadingChats]  = useState(true);
  const [isLoadingMsgs,   setIsLoadingMsgs]   = useState(false);

  const [searchQuery,       setSearchQuery]       = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const [typedMessage,  setTypedMessage]  = useState('');
  const [attachedImage, setAttachedImage] = useState('');
  const [isSending,     setIsSending]     = useState(false);

  /* typing states */
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimer = useRef(null);

  /* heart burst state: { id, x, y } */
  const [heartBurst, setHeartBurst] = useState(null);

  /* newly arrived msg id → used to trigger pop-in class */
  const [newMsgId, setNewMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const chatRef        = useRef(null);

  /* ── load conversations ─────────────────────────────────────── */
  useEffect(() => {
    api.getConversations()
      .then(list => setConversations(list))
      .catch(console.error)
      .finally(() => setIsLoadingChats(false));
  }, [messages]);

  /* ── load messages when active chat changes ─────────────────── */
  useEffect(() => {
    if (!activeChatUser) return;
    setIsLoadingMsgs(true);
    api.getMessages(activeChatUser._id)
      .then(logs => setMessages(logs))
      .catch(console.error)
      .finally(() => { setIsLoadingMsgs(false); scrollToBottom(); });
  }, [activeChatUser]);

  /* ── socket listeners ───────────────────────────────────────── */
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      const relevant =
        activeChatUser &&
        (msg.senderId._id === activeChatUser._id || msg.receiverId._id === activeChatUser._id);
      if (!relevant) {
        showToast(`💬 New message from ${msg.senderId.username}`);
        return;
      }
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
      setNewMsgId(msg._id);
      scrollToBottom();
    };

    const onTyping     = (senderId) => { if (activeChatUser?._id === senderId) setIsOtherTyping(true);  };
    const onStopTyping = (senderId) => { if (activeChatUser?._id === senderId) setIsOtherTyping(false); };
    const onSeen       = ({ seenBy, senderId }) => {
      if (activeChatUser && seenBy === activeChatUser._id && senderId === user._id) {
        setMessages(prev => prev.map(m => m.senderId._id === user._id ? { ...m, seenStatus: true } : m));
      }
    };

    socket.on('new_message',    onNewMessage);
    socket.on('typing',         onTyping);
    socket.on('stop_typing',    onStopTyping);
    socket.on('messages_seen',  onSeen);

    return () => {
      socket.off('new_message',   onNewMessage);
      socket.off('typing',        onTyping);
      socket.off('stop_typing',   onStopTyping);
      socket.off('messages_seen', onSeen);
    };
  }, [socket, activeChatUser, user._id, showToast]);

  /* ── user search ────────────────────────────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchSuggestions([]); return; }
    const t = setTimeout(async () => {
      const matches = await api.searchUsers(searchQuery).catch(() => []);
      setSearchSuggestions(matches.filter(m => m._id !== user._id));
    }, 380);
    return () => clearTimeout(t);
  }, [searchQuery, user._id]);

  /* ── helpers ────────────────────────────────────────────────── */
  const scrollToBottom = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);

  const toBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload  = () => res(r.result);
    r.onerror = rej;
  });

  const handleStartChat = (u) => {
    setActiveChatUser(u);
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  /* typing emission */
  const handleMsgChange = (e) => {
    setTypedMessage(e.target.value);
    if (socket && activeChatUser) {
      socket.emit('typing', { senderId: user._id, receiverId: activeChatUser._id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() =>
        socket.emit('stop_typing', { senderId: user._id, receiverId: activeChatUser._id }), 2000);
    }
  };

  const handleImageAttach = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedImage(await toBase64(file));
  };

  /* ── double-tap heart burst on message image ────────────────── */
  const handleDoubleTap = (e) => {
    const rect = chatRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setHeartBurst({ id, x, y });
    setTimeout(() => setHeartBurst(null), 950);
  };

  /* ── send message ───────────────────────────────────────────── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeChatUser || (!typedMessage.trim() && !attachedImage)) return;
    setIsSending(true);
    try {
      await api.sendMessage({ receiverId: activeChatUser._id, message: typedMessage, image: attachedImage });
      setTypedMessage('');
      setAttachedImage('');
      socket?.emit('stop_typing', { senderId: user._id, receiverId: activeChatUser._id });
      scrollToBottom();
    } catch {
      showToast('Failed to send message', '❌');
    } finally {
      setIsSending(false);
    }
  };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <>
      {/* ── INSTAGRAM-STYLE TOAST BANNER ──────────────────── */}
      {toast && (
        <div className={`toast-banner ${toast.phase === 'in' ? 'toast-in' : 'toast-out'}`}>
          <span className="text-lg">{toast.icon}</span>
          <span className="flex-1">{toast.msg}</span>
        </div>
      )}

      <div className="glass-panel w-full rounded-2xl h-[calc(100vh-130px)] md:h-[650px] overflow-hidden flex shadow-2xl relative border border-brand-border">

        {/* ── LEFT: CONVERSATION LIST ─────────────────────── */}
        <div className={`w-full md:w-[280px] border-r border-brand-border flex flex-col h-full bg-brand-dark/45 ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>

          {/* header + search */}
          <div className="p-4 border-b border-brand-border flex flex-col gap-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-purple" />
              <span>Direct Chats</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search creator to chat..."
                className="w-full bg-white/5 border border-brand-border rounded-lg py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* search suggestions dropdown */}
          {searchSuggestions.length > 0 && (
            <div className="p-2 border-b border-brand-border bg-brand-card/90 max-h-[150px] overflow-y-auto flex flex-col gap-1.5 modal-sheet">
              {searchSuggestions.map(u => (
                <div key={u._id} onClick={() => handleStartChat(u)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-brand-purple/10 cursor-pointer">
                  <img src={u.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                    alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-bold text-white truncate">{u.username}</span>
                </div>
              ))}
            </div>
          )}

          {/* conversation list */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {isLoadingChats
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-9 h-9 rounded-full skeleton-loading" />
                    <div className="flex-1 h-3 rounded skeleton-loading" />
                  </div>
                ))
              : conversations.length === 0
                ? <p className="text-xs text-slate-500 text-center py-12 px-4">Search a creator above to start chatting!</p>
                : conversations.map(conv => {
                    const isSelected = activeChatUser?._id === conv.user._id;
                    const isOnline   = onlineUsers.includes(conv.user._id);
                    const unread     = conv.lastMessage?.receiverId === user._id && !conv.lastMessage?.seenStatus;
                    return (
                      <div key={conv.user._id} onClick={() => setActiveChatUser(conv.user)}
                        className={`flex items-center gap-3 p-3 cursor-pointer border-b border-brand-border/20 transition-all ${isSelected ? 'bg-brand-purple/10 border-l-4 border-l-brand-purple' : 'hover:bg-white/[0.02]'}`}>
                        <div className="relative flex-shrink-0">
                          <img src={conv.user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'}
                            alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                          {isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-brand-dark" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{conv.user.username}</span>
                            <span className="text-[8px] text-slate-500">
                              {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 ${unread ? 'text-brand-neonBlue font-semibold' : 'text-slate-400 font-light'}`}>
                            {conv.lastMessage?.message || 'shared an image'}
                          </p>
                        </div>
                        {unread && <div className="relative w-2 h-2 rounded-full bg-brand-neonBlue flex-shrink-0 notif-ping" />}
                      </div>
                    );
                  })
            }
          </div>
        </div>

        {/* ── RIGHT: CHAT WINDOW ──────────────────────────── */}
        <div className={`flex-1 flex flex-col h-full bg-slate-950/20 ${!activeChatUser ? 'hidden md:flex' : 'flex'}`}>

          {activeChatUser ? (
            <>
              {/* chat header — fade-up entrance */}
              <div className="p-4 border-b border-brand-border flex items-center gap-3 bg-brand-dark/35 z-10 fade-up">
                <button onClick={() => setActiveChatUser(null)} className="md:hidden p-1.5 rounded-lg text-slate-400">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={activeChatUser.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100'}
                    alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                  {onlineUsers.includes(activeChatUser._id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-brand-dark" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{activeChatUser.username}</h3>
                  <p className="text-[9px] text-slate-500">
                    {isOtherTyping ? (
                      <span className="text-brand-purple font-semibold animate-pulse">typing...</span>
                    ) : onlineUsers.includes(activeChatUser._id) ? 'Online now' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* message log area with relative container for heart burst */}
              <div ref={chatRef} onDoubleClick={handleDoubleTap}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative">

                {/* ── HEART BURST OVERLAY ─── */}
                {heartBurst && (
                  <span key={heartBurst.id} className="heart-burst select-none"
                    style={{ left: heartBurst.x - 36, top: heartBurst.y - 36 }}>
                    ❤️
                  </span>
                )}

                {isLoadingMsgs
                  ? <div className="flex-1 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                  : messages.length === 0
                    ? <div className="flex-1 flex items-center justify-center text-xs text-slate-500 italic">
                        Say hello to {activeChatUser.username}! 👋
                      </div>
                    : messages.map((msg, idx) => {
                        const isOut = msg.senderId._id === user._id;
                        const isLast = idx === messages.length - 1;
                        const isNew  = msg._id === newMsgId;
                        return (
                          <div key={msg._id} className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] items-end ${isOut ? 'flex-row-reverse' : ''}`}>
                              {!isOut && (
                                <img src={activeChatUser.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                                  alt="av" className="w-6 h-6 rounded-full object-cover mb-1" />
                              )}
                              {/* ── MESSAGE BUBBLE with pop-in animation ── */}
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isOut
                                  ? 'bg-gradient-to-r from-brand-purple to-brand-purpleDark text-white rounded-br-none shadow-neonPurple'
                                  : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/50'}
                                ${isNew ? `msg-bubble-in ${isOut ? 'outgoing' : ''}` : ''}`}
                              >
                                {msg.message && <p>{msg.message}</p>}
                                {msg.image && (
                                  <div className="max-w-[200px] rounded-lg overflow-hidden mt-1.5 border border-brand-border">
                                    <img src={msg.image} alt="attachment" className="w-full h-auto" />
                                  </div>
                                )}
                              </div>
                            </div>
                            {isOut && isLast && (
                              <span className="text-[8px] text-slate-500 mt-1 flex items-center gap-1">
                                {msg.seenStatus
                                  ? <><CheckCheck className="w-3 h-3 text-brand-neonBlue" /><span>Seen</span></>
                                  : <><Check className="w-3 h-3 text-slate-500" /><span>Sent</span></>}
                              </span>
                            )}
                          </div>
                        );
                      })
                }

                {/* ── INSTAGRAM-STYLE TYPING INDICATOR ── */}
                {isOtherTyping && (
                  <div className="flex items-center gap-2 fade-up">
                    <img src={activeChatUser.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                      alt="av" className="w-6 h-6 rounded-full object-cover" />
                    <div className="ig-typing-bubble">
                      <span className="ig-typing-dot" />
                      <span className="ig-typing-dot" />
                      <span className="ig-typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* attached image preview */}
              {attachedImage && (
                <div className="px-4 py-2 border-t border-brand-border bg-brand-card flex items-center justify-between modal-sheet">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-border">
                      <img src={attachedImage} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-slate-400">Image ready to send</span>
                  </div>
                  <button onClick={() => setAttachedImage('')} className="p-1 rounded-full hover:bg-white/10 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* send bar */}
              <form onSubmit={handleSend} className="p-4 border-t border-brand-border flex flex-col gap-3 bg-brand-dark/20 z-10">
                {/* quick emoji row */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {['👍','❤️','🔥','😂','😮','😢','👏','🤝'].map(em => (
                    <button key={em} type="button"
                      onClick={() => setTypedMessage(p => p + em)}
                      className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-transform hover:scale-110">
                      {em}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <label className="p-2.5 rounded-xl hover:bg-white/5 text-brand-neonBlue cursor-pointer">
                    <Image className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleImageAttach} className="hidden" />
                  </label>

                  <input value={typedMessage} onChange={handleMsgChange}
                    placeholder="Message..."
                    className="flex-1 bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-purple transition-colors" />

                  <button type="submit" disabled={isSending || (!typedMessage.trim() && !attachedImage)}
                    className="p-2.5 rounded-xl btn-neon-purple text-white hover:scale-105 disabled:opacity-50 transition-transform btn-ripple">
                    {isSending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 fade-up">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-brand-border flex items-center justify-center text-slate-600">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-300">Your Chat Space</h3>
              <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
                Select a conversation or search a creator to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MessagesPage;
