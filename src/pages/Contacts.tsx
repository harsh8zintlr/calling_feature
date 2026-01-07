import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, addContact, deleteContact } from '@/services/callerDeskApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Contact, Phone, Mail, MapPin, RefreshCw, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Contacts() {
  const { config } = useCallerDesk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    contact_name: '',
    contact_num: '',
    contact_email: '',
    contact_address: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contacts', config.authCode, page],
    queryFn: () => getContacts(config.authCode, { current_page: page, per_page: 25 }),
    enabled: config.isConfigured,
  });

  const addMutation = useMutation({
    mutationFn: () => addContact(config.authCode, newContact),
    onSuccess: (data: any) => {
      if (data.type === 'success') {
        toast({ title: 'Success', description: 'Contact added successfully' });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        setIsAddDialogOpen(false);
        setNewContact({ contact_name: '', contact_num: '', contact_email: '', contact_address: '' });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contactNum: string) => deleteContact(config.authCode, contactNum),
    onSuccess: (data: any) => {
      if (data.type === 'success') {
        toast({ title: 'Success', description: 'Contact deleted successfully' });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    },
  });

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      '1': { label: 'Hot Lead', color: 'bg-destructive/20 text-destructive' },
      '2': { label: 'Warm Lead', color: 'bg-warning/20 text-warning' },
      '3': { label: 'Cold Lead', color: 'bg-blue-500/20 text-blue-400' },
      '4': { label: 'Invalid', color: 'bg-muted text-muted-foreground' },
      '5': { label: 'Disqualified', color: 'bg-destructive/20 text-destructive' },
      '6': { label: 'Prospect', color: 'bg-success/20 text-success' },
    };
    return statuses[status] || { label: 'Unknown', color: 'bg-muted text-muted-foreground' };
  };

  const filteredContacts =
    data?.result?.filter(
      (contact) =>
        contact.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_num?.includes(searchTerm) ||
        contact.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Layout title="Contacts" subtitle="Manage your contact database">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input
                    value={newContact.contact_name}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, contact_name: e.target.value }))
                    }
                    placeholder="Enter name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={newContact.contact_num}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, contact_num: e.target.value }))
                    }
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email (Optional)</Label>
                  <Input
                    value={newContact.contact_email}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, contact_email: e.target.value }))
                    }
                    placeholder="Enter email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Address (Optional)</Label>
                  <Input
                    value={newContact.contact_address}
                    onChange={(e) =>
                      setNewContact((prev) => ({ ...prev, contact_address: e.target.value }))
                    }
                    placeholder="Enter address"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Contact'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <p className="text-sm text-muted-foreground">Total Contacts</p>
        <p className="text-2xl font-bold text-foreground">{data?.total || 0}</p>
      </div>

      {/* Contacts Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Added</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading contacts...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => {
                const status = getStatusLabel(contact.contact_status);
                return (
                  <TableRow key={contact.contact_id} className="border-border hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Contact className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{contact.contact_name}</p>
                          {contact.contact_address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contact.contact_address}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.contact_num}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.contact_email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{contact.contact_email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(contact.contact_savedate), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/20"
                        onClick={() => deleteMutation.mutate(contact.contact_num)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.total > 25 && (
          <div className="flex items-center justify-between border-t border-border p-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(data.total / 25)}
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
