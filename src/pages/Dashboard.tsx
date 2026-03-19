import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import {
  Package,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronRight,
  Phone,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { cn, formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import type { Lead } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    totalInquiries: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const totalLeads = leads?.length || 0;
        const qualifiedLeads = leads?.filter((l) => l.status === 'qualified').length || 0;
        const convertedLeads = leads?.filter((l) => l.status === 'converted').length || 0;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        setRecentLeads(leads?.slice(0, 5) || []);

        const { data: inquiries } = await supabase
          .from('conversations')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('sender', 'customer');

        setStats({
          totalProducts: productsCount || 0,
          qualifiedLeads,
          conversionRate,
          totalInquiries: inquiries?.length || 0,
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            date,
            name: format(date, 'EEE'),
            leads: leads?.filter((l) => isSameDay(new Date(l.created_at), date)).length || 0,
            inquiries:
              inquiries?.filter((inq) => isSameDay(new Date(inq.created_at), date)).length || 0,
          };
        });

        setChartData(last7Days);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12%',
      trendUp: true,
    },
    {
      name: 'Qualified Leads',
      value: stats.qualifiedLeads,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+5%',
      trendUp: true,
    },
    {
      name: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '-2%',
      trendUp: false,
    },
    {
      name: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: '+18%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500">Welcome back! Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2 rounded-xl', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <div
                className={cn(
                  'flex items-center text-xs font-medium px-2 py-1 rounded-full',
                  stat.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}
              >
                {stat.trendUp ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Lead Acquisition</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#10b981" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Daily Inquiries</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="inquiries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Recent Leads</h3>
          <Link
            to="/leads"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="divide-y divide-zinc-100">
          {recentLeads.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p>No leads yet. Start marketing to see results!</p>
            </div>
          ) : (
            recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                    {lead.name?.[0] || <Phone size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {lead.name || lead.phone_number}
                    </p>
                    <p className="text-xs text-zinc-500">{lead.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'text-[10px] px-2 py-1 rounded-full border font-medium uppercase',
                      lead.status === 'qualified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : lead.status === 'new'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : lead.status === 'converted'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    )}
                  >
                    {lead.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {format(new Date(lead.created_at), 'MMM d')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
