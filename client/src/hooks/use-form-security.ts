import { useState, useCallback } from 'react';
import { sanitizeUserInput } from '@/utils/xss-protection';

interface FormSecurityOptions {
  maxLength?: number;
  allowHtml?: boolean;
  preventSubmissionSpam?: boolean;
}

export function useFormSecurity(options: FormSecurityOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  
  const {
    maxLength = 1000,
    allowHtml = false,
    preventSubmissionSpam = true
  } = options;

  const sanitizeInput = useCallback((value: string): string => {
    if (typeof value !== 'string') return '';
    
    let sanitized = value.trim();
    
    if (!allowHtml) {
      sanitized = sanitizeUserInput(sanitized, maxLength);
    }
    
    // Additional client-side validation
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
    }
    
    return sanitized;
  }, [maxLength, allowHtml]);

  const validateSubmission = useCallback((): boolean => {
    if (!preventSubmissionSpam) return true;
    
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const minInterval = 1000; // 1 second minimum between submissions
    
    if (timeSinceLastSubmission < minInterval) {
      return false;
    }
    
    return true;
  }, [lastSubmissionTime, preventSubmissionSpam]);

  const handleSubmit = useCallback(async (
    submitFunction: () => Promise<void>
  ): Promise<void> => {
    if (isSubmitting || !validateSubmission()) {
      return;
    }
    
    setIsSubmitting(true);
    setLastSubmissionTime(Date.now());
    
    try {
      await submitFunction();
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateSubmission]);

  return {
    sanitizeInput,
    handleSubmit,
    isSubmitting,
    canSubmit: !isSubmitting && validateSubmission()
  };
}