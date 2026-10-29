import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const SessionInactivityWatcher = () => {
  const { currentUser, platformSettings, expireSessionDueToInactivity } = useApp();
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(null);
  const lastActivityRef = useRef(null);

  const timeoutMinutes = platformSettings?.security?.sessionTimeoutMinutes || 30;

  // Refresh user activity timestamp
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    try {
      localStorage.setItem('stockmate_last_activity', String(Date.now()));
    } catch {
      // Ignore storage errors in restricted contexts
    }
    if (warningSecondsLeft !== null) {
      setWarningSecondsLeft(null);
    }
  }, [warningSecondsLeft]);

  // Support simulated test triggers from the Security tab
  useEffect(() => {
    const handleSimulatedTest = (e) => {
      const simulatedDurationMs = e.detail?.durationMs || 15000;
      lastActivityRef.current = Date.now() - ((timeoutMinutes * 60 * 1000) - simulatedDurationMs);
    };

    window.addEventListener('stockmate:test-inactivity-timeout', handleSimulatedTest);
    return () => {
      window.removeEventListener('stockmate:test-inactivity-timeout', handleSimulatedTest);
    };
  }, [timeoutMinutes]);

  useEffect(() => {
    if (!currentUser || timeoutMinutes <= 0) {
      return;
    }

    lastActivityRef.current = Date.now();

    const throttledEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    let lastThrottledTime = Date.now();

    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 3000) {
        lastThrottledTime = now;
        recordActivity();
      }
    };

    throttledEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    const checkInterval = setInterval(() => {
      const now = Date.now();
      const lastAct = lastActivityRef.current || now;
      const inactiveMs = now - lastAct;
      const totalAllowedMs = timeoutMinutes * 60 * 1000;
      const remainingMs = totalAllowedMs - inactiveMs;

      // 60-second warning threshold
      if (remainingMs <= 60000 && remainingMs > 0) {
        setWarningSecondsLeft(Math.ceil(remainingMs / 1000));
      } else if (remainingMs <= 0) {
        clearInterval(checkInterval);
        setWarningSecondsLeft(null);
        expireSessionDueToInactivity();
      } else {
        if (warningSecondsLeft !== null) {
          setWarningSecondsLeft(null);
        }
      }
    }, 1000);

    return () => {
      throttledEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      clearInterval(checkInterval);
    };
  }, [currentUser, timeoutMinutes, expireSessionDueToInactivity, recordActivity, warningSecondsLeft]);

  if (!currentUser || warningSecondsLeft === null) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-500/50 p-4 animate-bounce">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Clock className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 font-bold text-sm text-white">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Session Inactivity Notice</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Your session will expire in <strong className="text-amber-400 font-mono text-sm">{warningSecondsLeft}s</strong> due to platform security policy.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="brand"
              size="xs"
              onClick={recordActivity}
              className="w-full text-xs font-semibold"
            >
              Keep Session Active
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
