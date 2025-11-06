import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("accessToken")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  if (!token) {
    return <Navigate to="/login" />
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" />
  }

  return children
}
