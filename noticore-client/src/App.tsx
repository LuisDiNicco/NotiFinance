import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Toaster, toast } from 'sonner';

function App() {
  // UseEffect local maneja Socket.io
  const [userId, setUserId] = useState<string>('test-user-123');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Connect to the NestJS Gateway running on 3000
    const newSocket = io('http://localhost:3000');


    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join', userId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new_notification', (data: any) => {
      toast.success(data.subject, {
        description: data.body,
        action: {
          label: 'View',
          onClick: () => console.log('Viewed trace:', data.correlationId)
        },
      });
    });

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 w-full">
      <Toaster theme="dark" position="bottom-right" />

      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            NotiCore
          </h1>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-sm text-slate-400">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Simulated User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-400 leading-relaxed">
              This client mimics a mobile or web app frontend. When the NestJS backend compiles an In-App notification template, it will push it through WebSockets in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
