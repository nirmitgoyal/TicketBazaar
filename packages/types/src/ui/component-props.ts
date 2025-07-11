/**
 * React component prop types
 */

import { ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface AsyncComponentProps extends BaseComponentProps {
  loading?: boolean;
  error?: Error | null;
  retry?: () => void;
}