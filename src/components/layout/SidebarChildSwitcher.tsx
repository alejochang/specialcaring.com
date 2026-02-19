
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChild } from "@/contexts/ChildContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import RedeemInvite from "@/components/RedeemInvite";
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Camera,
  MoreVertical,
  Check,
  Heart,
  Ticket,
  Loader2,
} from "lucide-react";

interface SidebarChildSwitcherProps {
  isCollapsed: boolean;
}

const AVATAR_COLORS = [
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

const getInitials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

const SidebarChildSwitcher = ({ isCollapsed }: SidebarChildSwitcherProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    children,
    activeChild,
    setActiveChildId,
    updateChild,
    updateChildAvatar,
    deleteChild,
    isOwner,
    isLoading,
  } = useChild();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [uploadingAvatarId, setUploadingAvatarId] = useState<string | null>(null);

  // Keep file input outside the popover so OS dialog doesn't close it
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close popover when collapse state changes to prevent mispositioned popover
  useEffect(() => {
    setPopoverOpen(false);
  }, [isCollapsed]);

  const ownedCount = children.filter((c) => c.accessRole === "owner").length;

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
    if (!file.type.startsWith("image/")) return;
    setUploadingAvatarId(childId);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${childId}/avatar.${ext}`;

      await supabase.storage.from("child-avatars").remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from("child-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("child-avatars").getPublicUrl(filePath);

      await updateChildAvatar(childId, `${publicUrl}?t=${Date.now()}`);
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({ title: "Error", description: "Failed to upload photo.", variant: "destructive" });
    } finally {
      setUploadingAvatarId(null);
    }
  };

  const triggerAvatarUpload = (childId: string) => {
    setUploadingAvatarId(childId);
    fileInputRef.current?.click();
  };

  const roleBadge = (role: string) => {
    if (role === "owner") return null;
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
        {role === "caregiver" ? "Shared" : "View only"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="px-3 py-3 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-special-600" />
      </div>
    );
  }

  // Empty state: no children yet
  if (children.length === 0) {
    return (
      <div className="px-3 py-3 border-b border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-special-600 hover:text-special-700 hover:bg-special-50"
          onClick={() => navigate("/add-child")}
        >
          <Heart className="h-5 w-5" />
          {!isCollapsed && <span className="text-sm font-medium">Add Your First Child</span>}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-border">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors text-left"
              aria-label="Switch child"
            >
              <Avatar className={`h-9 w-9 shrink-0 bg-gradient-to-br ${AVATAR_COLORS[0]}`}>
                {activeChild?.avatar_url && (
                  <AvatarImage
                    src={activeChild.avatar_url}
                    alt={activeChild.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-white font-bold text-sm bg-transparent">
                  {activeChild ? getInitials(activeChild.name) : "?"}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && activeChild && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{activeChild.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {activeChild.accessRole === "owner"
                        ? "Your child"
                        : activeChild.accessRole === "caregiver"
                        ? "Shared with you"
                        : "View only"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side={isCollapsed ? "right" : "bottom"}
            align={isCollapsed ? "start" : "start"}
            className="w-72 p-0"
            sideOffset={isCollapsed ? 8 : 4}
          >
            <div className="p-3 pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Children
              </p>
            </div>

            <ScrollArea className="max-h-[280px]">
              <div className="px-1">
                {children.map((child, idx) => (
                  <div
                    key={child.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      activeChild?.id === child.id
                        ? "bg-special-50"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setActiveChildId(child.id);
                      setPopoverOpen(false);
                    }}
                  >
                    <Avatar
                      className={`h-8 w-8 shrink-0 bg-gradient-to-br ${
                        AVATAR_COLORS[idx % AVATAR_COLORS.length]
                      }`}
                    >
                      {child.avatar_url && (
                        <AvatarImage
                          src={child.avatar_url}
                          alt={child.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="text-white font-semibold text-xs bg-transparent">
                        {uploadingAvatarId === child.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          getInitials(child.name)
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{child.name}</p>
                    </div>

                    {roleBadge(child.accessRole)}

                    {activeChild?.id === child.id && (
                      <Check className="h-4 w-4 text-special-600 shrink-0" />
                    )}

                    {isOwner(child.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setEditId(child.id);
                              setEditName(child.name);
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                          </DropdownMenuItem>
                          {ownedCount > 1 && (
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
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-2 space-y-1">
              {ownedCount < 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setPopoverOpen(false);
                    navigate("/add-child");
                  }}
                >
                  <Plus className="h-4 w-4" /> Add Child
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setPopoverOpen(false);
                  setIsRedeemOpen(true);
                }}
              >
                <Ticket className="h-4 w-4" /> Join with Invite Code
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dialogs rendered outside the popover */}
      <RedeemInvite open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />

      {/* Rename Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Child</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Child's name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this child's profile and all
              associated data (medications, emergency cards, daily logs, etc.).
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file input for avatar upload — outside popover to avoid closing */}
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
          e.target.value = "";
        }}
      />
    </>
  );
};

export default SidebarChildSwitcher;
