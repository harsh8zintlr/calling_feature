import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Users, Wallet } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery } from '@tanstack/react-query';
import { getCallLogs, getMemberList, getProfileBalance, getLiveCalls } from '@/services/callerDeskApi';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  const { config } = useCallerDesk();
  const navigate = useNavigate();

  const { data: callLogs } = useQuery({
    queryKey: ['callLogs', config.authCode],
    queryFn: () => getCallLogs(config.authCode),
    enabled: config.isConfigured,
    refetchInterval: 30000,
  });

  const { data: members } = useQuery({
    queryKey: ['members', config.authCode],
    queryFn: () => getMemberList(config.authCode),
    enabled: config.isConfigured,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', config.authCode],
    queryFn: () => getProfileBalance(config.authCode),
    enabled: config.isConfigured,
  });

  const { data: liveCalls } = useQuery({
    queryKey: ['liveCalls', config.authCode],
    queryFn: () => getLiveCalls(config.authCode),
    enabled: config.isConfigured,
    refetchInterval: 5000,
  });

  if (!config.isConfigured) {
    return (
      <Layout title="Dashboard" subtitle="Configure your CallerDesk API to get started">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="glass-card rounded-2xl p-12 text-center max-w-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary mb-6">
              <Phone className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to CallerDesk</h2>
            <p className="text-muted-foreground mb-6">
              Connect your CallerDesk account to start managing calls, team members, and more.
            </p>
            <Button onClick={() => navigate('/settings')} className="gradient-primary text-primary-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Configure API
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalCalls = callLogs?.total || 0;
  const answeredCalls = parseInt(callLogs?.answered_total || '0');
  const missedCalls = parseInt(callLogs?.noanswer_total || '0');
  const totalMembers = members?.total_record || 0;
  const balance = profile?.balance || '0';
  const liveCallsCount = parseInt(liveCalls?.total_live_calls || '0');

  const recentCalls = callLogs?.result?.slice(0, 5) || [];

  return (
    <Layout title="Dashboard" subtitle="Overview of your call center performance">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <StatCard
          title="Total Calls"
          value={totalCalls.toLocaleString()}
          change="All time"
          icon={Phone}
          iconColor="text-primary"
        />
        <StatCard
          title="Answered"
          value={answeredCalls.toLocaleString()}
          change={`${totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0}% rate`}
          changeType="positive"
          icon={PhoneIncoming}
          iconColor="text-success"
        />
        <StatCard
          title="Missed"
          value={missedCalls.toLocaleString()}
          change={`${totalCalls > 0 ? Math.round((missedCalls / totalCalls) * 100) : 0}% rate`}
          changeType="negative"
          icon={PhoneMissed}
          iconColor="text-destructive"
        />
        <StatCard
          title="Live Calls"
          value={liveCallsCount}
          change="Active now"
          changeType="positive"
          icon={Activity}
          iconColor="text-warning"
        />
        <StatCard
          title="Team Members"
          value={totalMembers}
          change="Active agents"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Balance"
          value={`₹${balance}`}
          change="Credits available"
          icon={Wallet}
          iconColor="text-success"
        />
      </div>

      {/* Recent Calls & Live Calls */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Calls */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Calls</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/calls')}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentCalls.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent calls</p>
            ) : (
              recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        call.Flow_type === 'IVR' ? 'bg-call-incoming/20' : 'bg-call-outgoing/20'
                      }`}
                    >
                      {call.Flow_type === 'IVR' ? (
                        <PhoneIncoming className="h-5 w-5 text-call-incoming" />
                      ) : (
                        <PhoneOutgoing className="h-5 w-5 text-call-outgoing" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {call.caller_name || call.caller_num}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {call.member_name || 'Unknown Agent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        call.callstatus === 'ANSWER'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {call.callstatus === 'ANSWER' ? 'Answered' : 'Missed'}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {call.talk_duration}s
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Calls */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Live Calls</h2>
              {liveCallsCount > 0 && (
                <span className="flex h-3 w-3 call-pulse">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/live')}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {liveCallsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No active calls at the moment</p>
              </div>
            ) : (
              liveCalls?.live_calls?.slice(0, 5).map((call, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-success/5 border border-success/20 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                        <Phone className="h-5 w-5 text-success" />
                      </div>
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-success"></span>
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{call.msisdn}</p>
                      <p className="text-sm text-muted-foreground">{call.member_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success">
                      {call.callstatus}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{call.group_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
