import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import {
  Users,
  MessageSquare,
  Search,
  ChevronRight,
  Loader2,
  Phone,
  Send,
  Bot,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Lead, Conversation } from '../types';
import { getAIChatResponse } from '../lib/gemini';

export function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever conversations update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleAiSuggest = async () => {
    if (!selectedLead || conversations.length === 0 || isAiGenerating) return;
    setIsAiGenerating(true);
    try {
      const lastMessages = conversations
        .slice(-5)
        .map((c) => `${c.sender}: ${c.message}`)
        .join('\n');
      const suggestion = await getAIChatResponse(
        'Suggest a professional follow-up message to this lead based on our conversation history.',
        `Lead Name: ${selectedLead.name || 'Unknown'}, Status: ${selectedLead.status}. History:\n${lastMessages}`
      );
      if (suggestion) setNewMessage(suggestion);
    } catch (err) {
      console.error('Error getting AI suggestion:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLeads();
    fetchWebhookLogs();

    const leadsSubscription = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` },
        () => { fetchLeads(); }
      )
      .subscribe();

    const logsSubscription = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'webhook_logs', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setWebhookLogs((prev) => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSubscription);
      supabase.removeChannel(logsSubscription);
    };
  }, [user]);

  async function fetchWebhookLogs() {
    if (!user) return;
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setWebhookLogs(data);
  }

  useEffect(() => {
    if (!selectedLead || !user) return;
    fetchConversations(selectedLead.id);

    const convSubscription = supabase
      .channel(`conv-${selectedLead.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations', filter: `lead_id=eq.${selectedLead.id}` },
        (payload) => {
          setConversations((prev) => {
            if (prev.some((c) => c.id === payload.new.id)) return prev;
            return [...prev, payload.new as Conversation];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(convSubscription); };
  }, [selectedLead, user]);

  async function fetchLeads() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_interaction', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConversations(leadId: string) {
    setLoadingChat(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingChat(false);
    }
  }

  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      const { error } = await supabase.from('leads').update({ status }).eq('id', leadId);
      if (error) throw error;
      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status } : l)));
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status });
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      (l.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      l.phone_number.includes(searchQuery)
  );

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'qualified': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'converted': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'lost': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-100';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedLead || !user || isSending) return;
    setIsSending(true);
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          leadId: selectedLead.id,
          message: newMessage.trim(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      const { conversation } = await response.json();
      setConversations([...conversations, conversation]);
      setNewMessage('');
      setLeads(leads.map((l) =>
        l.id === selectedLead.id ? { ...l, last_interaction: new Date().toISOString() } : l
      ));
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Leads List */}
      <div
        className={cn(
          'flex-1 md:w-96 md:flex-none flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm',
          selectedLead ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="p-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Leads</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto divide-y divide-zinc-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No leads found</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={cn(
                  'w-full p-4 text-left hover:bg-zinc-50 transition-colors flex items-center gap-3',
                  selectedLead?.id === lead.id && 'bg-emerald-50/50'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold shrink-0">
                  {lead.name?.[0] || <Phone size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {lead.name || lead.phone_number}
                    </p>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {new Date(lead.last_interaction).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500 truncate">{lead.phone_number}</p>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full border font-medium uppercase',
                        getStatusColor(lead.status)
                      )}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          'flex-1 flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm',
          !selectedLead && activeTab === 'chat'
            ? 'hidden md:flex items-center justify-center text-zinc-400'
            : 'flex'
        )}
      >
        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'chat'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            Conversation
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2',
              activeTab === 'logs'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            System Logs
            {webhookLogs.some((l) => l.error) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>

        {activeTab === 'logs' ? (
          <div className="flex-1 overflow-auto p-6 bg-zinc-50">
            <div className="max-w-3xl mx-auto space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">
                Webhook Activity (Last 50 events)
              </h3>
              {webhookLogs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-dashed border-zinc-200">
                  <p>No activity recorded yet. Send a WhatsApp message to test.</p>
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'p-4 rounded-xl border text-xs font-mono',
                      log.error
                        ? 'bg-red-50 border-red-100 text-red-700'
                        : 'bg-white border-zinc-200 text-zinc-600'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded uppercase text-[10px] font-bold',
                          log.error ? 'bg-red-100' : 'bg-zinc-100'
                        )}
                      >
                        {log.event_type}
                      </span>
                      <span className="text-zinc-400">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.error && <p className="font-bold mb-2">Error: {log.error}</p>}
                    <pre className="overflow-auto max-h-32 bg-zinc-900 text-zinc-300 p-2 rounded">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : !selectedLead ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">Select a lead to view conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <ChevronRight className="rotate-180" />
                </button>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  {selectedLead.name?.[0] || <Phone size={18} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    {selectedLead.name || selectedLead.phone_number}
                  </h3>
                  <p className="text-xs text-zinc-500">{selectedLead.phone_number}</p>
                </div>
              </div>
              <select
                value={selectedLead.status}
                onChange={(e) =>
                  updateLeadStatus(selectedLead.id, e.target.value as Lead['status'])
                }
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-xl border outline-none transition-all',
                  getStatusColor(selectedLead.status)
                )}
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 space-y-4 bg-zinc-50/30">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Bot size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                conversations.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[80%]',
                      msg.sender === 'customer' ? 'mr-auto' : 'ml-auto items-end'
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-2 rounded-2xl text-sm shadow-sm',
                        msg.sender === 'customer'
                          ? 'bg-white text-zinc-900 rounded-bl-none border border-zinc-100'
                          : 'bg-emerald-600 text-white rounded-br-none'
                      )}
                    >
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      {msg.sender === 'ai' && <Bot size={12} className="text-emerald-600" />}
                      <span className="text-[10px] text-zinc-400">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={handleAiSuggest}
                  disabled={isAiGenerating || conversations.length === 0}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isAiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bot size={12} />
                  )}
                  SUGGEST AI REPLY
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a manual response..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-zinc-400 mt-2 text-center">
                AI Chatbot is active. Manual responses will pause automation for this lead.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
