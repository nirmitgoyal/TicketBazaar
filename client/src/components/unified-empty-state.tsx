/**
 * Unified Empty State Component
 * Consolidates all empty state functionality into a single, flexible component
 * Replaces: animated-empty-state.tsx, floating-elements.tsx, 
 *           interactive-empty-states.tsx, playful-icons.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Package, Calendar, Users, Ticket, 
  MapPin, ShoppingBag, FileText, Zap, Heart,
  TrendingUp, AlertCircle, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmptyStateType = 
  | 'no-results'
  | 'no-tickets'
  | 'no-events'
  | 'no-favorites'
  | 'no-notifications'
  | 'error'
  | 'custom';

export type EmptyStateStyle = 
  | 'simple'
  | 'animated'
  | 'playful'
  | 'interactive';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface UnifiedEmptyStateProps {
  type?: EmptyStateType;
  style?: EmptyStateStyle;
  title?: string;
  description?: string;
  icon?: React.ElementType;
  iconColor?: string;
  actions?: EmptyStateAction[];
  className?: string;
  children?: React.ReactNode;
}

const defaultConfigs: Record<EmptyStateType, {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}> = {
  'no-results': {
    title: 'No results found',
    description: 'Try adjusting your filters or search terms',
    icon: Search,
    iconColor: 'text-gray-400'
  },
  'no-tickets': {
    title: 'No tickets available',
    description: 'Check back later for new listings',
    icon: Ticket,
    iconColor: 'text-blue-400'
  },
  'no-events': {
    title: 'No events found',
    description: 'New events are added regularly',
    icon: Calendar,
    iconColor: 'text-purple-400'
  },
  'no-favorites': {
    title: 'No favorites yet',
    description: 'Save your favorite tickets to view them here',
    icon: Heart,
    iconColor: 'text-red-400'
  },
  'no-notifications': {
    title: 'No notifications',
    description: "You're all caught up!",
    icon: Inbox,
    iconColor: 'text-green-400'
  },
  'error': {
    title: 'Something went wrong',
    description: 'Please try again later',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  'custom': {
    title: '',
    description: '',
    icon: Package,
    iconColor: 'text-gray-400'
  }
};

export const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  type = 'custom',
  style = 'simple',
  title,
  description,
  icon,
  iconColor,
  actions = [],
  className,
  children
}) => {
  const config = defaultConfigs[type];
  const Icon = icon || config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIconColor = iconColor || config.iconColor;

  switch (style) {
    case 'simple':
      return (
        <SimpleEmptyState
          title={finalTitle}
          description={finalDescription}
          icon={Icon}
          iconColor={finalIconColor}
          actions={actions}
          className={className}
        >
          {children}
        </SimpleEmptyState>
      );
    
    case 'animated':
      return (
        <AnimatedEmptyState
          title={finalTitle}
          description={finalDescription}
          icon={Icon}
          iconColor={finalIconColor}
          actions={actions}
          className={className}
        >
          {children}
        </AnimatedEmptyState>
      );
    
    case 'playful':
      return (
        <PlayfulEmptyState
          title={finalTitle}
          description={finalDescription}
          icon={Icon}
          iconColor={finalIconColor}
          actions={actions}
          className={className}
          type={type}
        >
          {children}
        </PlayfulEmptyState>
      );
    
    case 'interactive':
      return (
        <InteractiveEmptyState
          title={finalTitle}
          description={finalDescription}
          icon={Icon}
          iconColor={finalIconColor}
          actions={actions}
          className={className}
        >
          {children}
        </InteractiveEmptyState>
      );
    
    default:
      return null;
  }
};

// Style implementations

const SimpleEmptyState: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  actions: EmptyStateAction[];
  className?: string;
  children?: React.ReactNode;
}> = ({ title, description, icon: Icon, iconColor, actions, className, children }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <Icon className={cn('w-16 h-16 mb-4', iconColor)} />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {children}
      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const AnimatedEmptyState: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  actions: EmptyStateAction[];
  className?: string;
  children?: React.ReactNode;
}> = ({ title, description, icon: Icon, iconColor, actions, className, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        <Icon className={cn('w-16 h-16 mb-4', iconColor)} />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        {description}
      </motion.p>
      {children}
      {actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const PlayfulEmptyState: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  actions: EmptyStateAction[];
  className?: string;
  type: EmptyStateType;
  children?: React.ReactNode;
}> = ({ title, description, icon: Icon, iconColor, actions, className, type, children }) => {
  const floatingElements = getFloatingElements(type);
  
  return (
    <div className={cn('relative flex flex-col items-center justify-center py-12 px-4 text-center overflow-hidden', className)}>
      {/* Floating background elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10"
          initial={element.initial}
          animate={element.animate}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.2
          }}
        >
          <element.icon className={cn('w-8 h-8', element.color)} />
        </motion.div>
      ))}
      
      {/* Main content */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Icon className={cn('w-20 h-20 mb-4', iconColor)} />
      </motion.div>
      <h3 className="text-xl font-bold mb-2 relative z-10">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md relative z-10">{description}</p>
      {children}
      {actions.length > 0 && (
        <div className="flex gap-3 relative z-10">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const InteractiveEmptyState: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  actions: EmptyStateAction[];
  className?: string;
  children?: React.ReactNode;
}> = ({ title, description, icon: Icon, iconColor, actions, className, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.2 : 1,
          rotate: isHovered ? 180 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <Icon className={cn('w-16 h-16 mb-4 transition-colors', isHovered ? 'text-blue-500' : iconColor)} />
      </motion.div>
      <motion.h3
        className="text-lg font-semibold mb-2"
        animate={{ color: isHovered ? '#3B82F6' : '#000000' }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-gray-600 mb-6 max-w-md"
        animate={{ opacity: isHovered ? 0.8 : 1 }}
      >
        {description}
      </motion.p>
      {children}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0.7, y: isHovered ? 0 : 10 }}
        className="flex gap-3"
      >
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </motion.div>
    </motion.div>
  );
};

// Helper functions

function getFloatingElements(type: EmptyStateType) {
  const elements = {
    'no-tickets': [
      { icon: Ticket, color: 'text-blue-300', initial: { x: -100, y: -50 }, animate: { x: -80, y: -30 }, duration: 3 },
      { icon: MapPin, color: 'text-red-300', initial: { x: 100, y: 50 }, animate: { x: 120, y: 70 }, duration: 4 },
      { icon: Calendar, color: 'text-purple-300', initial: { x: -50, y: 100 }, animate: { x: -30, y: 120 }, duration: 3.5 }
    ],
    'no-events': [
      { icon: Calendar, color: 'text-purple-300', initial: { x: -120, y: -60 }, animate: { x: -100, y: -40 }, duration: 4 },
      { icon: Users, color: 'text-green-300', initial: { x: 120, y: 60 }, animate: { x: 100, y: 40 }, duration: 3.5 },
      { icon: Zap, color: 'text-yellow-300', initial: { x: 0, y: -100 }, animate: { x: 20, y: -80 }, duration: 3 }
    ],
    'no-results': [
      { icon: Search, color: 'text-gray-300', initial: { x: -80, y: -80 }, animate: { x: -60, y: -60 }, duration: 3 },
      { icon: FileText, color: 'text-blue-300', initial: { x: 80, y: 80 }, animate: { x: 60, y: 60 }, duration: 4 }
    ]
  };
  
  return elements[type] || [];
}

// Preset empty states for common scenarios

export const NoTicketsEmptyState: React.FC<{
  onBrowseEvents?: () => void;
  onCreateAlert?: () => void;
}> = ({ onBrowseEvents, onCreateAlert }) => {
  const actions: EmptyStateAction[] = [];
  
  if (onBrowseEvents) {
    actions.push({ label: 'Browse Events', onClick: onBrowseEvents });
  }
  if (onCreateAlert) {
    actions.push({ label: 'Create Alert', onClick: onCreateAlert, variant: 'outline' });
  }
  
  return <UnifiedEmptyState type="no-tickets" style="animated" actions={actions} />;
};

export const NoSearchResultsEmptyState: React.FC<{
  onClearFilters?: () => void;
  onViewAll?: () => void;
}> = ({ onClearFilters, onViewAll }) => {
  const actions: EmptyStateAction[] = [];
  
  if (onClearFilters) {
    actions.push({ label: 'Clear Filters', onClick: onClearFilters, variant: 'outline' });
  }
  if (onViewAll) {
    actions.push({ label: 'View All', onClick: onViewAll });
  }
  
  return <UnifiedEmptyState type="no-results" style="simple" actions={actions} />;
};

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => {
  const actions: EmptyStateAction[] = [];
  
  if (onRetry) {
    actions.push({ label: 'Try Again', onClick: onRetry });
  }
  
  return <UnifiedEmptyState type="error" style="simple" actions={actions} />;
};