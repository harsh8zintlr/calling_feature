import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCallerDesk } from "@/contexts/CallerDeskContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCallGroups,
  createCallGroup,
  updateCallGroup,
  deleteCallGroup,
  getIVRNumbers,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
  getMemberList,
} from "@/services/callerDeskApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Users,
  Phone,
  Settings,
  RefreshCw,
  Search,
  Edit,
  X,
  AlertCircle,
} from "lucide-react";

export default function CallGroups() {
  const { config } = useCallerDesk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [newGroup, setNewGroup] = useState({
    group_name: "",
    deskphone_id: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["callGroups", config.authCode],
    queryFn: () => getCallGroups(config.authCode),
    enabled: config.isConfigured,
  });

  const { data: ivrNumbers } = useQuery({
    queryKey: ["ivrNumbers", config.authCode],
    queryFn: () => getIVRNumbers(config.authCode),
    enabled: config.isConfigured,
  });

  const { data: allMembers } = useQuery({
    queryKey: ["allMembers", config.authCode],
    queryFn: () => getMemberList(config.authCode),
    enabled: config.isConfigured,
  });

  const { data: groupMembers, isLoading: groupMembersLoading } = useQuery({
    queryKey: ["groupMembers", selectedGroupId, config.authCode],
    queryFn: () =>
      selectedGroupId
        ? getGroupMembers(config.authCode, selectedGroupId)
        : null,
    enabled: !!selectedGroupId && config.isConfigured,
  });

  const createMutation = useMutation({
    mutationFn: () => createCallGroup(config.authCode, newGroup),
    onSuccess: (data: any) => {
      if (data.type === "success") {
        toast({
          title: "Success",
          description: "Call group created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["callGroups"] });
        setIsAddDialogOpen(false);
        setNewGroup({ group_name: "", deskphone_id: "" });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (groupId: string) =>
      updateCallGroup(config.authCode, groupId, newGroup),
    onSuccess: (data: any) => {
      if (data.type === "success") {
        toast({
          title: "Success",
          description: "Call group updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["callGroups"] });
        setEditingGroupId(null);
        setNewGroup({ group_name: "", deskphone_id: "" });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => deleteCallGroup(config.authCode, groupId),
    onSuccess: (data: any) => {
      if (data.type === "success") {
        toast({
          title: "Success",
          description: "Call group deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["callGroups"] });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () => {
      if (!selectedGroupId) throw new Error("No group selected");
      return addGroupMember(config.authCode, selectedGroupId, {
        member_id: selectedMemberId,
      });
    },
    onSuccess: (data: any) => {
      if (data.type === "success") {
        toast({
          title: "Success",
          description: "Member added to group successfully",
        });
        queryClient.invalidateQueries({
          queryKey: ["groupMembers", selectedGroupId],
        });
        queryClient.invalidateQueries({ queryKey: ["callGroups"] });
        setSelectedMemberId("");
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (groupMemberId: string) => {
      return removeGroupMember(config.authCode, groupMemberId);
    },
    onSuccess: (data: any) => {
      if (data.type === "success") {
        toast({
          title: "Success",
          description: "Member removed from group successfully",
        });
        queryClient.invalidateQueries({
          queryKey: ["groupMembers", selectedGroupId],
        });
        queryClient.invalidateQueries({ queryKey: ["callGroups"] });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStrategyName = (strategy: string) => {
    const strategies: Record<string, string> = {
      "1": "Round Robin",
      "2": "Sequential",
      "3": "Random",
      "4": "Least Occupied",
      "5": "Parallel",
      "6": "Least Idle",
    };
    return strategies[strategy] || "Unknown";
  };

  const filteredGroups =
    data?.grouplist?.filter((group) =>
      group.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEditGroup = (group: any) => {
    setEditingGroupId(group.group_id);
    setNewGroup({
      group_name: group.group_name,
      deskphone_id: group.deskphone_id,
    });
  };

  const handleOpenMemberDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedMemberId("");
    setMemberDialogOpen(true);
  };

  // Get members actually in the group (only live members)
  const currentGroupMemberIds = new Set(
    groupMembers?.group_user_live?.map((m) => m.member_id) || []
  );

  const availableMembers =
    allMembers?.getmember?.filter(
      (member) => !currentGroupMemberIds.has(member.member_id)
    ) || [];

  // All group members (only live members are actual group members)
  const allGroupMembers = groupMembers?.group_user_live || [];

  const selectedMember = allMembers?.getmember?.find(
    (m) => m.member_id === selectedMemberId
  );

  return (
    <Layout title="Call Groups" subtitle="Manage your call routing groups">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create Call Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Group Name</Label>
                  <Input
                    value={newGroup.group_name}
                    onChange={(e) =>
                      setNewGroup((prev) => ({
                        ...prev,
                        group_name: e.target.value,
                      }))
                    }
                    placeholder="Enter group name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Deskphone</Label>
                  <Select
                    value={newGroup.deskphone_id}
                    onValueChange={(value) =>
                      setNewGroup((prev) => ({ ...prev, deskphone_id: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select deskphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {ivrNumbers?.getdeskphone?.map((ivr) => (
                        <SelectItem key={ivr.did_id} value={ivr.did_id}>
                          {ivr.deskphone} ({ivr.did_num})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={
                    createMutation.isPending ||
                    !newGroup.group_name.trim() ||
                    !newGroup.deskphone_id
                  }
                  className="w-full gradient-primary text-primary-foreground"
                >
                  {createMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Groups</p>
          <p className="text-2xl font-bold text-foreground">
            {data?.total || 0}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-primary">
            {data?.grouplist?.reduce(
              (acc, g) => acc + (g.groupmember_count || 0),
              0
            ) || 0}
          </p>
        </div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Call Groups
          </h3>
          <p className="text-muted-foreground">
            Create your first call group to start routing calls
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.group_id}
              className="glass-card rounded-xl p-6 animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingGroupId === group.group_id}
                    onOpenChange={(open) => {
                      if (!open) setEditingGroupId(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-blue-500/20"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border">
                      <DialogHeader>
                        <DialogTitle>Edit Call Group</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Group Name</Label>
                          <Input
                            value={newGroup.group_name}
                            onChange={(e) =>
                              setNewGroup((prev) => ({
                                ...prev,
                                group_name: e.target.value,
                              }))
                            }
                            placeholder="Enter group name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Deskphone</Label>
                          <Select
                            value={newGroup.deskphone_id}
                            onValueChange={(value) =>
                              setNewGroup((prev) => ({
                                ...prev,
                                deskphone_id: value,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select deskphone" />
                            </SelectTrigger>
                            <SelectContent>
                              {ivrNumbers?.getdeskphone?.map((ivr) => (
                                <SelectItem key={ivr.did_id} value={ivr.did_id}>
                                  {ivr.deskphone} ({ivr.did_num})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => updateMutation.mutate(group.group_id)}
                          disabled={updateMutation.isPending}
                          className="w-full gradient-primary text-primary-foreground"
                        >
                          {updateMutation.isPending
                            ? "Updating..."
                            : "Update Group"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/20"
                    onClick={() => deleteMutation.mutate(group.group_id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {group.group_name}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {group.groupmember_count} members
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Deskphone ID: {group.deskphone_id}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Strategy: {getStrategyName(group.call_strategy)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    group.is_sticky === "1"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {group.is_sticky === "1" ? "Sticky" : "Normal"}
                </span>
                {group.extension && (
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
                    Ext: {group.extension}
                  </span>
                )}
              </div>

              <Button
                onClick={() => handleOpenMemberDialog(group.group_id)}
                variant="outline"
                className="w-full mt-4"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Member Management Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Group Members</DialogTitle>
          </DialogHeader>

          {groupMembersLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* Add Member Section */}
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">
                  Add Member to Group
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label>Select Member</Label>
                    <Select
                      value={selectedMemberId}
                      onValueChange={setSelectedMemberId}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a member to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMembers.length > 0 ? (
                          availableMembers.map((member) => (
                            <SelectItem
                              key={member.member_id}
                              value={member.member_id}
                            >
                              {member.member_name} ({member.member_num})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No available members to add
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedMember && (
                    <div className="p-3 bg-primary/10 rounded border border-primary/20">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedMember.member_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Number:</span>{" "}
                        {selectedMember.member_num}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedMember.member_email}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => addMemberMutation.mutate()}
                    disabled={
                      addMemberMutation.isPending || !selectedMemberId.trim()
                    }
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </div>

              {/* Current Members Section */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">
                  Group Members ({allGroupMembers.length})
                </h4>

                {allGroupMembers.length > 0 ? (
                  <div className="space-y-2">
                    {allGroupMembers.map((member) => (
                      <div
                        key={member.group_member_id}
                        className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.member_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.member_num} • Priority: {member.priority}
                          </p>
                          <p className="text-xs text-green-600">
                            {member.starttime} - {member.endtime}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            removeMemberMutation.mutate(member.group_member_id)
                          }
                          disabled={removeMemberMutation.isPending}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-border rounded-lg">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No members in this group
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
