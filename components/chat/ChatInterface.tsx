'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Send, Plus, MessageSquare, Zap, ChevronDown,
  AlertCircle, Lock, Copy, CheckCheck, Trash2, Scale
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import { UpgradeModal } from '@/components/UpgradeModal'

type Message = { role: 'user' | 'assistant'; content: string; timestamp: string }
type Conversation = { id: string; title?: string; created_at: string; messages: Message[] }

const STARTERS = [
  "I have a credit card debt with Capital One for $5,000 that's 6 months past due. What are my options?",
  "A debt collector keeps calling me multiple times a day. Is this legal?",
  "I want to settle my debt for less than I owe. How do I negotiate?",
  "How do I send a debt validation letter? What should it say?",
]

interface Props {
  userId: string
  plan: string
  profile: { full_name?: string; state?: string } | null
  debts: Array<{ id: string; creditor_name: string; debt_type: string; current_balance: number; status: string }>
  conversations: Conversation[]
}

export function ChatInterface({ userId, plan, profile, debts, conversations: initialConvs }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConvs)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [selectedDebt, setSelectedDebt] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id)
    setMessages(conv.messages || [])
    setStreamContent('')
  }

  const startNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    setStreamContent('')
    setInput('')
  }

  const sendMessage = async (content?: string) => {
    const text = content || input.trim()
    if (!text || streaming) return

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setStreamContent('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          conversationId: activeConvId,
          debtId: selectedDebt || null,
        }),
      })

      if (res.status === 429) {
        setStreaming(false)
        setMessages(msgs => msgs.slice(0, -1))
        setShowUpgrade(true)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullContent += chunk
        setStreamContent(fullContent)
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, assistantMsg]
      setMessages(finalMessages)
      setStreamContent('')

      // Update conversation list — use real ID from server header if available
      const serverConvId = res.headers.get('X-Conversation-Id')
      if (!activeConvId || activeConvId.startsWith('temp-')) {
        const realId = serverConvId || ('temp-' + Date.now())
        const title = text.length > 50 ? text.substring(0, 50) + '...' : text
        const newConv: Conversation = {
          id: realId,
          title,
          created_at: new Date().toISOString(),
          messages: finalMessages,
        }
        if (!activeConvId) {
          setConversations(prev => [newConv, ...prev])
        } else {
          // Replace temp with real ID
          setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, id: realId } : c))
        }
        setActiveConvId(realId)
      }
    } catch (err) {
      toast.error('Failed to send message. Try again.')
      setMessages(msgs => msgs.slice(0, -1))
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copied to clipboard')
  }

  const isEmpty = messages.length === 0 && !streaming

  return (
    <div className="flex h-screen md:h-[calc(100vh-0px)]">
      {/* Conversation Sidebar */}
      <div className={cn(
        'w-64 flex-shrink-0 border-r border-white/10 bg-navy-100 flex flex-col transition-all duration-200',
        showSidebar ? 'flex' : 'hidden',
        'hidden md:flex'
      )}>
        <div className="p-3 border-b border-white/10">
          <Button onClick={startNewChat} className="w-full" size="sm" icon={<Plus className="w-4 h-4" />}>
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all group',
                activeConvId === conv.id
                  ? 'bg-teal-400/15 text-teal-300 border border-teal-400/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{conv.title || 'Chat Session'}</span>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-white/30 text-xs text-center py-8">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-teal-400/20 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">DebtCoach AI</h2>
              <p className="text-white/40 text-xs">Expert debt negotiation assistant</p>
            </div>
          </div>

          {/* Debt selector */}
          {debts.length > 0 && (
            <div className="relative hidden sm:block">
              <select
                className="input py-1.5 text-xs pr-7 w-48"
                value={selectedDebt}
                onChange={(e) => setSelectedDebt(e.target.value)}
              >
                <option value="">No debt selected</option>
                {debts.map(d => (
                  <option key={d.id} value={d.id}>{d.creditor_name} — ${d.current_balance.toLocaleString()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
            </div>
          )}

          <Button onClick={startNewChat} variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />}>
            New
          </Button>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-200/80 text-xs leading-relaxed">
            <strong className="text-amber-300">Educational Information Only</strong> — DebtCoach AI is not a law firm and does not provide legal advice. Nothing here creates an attorney-client relationship. Consult a licensed attorney before sending any letters or taking legal action.
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-teal-400/20 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Your AI Debt Coach</h3>
              <p className="text-white/50 text-sm mb-8">
                I know FDCPA, FCRA, statute of limitations, and proven negotiation tactics.
                Tell me about your debt situation.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-teal-400/30 text-white/70 hover:text-white text-sm transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              onCopy={() => copyMessage(msg.content, String(i))}
              copied={copiedId === String(i)}
            />
          ))}

          {/* Streaming message */}
          {streaming && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-white/80 text-sm leading-relaxed">
                  {streamContent ? (
                    <MarkdownContent content={streamContent} />
                  ) : (
                    <div className="typing-indicator flex gap-1 py-1">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Free tier limit warning */}
        {plan === 'free' && (
          <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20">
            <p className="text-yellow-300/80 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Free plan: 3 messages/day.{' '}
              <Link href="/account?tab=billing" className="underline hover:text-yellow-200">
                Upgrade to Pro
              </Link>{' '}
              for unlimited access.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-teal-400/40 transition-all">
              <textarea
                ref={inputRef}
                className="w-full bg-transparent px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none"
                placeholder="Describe your debt situation or ask a question..."
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              loading={streaming}
              className="flex-shrink-0 h-12 w-12 p-0"
              icon={<Send className="w-4 h-4" />}
            >
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-center text-white/25 text-xs mt-2">
            Press Enter to send · Shift+Enter for new line · <span className="text-amber-400/60">Not legal advice — not a law firm — no attorney-client relationship</span>
          </p>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="chat" />
    </div>
  )
}

function ChatMessage({ message, onCopy, copied }: {
  message: Message
  onCopy: () => void
  copied: boolean
}) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-teal-400/20' : 'bg-white/10'
      )}>
        {isUser ? (
          <span className="text-teal-300 text-xs font-bold">You</span>
        ) : (
          <Zap className="w-4 h-4 text-teal-400" />
        )}
      </div>
      <div className={cn(
        'flex-1 max-w-3xl group',
        isUser ? 'flex flex-col items-end' : ''
      )}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-teal-400/20 text-white rounded-tr-sm'
            : 'bg-white/5 text-white/85 rounded-tl-sm'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        {!isUser && (
          <button
            onClick={onCopy}
            className="mt-1 text-white/20 hover:text-white/50 transition-colors flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100"
          >
            {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-p:my-1 prose-p:leading-relaxed
      prose-headings:text-teal-300 prose-headings:font-semibold prose-headings:my-2
      prose-strong:text-white prose-strong:font-semibold
      prose-ul:my-2 prose-li:my-0.5
      prose-ol:my-2
      prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:text-teal-300
      prose-blockquote:border-teal-400 prose-blockquote:text-white/60
    ">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
