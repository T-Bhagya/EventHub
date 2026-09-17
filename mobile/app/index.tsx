import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingIndicator } from '../components/LoadingIndicator';

export default function Index() {
  const { user, token, isLoading, role } = useAuth();

  if (isLoading) {
    return <LoadingIndicator message="Initializing EventHub..." fullScreen />;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'ORGANIZER') {
    return <Redirect href="/(organizer)/dashboard" />;
  }

  return <Redirect href="/(user)" />;
}
