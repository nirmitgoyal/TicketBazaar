/**
 * Unified Modal Component
 * Consolidates all modal functionality into a single, flexible component
 * Replaces: ai-verification-modal, contact-request-modal, seller-details-modal, 
 *           seller-profile-modal, ticket-detail-modal, verification-modal
 */

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export type ModalType = 
  | 'ticket-detail'
  | 'seller-profile'
  | 'seller-details'
  | 'contact-request'
  | 'ai-verification'
  | 'verification'
  | 'custom';

export interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
  // Data props for specific modal types
  data?: any;
  // Callbacks for specific modal actions
  onConfirm?: (data?: any) => void | Promise<void>;
  onCancel?: () => void;
  onSuccess?: (data?: any) => void;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]'
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  children,
  footer,
  data,
  onConfirm,
  onCancel,
  onSuccess
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Get modal content based on type
  const getModalContent = () => {
    switch (type) {
      case 'ticket-detail':
        return <TicketDetailContent data={data} onClose={onClose} />;
      
      case 'seller-profile':
        return <SellerProfileContent data={data} onClose={onClose} />;
      
      case 'contact-request':
        return <ContactRequestContent data={data} onConfirm={onConfirm} onCancel={onCancel || onClose} />;
      
      case 'ai-verification':
        return <AIVerificationContent data={data} onClose={onClose} />;
      
      case 'verification':
        return <VerificationContent data={data} onSuccess={onSuccess} onClose={onClose} />;
      
      case 'custom':
      default:
        return children;
    }
  };

  // Get default title based on type
  const getDefaultTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'ticket-detail': return 'Ticket Details';
      case 'seller-profile': return 'Seller Profile';
      case 'contact-request': return 'Contact Seller';
      case 'ai-verification': return 'AI Verification';
      case 'verification': return 'Verify Your Account';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          modalSizes[size],
          'max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {(title || type !== 'custom') && (
          <DialogHeader>
            <DialogTitle>{getDefaultTitle()}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={type}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {getModalContent()}
          </motion.div>
        </AnimatePresence>
        
        {footer && (
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Modal content components for each type

const TicketDetailContent: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
        {data.eventImageUrl ? (
          <img 
            src={data.eventImageUrl} 
            alt={data.eventTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image available
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">{data.eventTitle}</h3>
        <p className="text-gray-600 mb-4">{data.eventDescription}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Venue:</span> {data.venue}
          </div>
          <div>
            <span className="font-medium">Date:</span> {new Date(data.eventDate).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Category:</span> {data.category}
          </div>
          <div>
            <span className="font-medium">City:</span> {data.city}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button>Contact Seller</Button>
      </div>
    </div>
  );
};

const SellerProfileContent: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
          {data.fullName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{data.fullName}</h3>
          <p className="text-sm text-gray-600">Member since {new Date(data.createdAt || Date.now()).getFullYear()}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Trust Score:</span>
          <span className="font-medium">{data.trustScore || 0}/100</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Response Rate:</span>
          <span className="font-medium">{data.responseRate || 0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Verification Status:</span>
          <span className={cn(
            'font-medium',
            data.verificationStatus === 'verified' ? 'text-green-600' : 'text-gray-500'
          )}>
            {data.verificationStatus || 'Unverified'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const ContactRequestContent: React.FC<{ 
  data: any; 
  onConfirm?: (data?: any) => void;
  onCancel: () => void;
}> = ({ data, onConfirm, onCancel }) => {
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async () => {
    if (!message.trim() || !onConfirm) return;
    
    setLoading(true);
    try {
      await onConfirm({ message, ticketId: data?.ticketId });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Send a message to the seller about this ticket. They will receive your contact information.
      </p>
      
      <textarea
        className="w-full p-3 border rounded-lg resize-none h-32"
        placeholder="Hi, I'm interested in your ticket..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!message.trim() || loading}>
          {loading ? 'Sending...' : 'Send Request'}
        </Button>
      </div>
    </div>
  );
};

const AIVerificationContent: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">AI Verification Results</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Trust Score:</span>
            <span className="font-medium">{data.trustScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span>Risk Level:</span>
            <span className={cn(
              'font-medium',
              data.riskLevel === 'low' ? 'text-green-600' : 
              data.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            )}>
              {data.riskLevel}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Verified:</span>
            <span className="font-medium">{data.verified ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
      
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {data.recommendations.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const VerificationContent: React.FC<{ 
  data: any; 
  onSuccess?: (data?: any) => void;
  onClose: () => void;
}> = ({ data, onSuccess, onClose }) => {
  const [verificationCode, setVerificationCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const handleVerify = async () => {
    if (!verificationCode.trim() || !onSuccess) return;
    
    setLoading(true);
    try {
      await onSuccess({ code: verificationCode });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter the verification code sent to your {data?.method || 'email'}.
      </p>
      
      <input
        type="text"
        className="w-full p-3 border rounded-lg text-center text-lg tracking-wider"
        placeholder="000000"
        maxLength={6}
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
      />
      
      <div className="flex justify-between items-center">
        <button className="text-sm text-blue-600 hover:underline">
          Resend code
        </button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={verificationCode.length !== 6 || loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Export individual modal hooks for convenience
export const useModal = (type: ModalType) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  
  const open = (modalData?: any) => {
    setData(modalData);
    setIsOpen(true);
  };
  
  const close = () => {
    setIsOpen(false);
    setTimeout(() => setData(null), 300); // Clear data after animation
  };
  
  return { isOpen, data, open, close };
};