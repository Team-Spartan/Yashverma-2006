import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Droplets, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import './LoginForm.css';

export default function LoginForm({ onLoginSubmit, serverError, isLoading }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  // Email Validation Helper
  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address (e.g. user@village.org)';
    }
    return '';
  };

  // Password Validation Helper
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));

    // Clear error dynamically as user edits field
    if (errors[name]) {
      let fieldError = '';
      if (name === 'email') fieldError = validateEmail(val);
      if (name === 'password') fieldError = validatePassword(val);

      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  // Handle Field Blur (onBlur validation)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let fieldError = '';
    if (name === 'email') fieldError = validateEmail(value);
    if (name === 'password') fieldError = validatePassword(value);

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const emailErr = validateEmail(formData.email);
    const passwordErr = validatePassword(formData.password);

    setErrors({
      email: emailErr,
      password: passwordErr
    });

    setTouched({
      email: true,
      password: true
    });

    // If validation passes
    if (!emailErr && !passwordErr) {
      if (onLoginSubmit) {
        onLoginSubmit({
          email: formData.email.trim(),
          password: formData.password,
          rememberMe: formData.rememberMe
        });
      } else {
        // Fallback demo indicator if backend prop not yet attached
        setLocalSuccess(true);
        setTimeout(() => setLocalSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="login-container">
      {/* Decorative Glow Elements */}
      <div className="login-bg-decor login-bg-decor-1"></div>
      <div className="login-bg-decor login-bg-decor-2"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge">
            <Droplets size={16} color="#38bdf8" />
            <span>Jal Suraksha Portal</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to manage water quality logs, view analytics, and issue contamination alerts.
          </p>
        </div>

        {/* Global Server Error or Success Alerts */}
        {serverError && (
          <div className="form-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {localSuccess && (
          <div className="form-alert success" role="alert">
            <CheckCircle2 size={18} />
            <span>Credentials validated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="official@village.org"
                className={`form-input ${(touched.email || submitAttempted) && errors.email ? 'has-error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {(touched.email || submitAttempted) && errors.email && (
              <div className="error-message" id="email-error">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`form-input ${(touched.password || submitAttempted) && errors.password ? 'has-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {(touched.password || submitAttempted) && errors.password && (
              <div className="error-message" id="password-error">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Rural Water Quality Monitoring & Response Platform</p>
        </div>
      </div>
    </div>
  );
}
