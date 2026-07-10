import React from 'react';
import { ShieldAlert, Eye, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4 text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed" id="privacy_page">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400 font-medium">Last updated: July 2026</p>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-850 pt-6 space-y-4">
        <p>
          At TaxCalc Pro, accessible from taxcalcpro.vercel.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that are collected and recorded by TaxCalc Pro and how we use it.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
          <Lock size={16} className="text-blue-500" />
          1. 100% Client-Side Local State Guarantee
        </h2>
        <p>
          We employ a <strong>client-side sandboxing architecture</strong>. This means that all variables, salary parameters, deductions, local state settings, or transaction tables you enter into our calculation modules are processed strictly inside your own browser's JavaScript memory and locally synchronized using standard <code>localStorage</code>.
        </p>
        <p className="bg-green-50/50 dark:bg-green-950/10 p-3 rounded-xl border border-green-100 text-xs text-green-800 dark:text-green-400">
          <strong>Key Security Standard:</strong> We do NOT run server-side databases for tax profiles, and we never transmit or save your sensitive financial details onto external servers. Your calculations are strictly private to you.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
          <Eye size={16} className="text-blue-500" />
          2. Log Files & Standard Web Metrics
        </h2>
        <p>
          TaxCalc Pro follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-2">
          <ShieldAlert size={16} className="text-blue-500" />
          3. Google DoubleClick DART Cookie & AdSense Partners
        </h2>
        <p>
          Google is one of our third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">https://policies.google.com/technologies/ads</a>.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">4. Third-Party Privacy Policies</h2>
        <p>
          TaxCalc Pro's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white pt-2">5. Children's Information</h2>
        <p>
          Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. TaxCalc Pro does not knowingly collect any Personal Identifiable Information from children under the age of 13.
        </p>
      </div>
    </div>
  );
}
