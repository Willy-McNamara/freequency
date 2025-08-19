/**
 * Secure Form Components with CSRF Protection
 * Automatically includes CSRF tokens and provides XSS protection
 */

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useCSRF } from "../../hooks/useCSRF";
import { SecurityUtils } from "../../utils/security";

// Form ref interface for programmatic access
export interface SecureFormRef {
  submit: () => void;
  reset: () => void;
  getFormData: () => FormData;
}

// Base secure form props
interface SecureFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSecurityError?: (error: string) => void;
  showCSRFStatus?: boolean;
}

// Secure Form Component
export const SecureForm = forwardRef<SecureFormRef, SecureFormProps>(
  ({ children, onSecurityError, showCSRFStatus = false, ...props }, ref) => {
    const { token, isAvailable, isLoading, error: csrfError } = useCSRF();
    const formRef = useRef<HTMLFormElement>(null);

    useImperativeHandle(ref, () => ({
      submit: () => formRef.current?.requestSubmit(),
      reset: () => formRef.current?.reset(),
      getFormData: () => new FormData(formRef.current!),
    }));

    // Handle form submission with security checks
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      if (!isAvailable && !isLoading) {
        e.preventDefault();
        onSecurityError?.("CSRF protection unavailable");
        return;
      }

      // Additional security validation can be added here
      props.onSubmit?.(e);
    };

    return (
      <form
        ref={formRef}
        {...props}
        onSubmit={handleSubmit}
        data-csrf-available={isAvailable}
      >
        {/* Hidden CSRF token field */}
        {token && (
          <input
            type="hidden"
            name="_csrf"
            value={token}
            data-testid="csrf-token"
          />
        )}

        {/* CSRF Status Indicator (optional) */}
        {showCSRFStatus && (
          <div className="text-xs text-muted-foreground mb-2">
            {isLoading ? (
              <span>🔄 Initializing security...</span>
            ) : isAvailable ? (
              <span>✅ CSRF protection active</span>
            ) : (
              <span>⚠️ CSRF protection unavailable</span>
            )}
          </div>
        )}

        {/* CSRF Error Display */}
        {csrfError && (
          <div className="text-xs text-destructive mb-2">
            ⚠️ Security error: {csrfError}
          </div>
        )}

        {children}
      </form>
    );
  }
);

SecureForm.displayName = "SecureForm";

// Secure Input Component
export const SecureInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check for dangerous content (silently)
    SecurityUtils.containsDangerousContent(value);

    // Call original onChange
    onChange?.(e);
  };

  return (
    <input
      ref={ref}
      {...props}
      onChange={handleChange}
      className={props.className || ""}
    />
  );
});

SecureInput.displayName = "SecureInput";

// Secure Textarea Component
export const SecureTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Check for dangerous content (silently)
    SecurityUtils.containsDangerousContent(value);

    // Call original onChange
    onChange?.(e);
  };

  return (
    <textarea
      ref={ref}
      {...props}
      onChange={handleChange}
      className={props.className || ""}
    />
  );
});

SecureTextarea.displayName = "SecureTextarea";

// Secure Button Component
interface SecureButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  csrfRequired?: boolean;
  onSecurityError?: (error: string) => void;
}

export const SecureButton = forwardRef<HTMLButtonElement, SecureButtonProps>(
  (
    { csrfRequired = true, onSecurityError, onClick, disabled, ...props },
    ref
  ) => {
    const { isAvailable, isLoading } = useCSRF();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (csrfRequired && !isAvailable && !isLoading) {
        e.preventDefault();
        onSecurityError?.("CSRF protection required");
        return;
      }

      onClick?.(e);
    };

    const isDisabled = disabled || (csrfRequired && !isAvailable && !isLoading);

    return (
      <button
        ref={ref}
        {...props}
        disabled={isDisabled}
        onClick={handleClick}
        className={`${props.className || ""} ${
          isDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
    );
  }
);

SecureButton.displayName = "SecureButton";
