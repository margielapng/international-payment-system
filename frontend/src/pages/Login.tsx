"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type FormData = {
  username: string;
  accountNumber: string;
  password: string;
};

type LoginErrors = {
  username?: string;
  accountNumber?: string;
  password?: string;
  submit?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    accountNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: LoginErrors = {};
    if (!formData.username) newErrors.username = "Username required";
    if (!formData.accountNumber) newErrors.accountNumber = "Account number required";
    if (!formData.password) newErrors.password = "Password required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: formData.username,
        accountNumber: formData.accountNumber,
        password: formData.password,
      });

      const { accessToken, user } = response.data ?? {};

      if (!accessToken || !user) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role;
      if (role === "customer") {
        router.push("/customer/dashboard");
      } else if (role === "employee" || role === "admin") {
        router.push("/employee/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-slate-400 mb-6">Secure access to international payments</p>

          {errors.submit && <div className="mb-4 text-red-400">{errors.submit}</div>}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className={`secure-input w-full px-3 py-2 rounded-md border ${
                  errors.username ? "border-red-500" : "border-slate-700"
                } bg-slate-900 text-white`}
                autoComplete="username"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="accountNumber">
                Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Your account number"
                className={`secure-input w-full px-3 py-2 rounded-md border ${
                  errors.accountNumber ? "border-red-500" : "border-slate-700"
                } bg-slate-900 text-white`}
                autoComplete="off"
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                className={`secure-input w-full px-3 py-2 rounded-md border ${
                  errors.password ? "border-red-500" : "border-slate-700"
                } bg-slate-900 text-white`}
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-sky-400 hover:text-sky-300"
              type="button"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
