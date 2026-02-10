
import { useState } from "react";
import { useChild } from "@/contexts/ChildContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Heart, Loader2 } from "lucide-react";

const ChildSelector = () => {
  const { children, activeChild, setActiveChildId, addChild, updateChild, deleteChild, isLoading } = useChild();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState("");
  const [deleteId, setDeleteId] = useState("");

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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-muted-foreground">Select Child</h2>
        {children.length < 10 && (
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Child
          </Button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {children.map((child, idx) => (
          <Card
            key={child.id}
            className={`cursor-pointer transition-all min-w-[140px] ${
              activeChild?.id === child.id
                ? 'ring-2 ring-special-500 shadow-lg scale-105'
                : 'hover:shadow-md hover:scale-102 opacity-75'
            }`}
            onClick={() => setActiveChildId(child.id)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <Avatar className={`h-14 w-14 bg-gradient-to-br ${colors[idx % colors.length]}`}>
                <AvatarFallback className="text-white font-bold text-lg bg-transparent">
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm text-center truncate w-full">{child.name}</span>
              {activeChild?.id === child.id && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(child.id);
                      setEditName(child.name);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  {children.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(child.id);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {children.length === 0 && (
          <Card className="min-w-[200px]">
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <Heart className="h-8 w-8 text-special-400" />
              <p className="text-sm text-muted-foreground text-center">Add your first child to get started</p>
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Child
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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
    </div>
  );
};

export default ChildSelector;
