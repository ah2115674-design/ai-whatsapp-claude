import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Shield, BarChart3, ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-600 uppercase bg-emerald-50 rounded-full">
                AI-Powered Sales Automation
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 mb-8">
                Close more deals with <span className="text-emerald-600 italic">WhatsApp AI</span>
              </h1>
              <p className="text-xl text-zinc-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                The ultimate CRM for WhatsApp. Automate your leads, manage products, and let AI handle your customer conversations 24/7.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight size={20} />
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-zinc-700 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                  <Play size={20} fill="currentColor" /> Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Everything you need to scale</h2>
            <p className="text-zinc-600">Powerful tools designed to help you manage your WhatsApp sales pipeline with ease.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="text-emerald-600" />,
                title: "AI Chatbot",
                description: "Let our AI handle initial inquiries, qualify leads, and answer common questions around the clock."
              },
              {
                icon: <Zap className="text-emerald-600" />,
                title: "Instant Setup",
                description: "Connect your Twilio WhatsApp number in minutes and start receiving leads immediately."
              },
              {
                icon: <Shield className="text-emerald-600" />,
                title: "Secure CRM",
                description: "All your customer data and conversation history stored securely in one centralized dashboard."
              },
              {
                icon: <BarChart3 className="text-emerald-600" />,
                title: "Analytics",
                description: "Track your conversion rates, lead response times, and overall sales performance."
              },
              {
                icon: <ArrowRight className="text-emerald-600" />,
                title: "Lead Routing",
                description: "Automatically categorize and route leads to the right team members for follow-up."
              },
              {
                icon: <Play className="text-emerald-600" />,
                title: "Product Catalog",
                description: "Manage your products and share them directly with customers during conversations."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to transform your sales?</h2>
          <p className="text-emerald-100 text-xl mb-12 max-w-2xl mx-auto">
            Join hundreds of businesses using our platform to automate their WhatsApp sales and grow faster.
          </p>
          <Link
            to="/auth"
            className="inline-block px-10 py-5 text-lg font-bold text-emerald-600 bg-white rounded-2xl hover:bg-emerald-50 transition-all shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
      </section>
    </div>
  );
}
