'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AIUsage, backendApi, getApiError } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I&apos;m your FlowPilot AI Assistant. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string>()
  const [sending, setSending] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [documentId, setDocumentId] = useState('')
  const [documentQuestion, setDocumentQuestion] = useState('')
  const [documentAnswer, setDocumentAnswer] = useState('')
  const [report, setReport] = useState('')
  const [usage, setUsage] = useState<AIUsage>()

  const refreshUsage = () => backendApi.aiUsage().then(({ data }) => setUsage(data.data)).catch(() => undefined)
  useEffect(() => { void refreshUsage() }, [])

  const handleSend = async (prompt = input) => {
    if (!prompt.trim() || sending) return
    if (usage?.remaining === 0) { toast.error('You have used all 5 AI prompts for today. Your limit resets at 00:00 UTC.'); return }
    setMessages(prev => [...prev, { role: 'user', content: prompt }]); setInput(''); setSending(true)
    try { const result=(await backendApi.chat(prompt,conversationId)).data.data; setConversationId(result.conversationId); setMessages(prev=>[...prev,{role:'assistant',content:result.answer}]) }
    catch(error){ toast.error(getApiError(error,'AI request failed')) }
    finally { setSending(false); void refreshUsage() }
  }
  const loadConversations = async () => { try { setConversations((await backendApi.conversations()).data.data) } catch(e){toast.error(getApiError(e))} }
  const upload = async (file?:File) => { if(!file)return;try{const doc=(await backendApi.uploadDocument(file)).data.data;setDocumentId(doc._id);toast.success('Document uploaded')}catch(e){toast.error(getApiError(e))} }
  const askDocument = async () => { if(usage?.remaining===0){toast.error('Daily AI prompt limit reached');return}try{const answer=(await backendApi.askDocument(documentQuestion,documentId||undefined)).data.data;setDocumentAnswer(answer.answer)}catch(e){toast.error(getApiError(e))}finally{void refreshUsage()} }
  const generateReport = async (type:string) => { if(usage?.remaining===0){toast.error('Daily AI prompt limit reached');return}try{const value=(await backendApi.generateReport(type)).data.data;setReport(value.report)}catch(e){toast.error(getApiError(e))}finally{void refreshUsage()} }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground">Get intelligent insights and automation suggestions</p>
          {usage && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${usage.remaining ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'}`}>{usage.remaining} of {usage.limit} prompts left today</span>}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex h-[32rem] flex-col md:h-[42rem]">
        <CardHeader className="border-b">
          <CardTitle>Chat with FlowPilot AI</CardTitle>
          <CardDescription>Ask questions about your leads, projects, and team</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-foreground rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </CardContent>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={usage?.remaining === 0 ? 'Daily prompt limit reached' : 'Ask anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={usage?.remaining === 0}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <Button onClick={() => handleSend()} size="icon" disabled={sending || usage?.remaining === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Generate lead analysis','Project timeline recommendation','Team productivity report','Upcoming opportunities'].map(action=><Button key={action} disabled={sending || usage?.remaining === 0} onClick={()=>handleSend(action)} variant="outline" className="justify-start">{action}</Button>)}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Conversations</CardTitle><CardDescription>Load conversation history</CardDescription></CardHeader><CardContent className="space-y-3"><Button variant="outline" onClick={loadConversations}>Refresh conversations</Button>{conversations.map(c=><div key={c._id} className="rounded bg-muted p-2 text-sm">{c.title}</div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Document Q&amp;A</CardTitle><CardDescription>Upload, then ask questions</CardDescription></CardHeader><CardContent className="space-y-3"><input type="file" onChange={e=>upload(e.target.files?.[0])} className="w-full text-sm"/><input value={documentQuestion} onChange={e=>setDocumentQuestion(e.target.value)} placeholder="Question about the document" className="w-full rounded border bg-background px-3 py-2"/><Button onClick={askDocument} disabled={!documentQuestion || usage?.remaining === 0}>Ask document</Button>{documentAnswer&&<p className="rounded bg-muted p-3 text-sm">{documentAnswer}</p>}</CardContent></Card>
        <Card className="md:col-span-2"><CardHeader><CardTitle>Reports</CardTitle><CardDescription>Generate backend business reports</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2">{['revenue','crm','projects','productivity'].map(type=><Button key={type} disabled={usage?.remaining === 0} variant="outline" onClick={()=>generateReport(type)} className="capitalize">{type}</Button>)}</div>{report&&<p className="whitespace-pre-wrap rounded bg-muted p-4 text-sm">{report}</p>}</CardContent></Card>
      </div>
    </div>
  )
}
