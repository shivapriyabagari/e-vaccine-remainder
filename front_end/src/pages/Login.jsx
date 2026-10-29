import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/reminders" replace />;
  }

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegistering) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          notifications: { email: true, whatsapp: form.whatsapp },
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(location.state?.from || "/reminders", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container page-section">
      <div className="auth-card card border-0 shadow-sm mx-auto">
        <div className="card-body p-4 p-md-5">
          <span className="eyebrow">{isRegistering ? "GET STARTED" : "WELCOME BACK"}</span>
          <h1 className="h2 mt-2 mb-2">{isRegistering ? "Create your account" : "Sign in"}</h1>
          <p className="text-secondary mb-4">
            {isRegistering
              ? "Create a private space to manage your family’s vaccination reminders."
              : "Sign in to view your children and vaccination reminders."}
          </p>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="mb-3">
                <label htmlFor="accountName" className="form-label">Your name</label>
                <input
                  id="accountName"
                  name="name"
                  className="form-control"
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="accountEmail" className="form-label">Email</label>
              <input
                id="accountEmail"
                name="email"
                type="email"
                className="form-control"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="accountPassword" className="form-label">Password</label>
              <input
                id="accountPassword"
                name="password"
                type="password"
                className="form-control"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                minLength={isRegistering ? 8 : undefined}
                value={form.password}
                onChange={updateField}
                required
              />
              {isRegistering && (
                <div className="form-text">Use at least 8 characters.</div>
              )}
            </div>
            {isRegistering && (
              <>
                <div className="mb-3">
                  <label htmlFor="accountPhone" className="form-label">
                    Phone number <span className="text-secondary">(with country code)</span>
                  </label>
                  <input
                    id="accountPhone"
                    name="phone"
                    type="tel"
                    className="form-control"
                    placeholder="+14155552671"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={updateField}
                    required={form.whatsapp}
                  />
                </div>
                <div className="form-check mb-4">
                  <input
                    id="whatsappOptIn"
                    name="whatsapp"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.whatsapp}
                    onChange={updateField}
                  />
                  <label className="form-check-label" htmlFor="whatsappOptIn">
                    Send me vaccination reminders on WhatsApp
                  </label>
                  <div className="form-text">
                    WhatsApp reminders require a configured WhatsApp Business account.
                  </div>
                </div>
              </>
            )}
            <button className="btn btn-primary w-100 py-2" type="submit" disabled={submitting}>
              {submitting ? "Please wait…" : isRegistering ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-secondary mt-4 mb-0">
            {isRegistering ? "Already have an account?" : "New to E-Vaccine Reminder?"}{" "}
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => {
                setIsRegistering((current) => !current);
                setError("");
              }}
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="small text-center text-secondary mt-3 mb-0">
            <Link to="/about">How reminders work</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
