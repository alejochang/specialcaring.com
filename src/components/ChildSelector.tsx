
import { useState, useRef } from "react";
import { useChild } from "@/contexts/ChildContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Heart, Loader2, Ticket, MoreVertical, Camera } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import RedeemInvite from "@/components/RedeemInvite";

const ChildSelector = () => {
  const { children, activeChild, setActiveChildId, addChild, updateChild, updateChildAvatar, deleteChild, isLoading, isOwner } = useChild();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [uploadingAvatarId, setUploadingAvatarId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-special-600" />
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addChild(newName.trim());
    setNewName("");
    setIsAddOpen(false);
  };

  const handleEdit = async () => {
    if (!editName.trim() || !editId) return;
    await updateChild(editId, editName.trim());
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteChild(deleteId);
    setIsDeleteOpen(false);
  };

  const handleAvatarUpload = async (childId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploadingAvatarId(childId);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${childId}/avatar.${ext}`;

      // Remove old avatar if exists
      await supabase.storage.from('child-avatars').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('child-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('child-avatars')
        .getPublicUrl(filePath);

      // Add cache-buster to force refresh
      await updateChildAvatar(childId, `${publicUrl}?t=${Date.now()}`);
    } catch (error: any) {
      console.error("Avatar upload error:", error);
    } finally {
      setUploadingAvatarId(null);
    }
  };

  const triggerAvatarUpload = (childId: string) => {
    setUploadingAvatarId(childId);
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = [
    "from-special-400 to-special-600",
    "from-pink-400 to-pink-600", 
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-orange-400 to-orange-600",
    "from-cyan-400 to-cyan-600",
    "from-violet-400 to-violet-600",
    "from-rose-400 to-rose-600",
    "from-teal-400 to-teal-600",
    "from-amber-400 to-amber-600",
  ];

  const roleBadge = (role: string) => {
    if (role === 'owner') return null; // Don't show badge for owned children
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
        {role === 'caregiver' ? 'Shared' : 'View only'}
      </Badge>
    );
  };

  // Count owned children for the limit
  const ownedCount = children.filter(c => c.accessRole === 'owner').length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Select Child</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsRedeemOpen(true)} className="gap-1">
            <Ticket className="h-4 w-4" /> Join
          </Button>
          {ownedCount < 10 && (
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Add Child
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {children.map((child, idx) => (
          <Card
            key={child.id}
            className={`cursor-pointer transition-all min-w-[140px] group ${
              activeChild?.id === child.id
                ? 'ring-2 ring-special-500 shadow-lg scale-105'
                : 'hover:shadow-md hover:scale-102 opacity-75'
            }`}
            onClick={() => setActiveChildId(child.id)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2 relative">
              {isOwner(child.id) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditId(child.id);
                        setEditName(child.name);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                    </DropdownMenuItem>
                    {children.filter(c => c.accessRole === 'owner').length > 1 && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setDeleteId(child.id);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => triggerAvatarUpload(child.id)}
                    >
                      <Camera className="h-3.5 w-3.5 mr-2" /> Change Photo
                    </DropdownMenuItem>
                    {child.avatar_url && (
                      <DropdownMenuItem
                        onClick={() => updateChildAvatar(child.id, null)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Photo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Avatar className={`h-14 w-14 bg-gradient-to-br ${colors[idx % colors.length]}`}>
                {child.avatar_url && (
                  <AvatarImage src={child.avatar_url} alt={child.name} className="object-cover" />
                )}
                <AvatarFallback className="text-white font-bold text-lg bg-transparent">
                  {uploadingAvatarId === child.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    getInitials(child.name)
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm text-center truncate w-full">{child.name}</span>
              {roleBadge(child.accessRole)}
            </CardContent>
          </Card>
        ))}

        {children.length === 0 && (
          <Card className="min-w-[200px]">
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <Heart className="h-8 w-8 text-special-400" />
              <p className="text-sm text-muted-foreground text-center">Add your first child or join with an invite code</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsRedeemOpen(true)}>
                  <Ticket className="h-4 w-4 mr-1" /> Join
                </Button>
                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Child
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Redeem Invite */}
      <RedeemInvite open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Child's name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Child</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Child's name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!editName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this child's profile and all associated data (medications, emergency cards, daily logs, etc.). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingAvatarId) {
            handleAvatarUpload(uploadingAvatarId, file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ChildSelector;
