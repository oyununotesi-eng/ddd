import React, { useState } from 'react';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Code2 
} from 'lucide-react';
import { CodeSnippet } from '../../types';

interface NotificationsSectionProps {
  onInspectCode: (snippet: CodeSnippet) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({ onInspectCode }) => {
  const [alerts, setAlerts] = useState({
    info: true,
    success: true,
    warning: true,
    danger: true,
  });

  const dismissAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: false }));
  };

  const restoreAlerts = () => {
    setAlerts({
      info: true,
      success: true,
      warning: true,
      danger: true,
    });
  };

  const allDismissed = !alerts.info && !alerts.success && !alerts.warning && !alerts.danger;

  return (
    <section id="notifications-section" className="py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 pb-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
              Notifications & Alerts
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Contextual alerts with icons, rich dismiss controls, and subtle glow effects
            </p>
          </div>
          <button
            onClick={() => onInspectCode({
              title: "Now UI Alert Notification",
              category: "Feedback & Alerts",
              code: `// Success Alert Component
<div className="bg-[#18ce0f] text-white px-6 py-4 rounded-xl shadow-now-success flex items-center justify-between">
  <div className="flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 shrink-0" />
    <span className="text-xs font-bold uppercase tracking-wider">
      <b>SUCCESS</b> — Your account profile was updated successfully!
    </span>
  </div>
  <button onClick={onDismiss} className="p-1 hover:opacity-75">
    <X className="w-4 h-4" />
  </button>
</div>`
            })}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f96332] bg-white border border-orange-200 hover:bg-orange-50 rounded-full transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>View Snippet</span>
          </button>
        </div>

        {/* Alerts Stack */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Info Alert */}
          {alerts.info && (
            <div className="bg-[#2ca8ff] text-white px-6 py-4 rounded-2xl shadow-now-info flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3.5">
                <Info className="w-5 h-5 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="font-extrabold uppercase mr-1">INFO</span>
                  — This is a plain and clean alert message with custom icon and dismissible action.
                </p>
              </div>
              <button
                onClick={() => dismissAlert('info')}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white ml-2"
                aria-label="Dismiss info alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Alert */}
          {alerts.success && (
            <div className="bg-[#18ce0f] text-white px-6 py-4 rounded-2xl shadow-now-success flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="font-extrabold uppercase mr-1">SUCCESS</span>
                  — Yaaay! Everything went according to the plan and your changes have been deployed.
                </p>
              </div>
              <button
                onClick={() => dismissAlert('success')}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white ml-2"
                aria-label="Dismiss success alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Warning Alert */}
          {alerts.warning && (
            <div className="bg-[#ffb236] text-white px-6 py-4 rounded-2xl shadow-now-warning flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3.5">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="font-extrabold uppercase mr-1">WARNING</span>
                  — Hey, looks like you haven't confirmed your email address yet. Please check your inbox.
                </p>
              </div>
              <button
                onClick={() => dismissAlert('warning')}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white ml-2"
                aria-label="Dismiss warning alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Danger Alert */}
          {alerts.danger && (
            <div className="bg-[#ff3636] text-white px-6 py-4 rounded-2xl shadow-now-danger flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="font-extrabold uppercase mr-1">DANGER</span>
                  — Something bad happened! Unable to connect to the cloud storage endpoint.
                </p>
              </div>
              <button
                onClick={() => dismissAlert('danger')}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white ml-2"
                aria-label="Dismiss danger alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Restore Button */}
          {allDismissed && (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <p className="text-sm text-slate-500 mb-4">All alerts were dismissed.</p>
              <button
                onClick={restoreAlerts}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f96332] hover:bg-[#e04e20] rounded-full shadow-now-primary transition-all flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All Alerts</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
