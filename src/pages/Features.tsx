import React from 'react';
import { MessageSquare, Zap, Shield, BarChart3, Users, Smartphone, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Features() {
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      title: "AI-Powered Conversations",
      description: "Our advanced AI understands context and intent, providing human-like responses to your WhatsApp leads 24/7.",
      benefits: ["Context-aware replies", "Multi-language support", "Intent detection"]
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: "Instant Lead Capture",
      description: "Automatically capture lead information from WhatsApp messages and sync them directly to your CRM.",
      benefits: ["No manual entry", "Real-time sync", "Lead source tracking"]
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      title: "Secure Data Management",
      description: "Your customer data is encrypted and stored securely, ensuring privacy and compliance with data regulations.",
      benefits: ["End-to-end encryption", "Role-based access", "GDPR compliant"]
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: "Advanced Analytics",
      description: "Gain deep insights into your sales performance with comprehensive dashboards and reporting tools.",
      benefits: ["Conversion tracking", "Response time metrics", "Team performance"]
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "Team Collaboration",
      description: "Manage your entire sales team from one dashboard, assigning leads and tracking their progress.",
      benefits: ["Lead assignment", "Shared inbox", "Internal notes"]
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      title: "Mobile Optimized",
      description: "Manage your business on the go with our fully responsive web application designed for all devices.",
      benefits: ["Responsive design", "Push notifications", "Mobile-first UI"]
    }
  ];

  return (
    <div className="pt-24 pb-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight"
          >
            Powerful features to <span className="text-emerald-600 italic">supercharge</span> your sales
          </motion.h1>
          <p className="text-xl text-zinc-600 leading-relaxed">
            Everything you need to manage, automate, and scale your WhatsApp sales pipeline in one powerful platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">{feature.title}</h3>
              <p className="text-zinc-600 mb-8 leading-relaxed">{feature.description}</p>
              <ul className="space-y-3">
                {feature.benefits.map((benefit, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Secondary Section */}
        <div className="mt-32 p-12 md:p-20 bg-zinc-900 rounded-[40px] text-white relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Built for the <span className="text-emerald-400 italic">modern</span> business</h2>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                We've spent thousands of hours perfecting our platform to ensure it meets the needs of businesses of all sizes. From small startups to large enterprises, our features are built to scale with you.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-emerald-400 mb-2">99.9%</div>
                  <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-400 mb-2">24/7</div>
                  <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-emerald-500/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" />
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Globe className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="font-bold mb-2">Global Reach</h4>
                    <p className="text-xs text-zinc-500">Connect with customers anywhere in the world.</p>
                  </div>
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Clock className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="font-bold mb-2">Real-time</h4>
                    <p className="text-xs text-zinc-500">Instant responses and live updates.</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Zap className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="font-bold mb-2">Automation</h4>
                    <p className="text-xs text-zinc-500">Save hours of manual work every day.</p>
                  </div>
                  <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <Users className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="font-bold mb-2">CRM</h4>
                    <p className="text-xs text-zinc-500">Centralized lead management.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
