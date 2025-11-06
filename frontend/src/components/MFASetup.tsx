"use client"

import { useState } from "react"
import apiClient from "../utils/api"
import "../styles/forms.css"

interface MFASetupProps {
  user: { id: string; mfaEnabled: boolean }
  onUpdate: () => void
}

export default function MFASetup({ user, onUpdate }: MFASetupProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [mfaToken, setMfaToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSetupMFA = async () => {
    setLoading(true)
    try {
      const response = await apiClient.post("/auth/mfa/setup")
      setQrCode(response.data.qrCode)
      setSecret(response.data.secret)
      setBackupCodes(response.data.backupCodes)
      setStep("verify")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to setup MFA")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyMFA = async () => {
    setLoading(true)
    try {
      await apiClient.post("/auth/mfa/verify", {
        secret,
        mfaToken,
        backupCodes,
      })
      setSuccess("MFA enabled successfully!")
      setStep("setup")
      setMfaToken("")
      onUpdate()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to verify MFA token")
    } finally {
      setLoading(false)
    }
  }

  const handleDisableMFA = async () => {
    if (!window.confirm("Are you sure? This will disable two-factor authentication.")) return

    setLoading(true)
    try {
      await apiClient.post("/auth/mfa/disable")
      setSuccess("MFA disabled successfully")
      onUpdate()
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to disable MFA")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-card">
      <h2>Two-Factor Authentication (2FA)</h2>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {!user.mfaEnabled ? (
        <>
          {step === "setup" ? (
            <>
              <p>Enhance your account security by enabling two-factor authentication.</p>
              <button onClick={handleSetupMFA} disabled={loading} className="btn-primary">
                {loading ? "Setting up..." : "Enable 2FA"}
              </button>
            </>
          ) : (
            <>
              <div className="mfa-setup">
                <h3>Scan QR Code</h3>
                {qrCode && <img src={qrCode || "/placeholder.svg"} alt="QR Code" className="qr-code" />}
                <p className="text-muted">Or manually enter this code: {secret}</p>

                <div className="form-group">
                  <label htmlFor="mfaToken">Enter 6-digit code from your authenticator:</label>
                  <input
                    type="text"
                    id="mfaToken"
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center"
                  />
                </div>

                <h4>Backup Codes</h4>
                <p>
                  Save these codes in a secure location. Each can be used once if you lose access to your authenticator.
                </p>
                <div className="backup-codes">
                  {backupCodes.map((code, idx) => (
                    <code key={idx}>{code}</code>
                  ))}
                </div>

                <div className="form-actions">
                  <button onClick={() => setStep("setup")} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={handleVerifyMFA} disabled={loading || mfaToken.length !== 6} className="btn-primary">
                    {loading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="security-status">
            <p className="status-enabled">✓ Two-factor authentication is enabled</p>
          </div>
          <button onClick={handleDisableMFA} disabled={loading} className="btn-danger">
            Disable 2FA
          </button>
        </>
      )}
    </div>
  )
}
