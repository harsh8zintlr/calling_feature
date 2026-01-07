import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery } from '@tanstack/react-query';
import { getLiveCalls } from '@/services/callerDeskApi';
import { Button } from '@/components/ui/button';
import { Activity, Phone, RefreshCw, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export default function LiveCalls() {
  const { config } = useCallerDesk();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['liveCalls', config.authCode],
    queryFn: () => getLiveCalls(config.authCode),
    enabled: config.isConfigured,
    refetchInterval: 3000,
  });

  const liveCalls = data?.live_calls || [];
  const totalLiveCalls = parseInt(data?.total_live_calls || '0');

  return (
    <Layout title="Live Calls" subtitle="Monitor all active calls in real-time">
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Activity className="h-6 w-6 text-success" />
            </div>
            {totalLiveCalls > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-success"></span>
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Calls</p>
            <p className="text-3xl font-bold text-foreground">{totalLiveCalls}</p>
          </div>
        </div>

        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Live Calls Grid */}
      {liveCalls.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Activity className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Calls</h3>
          <p className="text-muted-foreground">
            When calls are active, they will appear here in real-time
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liveCalls.map((call, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-6 border-l-4 border-l-success animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                    <Phone className="h-6 w-6 text-success" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
                  {call.callstatus}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Caller</p>
                  <p className="text-lg font-semibold text-foreground">{call.msisdn}</p>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{call.member_name || 'Unknown Agent'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{call.deskphone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Started: {format(new Date(call.entrydate), 'hh:mm:ss a')}
                  </span>
                </div>

                {call.group_name && (
                  <div className="pt-2 border-t border-border">
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                      {call.group_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Wave Animation */}
              <div className="flex items-end justify-center gap-1 h-8 mt-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-success rounded-full audio-wave"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
