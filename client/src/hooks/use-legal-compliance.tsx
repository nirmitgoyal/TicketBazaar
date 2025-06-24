import { useState, useEffect } from "react";

interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface LegalComplianceState {
  hasAccepted: boolean;
  consentSettings: ConsentSettings | null;
  consentDate: string | null;
  shouldShowModal: boolean;
}

export function useLegalCompliance() {
  const [state, setState] = useState<LegalComplianceState>({
    hasAccepted: false,
    consentSettings: null,
    consentDate: null,
    shouldShowModal: false
  });

  useEffect(() => {
    // Check if user has accepted legal compliance
    const hasAccepted = localStorage.getItem('ticketbazaar-legal-accepted') === 'true';
    const consentSettings = localStorage.getItem('ticketbazaar-consent-settings');
    const consentDate = localStorage.getItem('ticketbazaar-consent-date');

    setState({
      hasAccepted,
      consentSettings: consentSettings ? JSON.parse(consentSettings) : null,
      consentDate,
      shouldShowModal: !hasAccepted
    });
  }, []);

  const showModal = () => {
    setState(prev => ({ ...prev, shouldShowModal: true }));
  };

  const hideModal = () => {
    setState(prev => ({ ...prev, shouldShowModal: false }));
  };

  const acceptCompliance = (consentSettings: ConsentSettings) => {
    const now = new Date().toISOString();
    
    localStorage.setItem('ticketbazaar-legal-accepted', 'true');
    localStorage.setItem('ticketbazaar-consent-settings', JSON.stringify(consentSettings));
    localStorage.setItem('ticketbazaar-consent-date', now);

    setState({
      hasAccepted: true,
      consentSettings,
      consentDate: now,
      shouldShowModal: false
    });
  };

  const updateConsentSettings = (newSettings: ConsentSettings) => {
    const now = new Date().toISOString();
    
    localStorage.setItem('ticketbazaar-consent-settings', JSON.stringify(newSettings));
    localStorage.setItem('ticketbazaar-consent-date', now);

    setState(prev => ({
      ...prev,
      consentSettings: newSettings,
      consentDate: now
    }));
  };

  const resetCompliance = () => {
    localStorage.removeItem('ticketbazaar-legal-accepted');
    localStorage.removeItem('ticketbazaar-consent-settings');
    localStorage.removeItem('ticketbazaar-consent-date');

    setState({
      hasAccepted: false,
      consentSettings: null,
      consentDate: null,
      shouldShowModal: true
    });
  };

  return {
    ...state,
    showModal,
    hideModal,
    acceptCompliance,
    updateConsentSettings,
    resetCompliance
  };
}