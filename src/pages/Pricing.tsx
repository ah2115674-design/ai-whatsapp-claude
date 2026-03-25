import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small businesses starting with WhatsApp sales automation.",
      features: [
        "Up to 500 leads/month",
        "AI Chatbot (Basic)",
        "Single WhatsApp number",
        "CRM Dashboard",
        "Email Support",
        "Basic Analytics"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      description: "Ideal for growing teams needing advanced AI and more lead capacity.",
      features: [
        "Up to 2,500 leads/month",
        "AI Chatbot (Advanced)",
        "3 WhatsApp numbers",
        "Team Collaboration",
        "Priority Support",
        "Advanced Analytics",
        "Custom AI Prompts"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scalable solutions for large organizations with high-volume needs.",
      features: [
        "Unlimited leads",
        "Custom AI Training",
        "Unlimited WhatsApp numbers",
        "Dedicated Account Manager",
        "API Access",
        "SLA Guarantee",
        "Custom Integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="pt-24 pb-32 bg-zinc-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight"
          >
            Simple, <span className="text-emerald-600 italic">transparent</span> pricing
          </motion.h1>
          <p className="text-xl text-zinc-600 leading-relaxed">
            Choose the perfect plan for your business. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative p-8 rounded-[32px] border transition-all duration-300 flex flex-col",
                plan.popular 
                  ? "bg-white border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 z-10" 
                  : "bg-white border-zinc-200 hover:border-zinc-300"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-zinc-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-zinc-500 font-medium">/month</span>}
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.cta === "Contact Sales" ? "/contact" : "/auth"}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2",
                  plan.popular
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                {plan.cta} <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section Preview */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="font-bold text-zinc-900 mb-2">Can I switch plans later?</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">Yes, you can upgrade or downgrade your plan at any time from your settings dashboard. Changes will be reflected in your next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-2">Is there a free trial?</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">Absolutely! We offer a 14-day free trial on our Starter and Professional plans so you can experience the full power of our platform.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-2">Do I need a Twilio account?</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">Yes, our platform integrates with Twilio for WhatsApp messaging. You'll need to provide your own Twilio credentials in the settings.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-2">Is my data secure?</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">Security is our top priority. We use industry-standard encryption and follow best practices to ensure your data is always safe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
