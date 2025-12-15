import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  durationSeconds: number;
  onTimeUp?: () => void;
  className?: string;
}

export function Timer({ durationSeconds, onTimeUp, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 30;

  return (
    <div
      className={cn(
        'timer-badge',
        isLow && 'animate-pulse-soft',
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <span>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
