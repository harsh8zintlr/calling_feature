import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Key, Save, Trash2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function Settings() {
  const { config, setAuthCode, clearConfig } = useCallerDesk();
  const { toast } = useToast();
  const [authCodeInput, setAuthCodeInput] = useState(config.authCode);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    if (!authCodeInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your API auth code',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);

    try {
      // Test the API key by making a simple request
      const response = await fetch('https://app.callerdesk.io/api/profile_billing_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ authcode: authCodeInput }).toString(),
      });

      const data = await response.json();

      if (data.type === 'success') {
        setAuthCode(authCodeInput);
        toast({
          title: 'Connected Successfully',
          description: 'Your CallerDesk API is now configured',
        });
      } else {
        toast({
          title: 'Invalid API Key',
          description: data.message || 'Please check your auth code and try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to CallerDesk API. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearConfig();
    setAuthCodeInput('');
    toast({
      title: 'Configuration Cleared',
      description: 'Your API configuration has been removed',
    });
  };

  return (
    <Layout title="Settings" subtitle="Configure your CallerDesk API connection">
      <div className="max-w-2xl">
        {/* Connection Status */}
        <div className={`glass-card rounded-xl p-6 mb-6 border-l-4 ${config.isConfigured ? 'border-l-success' : 'border-l-warning'}`}>
          <div className="flex items-center gap-4">
            {config.isConfigured ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Connected</h3>
                  <p className="text-sm text-muted-foreground">Your CallerDesk API is configured and active</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Not Connected</h3>
                  <p className="text-sm text-muted-foreground">Enter your API auth code to get started</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* API Configuration */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
              <p className="text-sm text-muted-foreground">Enter your CallerDesk auth code</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="authCode">Auth Code</Label>
              <Input
                id="authCode"
                type="password"
                value={authCodeInput}
                onChange={(e) => setAuthCodeInput(e.target.value)}
                placeholder="Enter your CallerDesk auth code"
                className="mt-1 bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can find your auth code in the CallerDesk dashboard under API & Integration settings
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isTesting}
                className="gradient-primary text-primary-foreground"
              >
                {isTesting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Testing...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>

              {config.isConfigured && (
                <Button variant="outline" onClick={handleClear} className="text-destructive hover:bg-destructive/20">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="glass-card rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Getting Your Auth Code</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs shrink-0">1</span>
              Log in to your CallerDesk dashboard at app.callerdesk.io
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs shrink-0">2</span>
              Navigate to Settings → API & Integration
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs shrink-0">3</span>
              Copy your API Key (auth code) from the integration settings
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs shrink-0">4</span>
              Paste it in the field above and save
            </li>
          </ol>
          
          <Button variant="outline" className="mt-4" asChild>
            <a href="https://app.callerdesk.io" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open CallerDesk Dashboard
            </a>
          </Button>
        </div>

        {/* API Documentation */}
        <div className="glass-card rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Documentation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This application uses the CallerDesk API to provide call management features including:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Call Logs & Reports
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Live Call Monitoring
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Click-to-Call
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Team Management
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Call Groups
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Contact Management
            </li>
          </ul>
          
          <Button variant="outline" className="mt-4" asChild>
            <a href="https://api.callerdesk.io" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View API Documentation
            </a>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
