import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIVRNumbers, initiateCall } from '@/services/callerDeskApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Phone, PhoneCall, PhoneOutgoing, Delete } from 'lucide-react';

export default function ClickToCall() {
  const { config } = useCallerDesk();
  const { toast } = useToast();
  const [agentNumber, setAgentNumber] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [deskphone, setDeskphone] = useState('');

  const { data: ivrNumbers } = useQuery({
    queryKey: ['ivrNumbers', config.authCode],
    queryFn: () => getIVRNumbers(config.authCode),
    enabled: config.isConfigured,
  });

  const callMutation = useMutation({
    mutationFn: () =>
      initiateCall(config.authCode, {
        calling_party_a: agentNumber,
        calling_party_b: customerNumber,
        deskphone,
      }),
    onSuccess: (data) => {
      if (data.type === 'success') {
        toast({
          title: 'Call Initiated',
          description: data.message || 'Call is being connected...',
        });
      } else {
        toast({
          title: 'Call Failed',
          description: data.message || 'Failed to initiate call',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to initiate call. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDial = (digit: string) => {
    setCustomerNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setCustomerNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!agentNumber || !customerNumber || !deskphone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    callMutation.mutate();
  };

  const dialPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <Layout title="Click to Call" subtitle="Initiate outbound calls">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-8">
          {/* Call Info */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div>
              <Label className="text-muted-foreground mb-2 block">Agent Number (Party A)</Label>
              <Input
                placeholder="Enter agent number"
                value={agentNumber}
                onChange={(e) => setAgentNumber(e.target.value)}
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This number will receive the call first
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground mb-2 block">Deskphone / IVR</Label>
              <Select value={deskphone} onValueChange={setDeskphone}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select deskphone" />
                </SelectTrigger>
                <SelectContent>
                  {ivrNumbers?.getdeskphone?.map((ivr) => (
                    <SelectItem key={ivr.did_id} value={ivr.deskphone}>
                      {ivr.deskphone} ({ivr.did_num})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dial Pad */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PhoneOutgoing className="h-5 w-5 text-primary" />
              <Label className="text-muted-foreground">Customer Number (Party B)</Label>
            </div>
            <Input
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              className="text-center text-3xl font-mono h-16 bg-secondary/30 border-2 border-primary/20 focus:border-primary"
              placeholder="Enter number"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-8">
            {dialPad.map((digit) => (
              <Button
                key={digit}
                variant="outline"
                className="h-14 text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => handleDial(digit)}
              >
                {digit}
              </Button>
            ))}
          </div>

          {/* Call Actions */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleBackspace}
            >
              <Delete className="h-5 w-5" />
            </Button>

            <Button
              className="h-16 w-16 rounded-full gradient-primary text-primary-foreground"
              onClick={handleCall}
              disabled={callMutation.isPending}
            >
              {callMutation.isPending ? (
                <Phone className="h-7 w-7 animate-pulse" />
              ) : (
                <Phone className="h-7 w-7" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full opacity-0 pointer-events-none"
            >
              <Delete className="h-5 w-5" />
            </Button>
          </div>

          {callMutation.isPending && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-primary">
                <PhoneCall className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">Connecting call...</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-foreground mb-3">How Click-to-Call Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">1</span>
              Enter your agent number (Party A) - This number receives the call first
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">2</span>
              Select the deskphone/IVR number to be used as the caller ID
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">3</span>
              Enter the customer number (Party B) - Connected once agent picks up
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">4</span>
              Click the call button to initiate the connection
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
