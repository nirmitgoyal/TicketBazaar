/**
 * Modern Login Page
 * 
 * This page demonstrates the new feature-driven architecture.
 */

import { LoginForm } from '../components/LoginForm';
import { AuthGuard } from '../components/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard requireGuest redirectTo="/">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to TicketBazaar
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              India's most trusted P2P ticket marketplace
            </p>
          </div>
          
          <LoginForm onSuccess={() => {
            // Handle successful login
            console.log('Login successful');
          }} />
        </div>
      </div>
    </AuthGuard>
  );
}