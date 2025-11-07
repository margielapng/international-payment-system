"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PaymentState = {
  amount: string;
  currency: string;
  provider: string;
  payeeAccountName: string;
  payeeAccountNumber: string;
  payeeSwiftCode: string;
  payeeBankName: string;
};

type FieldErrors = {
  amount?: string;
  payeeAccountName?: string;
  payeeAccountNumber?: string;
  payeeSwiftCode?: string;
  payeeBankName?: string;
  submit?: string;
};

export default function CustomerDashboard() {
  const router = useRouter();

  // safely read user from localStorage (client-only)
  let parsedUser: { username?: string; id?: string; role?: string } = {};
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    parsedUser = raw ? JSON.parse(raw) : {};
  } catch {
    parsedUser = {};
  }

  const [step, setStep] = useState<number>(1);
  const [payment, setPayment] = useState<PaymentState>({
    amount: "",
    currency: "ZAR",
    provider: "SWIFT",
    payeeAccountName: "",
    payeeAccountNumber: "",
    payeeSwiftCode: "",
    payeeBankName: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");

  const validationRules: Record<string, RegExp> = {
    amount: /^\d+(\.\d{1,2})?$/,
    currency: /^[A-Z]{3}$/,
    payeeAccountName: /^[a-zA-Z\s'-]{2,50}$/,
    payeeAccountNumber: /^[0-9]{10,20}$/,
    payeeSwiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    payeeBankName: /^[a-zA-Z\s'-]{2,50}$/,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPayment((p) => ({ ...p, [name]: value }));
    if ((errors as any)[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: FieldErrors = {};

    if (stepNum === 1) {
      if (!validationRules.amount.test(String(payment.amount).trim())) {
        newErrors.amount = "Invalid amount format (use numbers, optional 2 decimals)";
      }
    } else if (stepNum === 3) {
      if (!validationRules.payeeAccountName.test(String(payment.payeeAccountName).trim())) {
        newErrors.payeeAccountName = "Invalid account name";
      }
      if (!validationRules.payeeAccountNumber.test(String(payment.payeeAccountNumber).trim())) {
        newErrors.payeeAccountNumber = "Invalid account number";
      }
      if (!validationRules.payeeSwiftCode.test(String(payment.payeeSwiftCode).trim())) {
        newErrors.payeeSwiftCode = "Invalid SWIFT code format";
      }
      if (!validationRules.payeeBankName.test(String(payment.payeeBankName).trim())) {
        newErrors.payeeBankName = "Invalid bank name";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const resp = await axios.post(`${API_URL}/api/payments/create`, payment, { headers });
      if (resp?.data) {
        setSuccess("Payment submitted successfully! It will be verified by our team.");
        setTimeout(() => {
          setStep(1);
          setSuccess("");
          setPayment((p) => ({
            ...p,
            amount: "",
            payeeAccountName: "",
            payeeAccountNumber: "",
            payeeSwiftCode: "",
            payeeBankName: "",
          }));
        }, 3000);
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Payment failed";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-12 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h1 className="text-2xl font-bold text-white">SecureBank - Customer Portal</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          type="button"
        >
          Logout
        </button>
      </nav>

      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome, {parsedUser.username ?? "Customer"}</h2>
        <p className="text-slate-400">Account: {parsedUser.id ?? "—"}</p>
      </div>

      {/* Payment Form */}
      <div className="max-w-2xl bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">International Payment</h3>
          <StepIndicator currentStep={step} totalSteps={3} />
        </div>

        {success && <div className="mb-6 text-green-400">{success}</div>}
        {errors.submit && <div className="mb-6 text-red-400">{errors.submit}</div>}

        {/* Step 1: Amount & Currency */}
        {step === 1 && (
          <div className="space-y-6">
            <FormField
              label="Amount"
              name="amount"
              value={payment.amount}
              onChange={handleChange}
              error={errors.amount}
              placeholder="1000.00"
            />

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Currency</label>
              <select
                name="currency"
                value={payment.currency}
                onChange={handleChange}
                className="secure-input w-full px-3 py-2 rounded-md bg-slate-900 text-white border border-slate-700"
              >
                <option value="ZAR">ZAR - South African Rand</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Provider</label>
              <select
                name="provider"
                value={payment.provider}
                onChange={handleChange}
                className="secure-input w-full px-3 py-2 rounded-md bg-slate-900 text-white border border-slate-700 disabled:bg-slate-700"
                disabled
              >
                <option value="SWIFT">SWIFT</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (validateStep(1)) setStep(2);
              }}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
              type="button"
            >
              Next: Verify Details
            </button>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6">
            <ReviewField label="Amount" value={`${payment.amount} ${payment.currency}`} />
            <ReviewField label="Provider" value={payment.provider} />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-sky-500 text-sky-400 font-semibold rounded-lg hover:bg-slate-700 transition"
                type="button"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
                type="button"
              >
                Next: Payee Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payee Details */}
        {step === 3 && (
          <div className="space-y-6">
            <FormField
              label="Payee Account Name"
              name="payeeAccountName"
              value={payment.payeeAccountName}
              onChange={handleChange}
              error={errors.payeeAccountName}
              placeholder="John Doe"
            />

            <FormField
              label="Payee Account Number"
              name="payeeAccountNumber"
              value={payment.payeeAccountNumber}
              onChange={handleChange}
              error={errors.payeeAccountNumber}
              placeholder="12345678901234"
            />

            <FormField
              label="SWIFT Code"
              name="payeeSwiftCode"
              value={payment.payeeSwiftCode}
              onChange={handleChange}
              error={errors.payeeSwiftCode}
              placeholder="ABCDZAJJ"
            />

            <FormField
              label="Bank Name"
              name="payeeBankName"
              value={payment.payeeBankName}
              onChange={handleChange}
              error={errors.payeeBankName}
              placeholder="Example Bank"
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-sky-500 text-sky-400 font-semibold rounded-lg hover:bg-slate-700 transition"
                type="button"
              >
                Back
              </button>
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
                type="button"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Helper subcomponents (typed) ---------- */

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              i + 1 <= currentStep ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`flex-1 h-1 ${i + 1 < currentStep ? "bg-sky-500" : "bg-slate-700"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  name: keyof PaymentState;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white mb-2">{label}</label>
      <input
        type={type}
        name={String(name)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`secure-input w-full px-3 py-2 rounded-md border ${error ? "border-red-500" : "border-slate-700"} bg-slate-900 text-white`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
      <span className="text-slate-300">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
