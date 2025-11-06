"use client"

import type React from "react"
import { useState } from "react"
import { validateInput } from "../utils/validation"
import apiClient from "../utils/api"
import "../styles/forms.css"

interface PaymentFormData {
  amount: string
  currency: string
  provider: string
  payeeAccountNumber: string
  payeeSwiftCode: string
  payeeFullName: string
}

export default function PaymentForm() {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: "",
    currency: "",
    provider: "SWIFT",
    payeeAccountNumber: "",
    payeeSwiftCode: "",
    payeeFullName: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [confirmation, setConfirmation] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate amount
    const amountValidation = validateInput("paymentAmount", formData.amount)
    if (!amountValidation.valid) newErrors.amount = amountValidation.error || ""

    // Validate currency
    const currencyValidation = validateInput("currencyCode", formData.currency)
    if (!currencyValidation.valid) newErrors.currency = currencyValidation.error || ""

    // Validate payee account number
    const accountValidation = validateInput("accountNumber", formData.payeeAccountNumber)
    if (!accountValidation.valid) newErrors.payeeAccountNumber = accountValidation.error || ""

    // Validate SWIFT code
    const swiftValidation = validateInput("swiftCode", formData.payeeSwiftCode)
    if (!swiftValidation.valid) newErrors.payeeSwiftCode = swiftValidation.error || ""

    // Validate payee name
    if (!formData.payeeFullName || formData.payeeFullName.trim().length < 2) {
      newErrors.payeeFullName = "Payee name must be at least 2 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setConfirmation(true)
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    try {
      const response = await apiClient.post("/payments", {
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency.toUpperCase(),
        provider: formData.provider,
        payeeAccountNumber: formData.payeeAccountNumber.toUpperCase(),
        payeeSwiftCode: formData.payeeSwiftCode.toUpperCase(),
        payeeFullName: formData.payeeFullName,
      })

      setSuccess(`Payment submitted successfully! Transaction ID: ${response.data.transactionId}`)
      setFormData({
        amount: "",
        currency: "",
        provider: "SWIFT",
        payeeAccountNumber: "",
        payeeSwiftCode: "",
        payeeFullName: "",
      })
      setConfirmation(false)

      setTimeout(() => setSuccess(""), 5000)
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.error || "Payment submission failed" })
    } finally {
      setLoading(false)
    }
  }

  if (confirmation) {
    return (
      <div className="form-card confirmation-modal">
        <h2>Confirm Payment</h2>
        <div className="confirmation-details">
          <p>
            <strong>Amount:</strong> {formData.amount} {formData.currency}
          </p>
          <p>
            <strong>Provider:</strong> {formData.provider}
          </p>
          <p>
            <strong>Payee Name:</strong> {formData.payeeFullName}
          </p>
          <p>
            <strong>Payee Account:</strong> {formData.payeeAccountNumber}
          </p>
          <p>
            <strong>SWIFT Code:</strong> {formData.payeeSwiftCode}
          </p>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => setConfirmation(false)} className="btn-secondary">
            Back
          </button>
          <button onClick={handleConfirmPayment} disabled={loading} className="btn-primary">
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card">
      <h2>International Payment</h2>

      {success && <div className="alert-success">{success}</div>}
      {errors.submit && <div className="alert-error">{errors.submit}</div>}

      <form onSubmit={handleSubmit} className="secure-form">
        <div className="form-group">
          <label htmlFor="amount">Payment Amount *</label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g., 1000.00"
            className={errors.amount ? "input-error" : ""}
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency *</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={errors.currency ? "input-error" : ""}
            >
              <option value="">Select Currency</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
            {errors.currency && <span className="error-message">{errors.currency}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="provider">Provider *</label>
            <select id="provider" name="provider" value={formData.provider} onChange={handleChange}>
              <option value="SWIFT">SWIFT</option>
            </select>
          </div>
        </div>

        <hr className="form-divider" />
        <h3>Payee Information</h3>

        <div className="form-group">
          <label htmlFor="payeeFullName">Payee Full Name *</label>
          <input
            type="text"
            id="payeeFullName"
            name="payeeFullName"
            value={formData.payeeFullName}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            className={errors.payeeFullName ? "input-error" : ""}
          />
          {errors.payeeFullName && <span className="error-message">{errors.payeeFullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="payeeAccountNumber">Payee Account Number *</label>
          <input
            type="text"
            id="payeeAccountNumber"
            name="payeeAccountNumber"
            value={formData.payeeAccountNumber}
            onChange={handleChange}
            placeholder="e.g., ZA1234567890"
            className={errors.payeeAccountNumber ? "input-error" : ""}
          />
          {errors.payeeAccountNumber && <span className="error-message">{errors.payeeAccountNumber}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="payeeSwiftCode">SWIFT Code *</label>
          <input
            type="text"
            id="payeeSwiftCode"
            name="payeeSwiftCode"
            value={formData.payeeSwiftCode}
            onChange={handleChange}
            placeholder="e.g., SBZAZAJJ"
            className={errors.payeeSwiftCode ? "input-error" : ""}
          />
          {errors.payeeSwiftCode && <span className="error-message">{errors.payeeSwiftCode}</span>}
        </div>

        <button type="submit" className="btn-primary btn-large">
          Review Payment
        </button>
      </form>

      <p className="form-note">
        All fields marked with * are required. Your payment will be verified by our team before processing.
      </p>
    </div>
  )
}
