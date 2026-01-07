import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCallerDesk } from '@/contexts/CallerDeskContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemberList, addMember, deleteMember, updateMember } from '@/services/callerDeskApi';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, User, Phone, Mail, Shield, RefreshCw, Search } from 'lucide-react';

export default function Members() {
  const { config } = useCallerDesk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    member_name: '',
    member_num: '',
    access: '2',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['members', config.authCode],
    queryFn: () => getMemberList(config.authCode),
    enabled: config.isConfigured,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      addMember(config.authCode, {
        member_name: newMember.member_name,
        member_num: newMember.member_num,
        access: parseInt(newMember.access),
      }),
    onSuccess: (data: any) => {
      if (data.type === 'success') {
        toast({ title: 'Success', description: 'Member added successfully' });
        queryClient.invalidateQueries({ queryKey: ['members'] });
        setIsAddDialogOpen(false);
        setNewMember({ member_name: '', member_num: '', access: '2' });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId: string) => deleteMember(config.authCode, memberId),
    onSuccess: (data: any) => {
      if (data.type === 'success') {
        toast({ title: 'Success', description: 'Member deleted successfully' });
        queryClient.invalidateQueries({ queryKey: ['members'] });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    },
  });

  const filteredMembers =
    data?.getmember?.filter(
      (member) =>
        member.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_num?.includes(searchTerm) ||
        member.member_email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <Layout title="Team Members" subtitle="Manage your call center agents">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
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
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Member Name</Label>
                  <Input
                    value={newMember.member_name}
                    onChange={(e) =>
                      setNewMember((prev) => ({ ...prev, member_name: e.target.value }))
                    }
                    placeholder="Enter name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={newMember.member_num}
                    onChange={(e) =>
                      setNewMember((prev) => ({ ...prev, member_num: e.target.value }))
                    }
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Access Level</Label>
                  <Select
                    value={newMember.access}
                    onValueChange={(value) => setNewMember((prev) => ({ ...prev, access: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Admin</SelectItem>
                      <SelectItem value="2">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-foreground">{data?.total_record || 0}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-success">
            {data?.getmember?.filter((m) => m.status === '1').length || 0}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {data?.getmember?.filter((m) => m.status !== '1').length || 0}
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Member</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading members...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.member_id} className="border-border hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.member_name}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.member_id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{member.member_num}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{member.member_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          member.access === '1'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {member.access === '1' ? 'Admin' : 'Regular'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        member.status === '1'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {member.status === '1' ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/20"
                        onClick={() => deleteMutation.mutate(member.member_id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
