import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiment } from '@/contexts/ExperimentContext';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { participant, checkSessionExpiration, updateParticipantStatus, isSessionExpired } = useExperiment();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check if we have an active participant
    if (!participant || participant.status !== 'in_progress') return;

    // Check immediately on mount
    if (checkSessionExpiration()) {
      updateParticipantStatus('expired');
      navigate('/experiment/expired');
      return;
    }

    // Check every 30 seconds
    const interval = setInterval(() => {
      if (checkSessionExpiration()) {
        updateParticipantStatus('expired');
        clearInterval(interval);
        navigate('/experiment/expired');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [participant, checkSessionExpiration, updateParticipantStatus, navigate]);

  // If session is expired, don't render children
  if (isSessionExpired) {
    return null;
  }

  return <>{children}</>;
}
