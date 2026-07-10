import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-slate-850 dark:text-slate-300" id="contact_page">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact TaxCalc Pro Support
        </h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Have questions about our tax estimation tools, feature requests, or editorial suggestions? Drop us a line below. Our compliance desk is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pt-4">
        {/* Contact details */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 rounded-2xl space-y-4">
            <h2 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={15} className="text-blue-500" />
              General Support channels
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              For security reasons, do not include sensitive financial account details or Tax Identification Numbers in your correspondence.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs">
                <Mail size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">USA Inquiries</p>
                  <p className="font-mono text-[11px] text-gray-500">support@taxcalcpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <Mail size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">India Compliance Desk</p>
                  <p className="font-mono text-[11px] text-gray-500">legal-india@taxcalcpro.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 p-6 sm:p-8 rounded-2xl">
          {submitted ? (
            <div className="text-center py-10 space-y-3" id="contact_success_message">
              <div className="inline-flex p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Message Transmitted Successfully!</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you for contacting TaxCalc Pro. Our legal and support desks will review your inquiry and follow up within 2-3 standard business days.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="text-xs font-bold text-blue-500 hover:underline pt-2"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="contact_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact_name" className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="contact_name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-slate-800 text-xs py-2.5 px-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact_email" className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-slate-800 text-xs py-2.5 px-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact_subject" className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  id="contact_subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-slate-800 text-xs py-2.5 px-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact_message" className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Your Message
                </label>
                <textarea
                  id="contact_message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-slate-800 text-xs py-2.5 px-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Describe your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10"
                id="contact_submit_btn"
              >
                <Send size={13} />
                Send Inquiry Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
