import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="pt-24 pb-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight"
          >
            Get in <span className="text-emerald-600 italic">touch</span> with us
          </motion.h1>
          <p className="text-xl text-zinc-600 leading-relaxed">
            Have questions about our platform or need a custom solution? Our team is here to help you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-8 tracking-tight">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-1">Email Us</h4>
                    <p className="text-zinc-500">Our friendly team is here to help.</p>
                    <a href="mailto:hello@whatsappcrm.ai" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">hello@whatsappcrm.ai</a>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-1">Call Us</h4>
                    <p className="text-zinc-500">Mon-Fri from 9am to 6pm.</p>
                    <a href="tel:+15550000000" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">+1 (555) 000-0000</a>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 mb-1">Visit Us</h4>
                    <p className="text-zinc-500">Come say hello at our office.</p>
                    <p className="text-zinc-900 font-bold mt-2">123 Innovation Way, San Francisco, CA 94103</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links or other info */}
            <div className="p-8 bg-zinc-50 rounded-[32px] border border-zinc-100">
              <h4 className="font-bold text-zinc-900 mb-4">Follow our journey</h4>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">Stay updated with the latest features, tips, and news about WhatsApp sales automation.</p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <button key={social} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-100 shadow-2xl shadow-zinc-200/50">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Message Sent!</h3>
                <p className="text-zinc-600 mb-8 leading-relaxed">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-900 ml-1">First Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-900 ml-1">Last Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-900 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-900 ml-1">Subject</label>
                  <select className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer">
                    <option>General Inquiry</option>
                    <option>Sales Question</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-900 ml-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
