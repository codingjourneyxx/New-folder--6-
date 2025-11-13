import { useState, useRef, useEffect } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, PanelLeft, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen, Loader2, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { sendMessage } from '@/lib/openrouter'
import { useSmoothScroll } from '@/hooks/use-smooth-scroll'

function App() {
  // Enable smooth scrolling
  useSmoothScroll()

  const [chats, setChats] = useState([
    { id: 1, title: 'New Chat', preview: 'Hello! I\'m your AI assistant...', timestamp: new Date() }
  ])
  const [currentChatId, setCurrentChatId] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      title: 'New Chat',
      preview: 'Start a new conversation...',
      timestamp: new Date()
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
    setSidebarOpen(false)
  }

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    if (currentChatId === chatId && updatedChats.length > 0) {
      setCurrentChatId(updatedChats[0].id)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue('')
    setIsLoading(true)

    try {
      // Call OpenRouter API
      const aiResponse = await sendMessage(updatedMessages)

      const botMessage = {
        id: updatedMessages.length + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: updatedMessages.length + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }


  const SidebarContent = ({ collapsed = false, showToggle = true }) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-card/80">
      {/* Collapse/Expand Toggle (Desktop only) */}
      {showToggle ? (
        <div className={`p-3 flex items-center gap-2 ${collapsed ? 'justify-center flex-col' : 'justify-between'}`}>
          {!collapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={createNewChat} className="flex-1 justify-start gap-2 font-semibold shadow-sm hover:shadow-md transition-all" size="sm">
                    <Plus className="w-4 h-4" />
                    New Chat
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start a new conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!collapsed)}
                  className="w-9 h-9 shrink-0 hover:bg-accent/50"
                >
                  {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="p-3">
          <Button onClick={createNewChat} className="w-full justify-start gap-2 font-semibold shadow-sm" variant="default">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      )}

      <Separator />

      {/* New Chat Button (Collapsed View) */}
      {collapsed && showToggle && (
        <div className="p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={createNewChat} className="w-full shadow-sm" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Chat History */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {chats.map((chat) => (
            <TooltipProvider key={chat.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`group flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-3'
                    } ${
                      currentChatId === chat.id
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm border border-primary/20'
                        : 'hover:bg-accent/70 hover:shadow-sm border border-transparent'
                    }`}
                    onClick={() => {
                      setCurrentChatId(chat.id)
                      setSidebarOpen(false)
                    }}
                  >
                    {collapsed ? (
                      <MessageSquare className={`w-4 h-4 shrink-0 ${currentChatId === chat.id ? 'text-primary' : ''}`} />
                    ) : (
                      <>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <MessageSquare className={`w-4 h-4 shrink-0 ${currentChatId === chat.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">{chat.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.preview}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <p className="font-medium">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">{chat.preview}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex border-r bg-card flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <SidebarContent collapsed={sidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden w-9 h-9 hover:bg-accent/50">
                    <PanelLeft className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SidebarContent collapsed={false} showToggle={false} />
                </SheetContent>
              </Sheet>

              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  AI Assistant
                  <Badge variant="secondary" className="text-xs font-normal">GPT-3.5</Badge>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Powered by OpenRouter</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 group ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className={`w-9 h-9 shrink-0 ring-2 ring-offset-2 ${
                message.type === 'bot'
                  ? 'ring-primary/20 ring-offset-background'
                  : 'ring-secondary/30 ring-offset-background'
              }`}>
                <AvatarFallback className={
                  message.type === 'bot'
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                    : 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground'
                }>
                  {message.type === 'bot' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex flex-col gap-2 max-w-[75%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-5 py-3 shadow-sm border transition-all duration-200 group-hover:shadow-md ${
                    message.type === 'bot'
                      ? 'bg-card border-border text-foreground'
                      : 'bg-gradient-to-br from-primary to-primary/90 border-primary/20 text-primary-foreground'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-[11px] text-muted-foreground px-2 font-medium">{message.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Avatar className="w-9 h-9 shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm shadow-lg">
        <div className="max-w-4xl mx-auto px-2 py-4">
          <div className="flex gap-3 items-center justify-center">
            <div className="flex-1 relative ">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your message... (Shift + Enter for new line)"
                className="min-h-10 max-h-[200px] resize-none rounded-md border-2 px-4 py-3 text-[15px] focus:border-primary/50 shadow-sm transition-all"
                disabled={isLoading}
                rows={1}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-xl shadow-md hover:shadow-lg transition-all"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-3 font-medium">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send •
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono ml-1">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}

export default App
