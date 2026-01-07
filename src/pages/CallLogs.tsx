import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery } from '@tanstack/react-query';
import { getCallLogs } from '@/services/callerDeskApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function CallLogs() {
  const { config } = useCallerDesk();
  const [page, setPage] = useState(1);
  const [callType, setCallType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['callLogs', config.authCode, page, callType],
    queryFn: () =>
      getCallLogs(config.authCode, {
        current_page: page,
        per_page: 25,
        ...(callType !== 'all' && { Flow_type: callType }),
      }),
    enabled: config.isConfigured,
  });

  const handlePlayRecording = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setPlayingAudio(null);
      audioRef.current = audio;
      setPlayingAudio(url);
    }
  };

  const filteredCalls =
    data?.result?.filter(
      (call) =>
        call.caller_num.includes(searchTerm) ||
        call.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.caller_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Layout title="Call Logs" subtitle="View and manage all call records">
      {/* Filters */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by number or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>

          <Select value={callType} onValueChange={setCallType}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Call Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calls</SelectItem>
              <SelectItem value="IVR">Incoming</SelectItem>
              <SelectItem value="WEBOBD">Outgoing</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Calls</p>
          <p className="text-2xl font-bold text-foreground">{data?.total || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Answered</p>
          <p className="text-2xl font-bold text-success">{data?.answered_total || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Missed</p>
          <p className="text-2xl font-bold text-destructive">{data?.noanswer_total || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Voicemail</p>
          <p className="text-2xl font-bold text-warning">{data?.voicemail || 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Caller</TableHead>
              <TableHead className="text-muted-foreground">Agent</TableHead>
              <TableHead className="text-muted-foreground">Date & Time</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Recording</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading call logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No call records found
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => (
                <TableRow key={call.id} className="border-border hover:bg-secondary/30">
                  <TableCell>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        call.Flow_type === 'IVR' ? 'bg-call-incoming/20' : 'bg-call-outgoing/20'
                      }`}
                    >
                      {call.Flow_type === 'IVR' ? (
                        <PhoneIncoming className="h-4 w-4 text-call-incoming" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-call-outgoing" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{call.caller_num}</p>
                      {call.caller_name && (
                        <p className="text-sm text-muted-foreground">{call.caller_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{call.member_name || '-'}</p>
                    <p className="text-xs text-muted-foreground">{call.group_name || 'No group'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">
                      {format(new Date(call.startdatetime), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(call.startdatetime), 'hh:mm a')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-foreground">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {call.talk_duration}s
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        call.callstatus === 'ANSWER'
                          ? 'bg-success/20 text-success'
                          : call.callstatus === 'NOANSWER'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {call.callstatus === 'ANSWER'
                        ? 'Answered'
                        : call.callstatus === 'NOANSWER'
                        ? 'Missed'
                        : call.callstatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {call.file ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePlayRecording(call.file)}
                        >
                          {playingAudio === call.file ? (
                            <Pause className="h-4 w-4 text-primary" />
                          ) : (
                            <Play className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={call.file} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 text-muted-foreground" />
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.total > 25 && (
          <div className="flex items-center justify-between border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              Page {data.current_page} of {Math.ceil(data.total / 25)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 25)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
