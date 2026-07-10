# TaxCalc Pro - Dual-Country Tax Optimizer 🇨🇦🇮🇳🇺🇸

TaxCalc Pro is a high-fidelity, interactive, and completely secure client-side tax planning and capital gains simulation utility designed for salaried individuals, freelancers, and active crypto traders. 

It provides seamless calculations for both the **United States (IRS regulations)** and **India (Income Tax Department slabs)**.

---

## 🔒 Security & Privacy Sandbox Guarantee

Unlike legacy tax software, TaxCalc Pro operates under a **Zero-Network-Egress Privacy Architecture**:
* **100% Browser-Based Memory**: All calculations, salary data, deductions, and transaction schedules are computed directly inside your browser.
* **Local Persistence Only**: All state is retained safely inside your browser's standard `localStorage`.
* **Zero Remote Database Exposure**: No personal financial inputs, IP tracking logs, or tax records are ever transmitted to or stored on external servers.

---

## ⚠️ Security Policy & Hardened Secret Rotation Notice

> [!WARNING]
> **CRITICAL SECURITY WARNING**:
> Under our strict **Secret Safety Policy**, no API keys, credentials, tokens, or database connection strings must ever be hardcoded into the codebase.
> 
> * **Rotate Credentials Regularly**: If any private API keys, third-party vendor secrets, or passwords were ever historical commits or string literals in this repository during earlier prototype iterations, **they are permanently recorded in your Git commit history**.
> * **Remediation**: You must rotate any such historical credentials immediately. 
> * **Environment Configuration**: Always use environment variables for keys. Reference `.env.example` to configure local testing variables.

---

## 🚀 Features

1. **Dual-Regime Slabs Comparison**:
   * **USA**: Computes Federal Slabs (Single, Married Filing Jointly, Head of Household) with Standard vs. Itemized Deductions comparison. Includes State Tax and FICA withholding estimates.
   * **India**: Side-by-side comparison of the **Old Tax Regime vs. New Tax Regime (FY 2024-25 / FY 2025-26)** with automated slabs intelligence.
2. **Interactive Crypto Capital Gains Tracker**:
   * Simulates full FIFO, LIFO, and HIFO (Highest In, First Out) cost basis calculation models.
   * Auto-adjusts calculations according to USA capital gains rules versus India's flat 30% flat Virtual Digital Asset tax rules (under Section 115BBH).
3. **Ancillary Calculators**:
   * **HRA (House Rent Allowance)** exempt portion logic.
   * **TDS (Tax Deducted at Source)** estimation cards.
   * **GST (Goods and Services Tax)** forward/reverse calculators.
4. **Intelligent Tax Planning Tips**:
   * Generates localized tips (NPS 80CCD(1B), 80C caps, HSA, Traditional vs. Roth IRA) based on entered user parameters.

---

## 🛠️ Getting Started & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` to configure optional variables:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

TaxCalc Pro is open-source software licensed under the **Apache-2.0 License**.
