import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const OnlineStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className={cn(
      "flex items-center text-xs font-medium px-2.5 py-1 rounded-full",
      isOnline ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
    )}>
      {isOnline ? <Wifi size={14} className="mr-1.5" /> : <WifiOff size={14} className="mr-1.5" />}
      {isOnline ? 'En ligne' : 'Hors ligne'}
    </div>
  );
};

export default OnlineStatusIndicator;
