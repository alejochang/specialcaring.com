import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Shield, CheckCircle, XCircle, UserCheck, Users, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/layout/Dashboard";

interface UserWithRole {
  user_id: string;
  role: AppRole;
  is_approved: boolean;
  created_at: string;
  full_name?: string;
}

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("user_id, role, is_approved, created_at");

      if (error) throw error;

      const userIds = roles.map((r: any) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const merged = roles.map((r: any) => {
        const profile = profiles?.find((p: any) => p.id === r.user_id);
        return {
          ...r,
          full_name: profile?.full_name || t("common.unknown"),
        };
      });

      setUsers(merged);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      toast({ title: t("toast.roleUpdated"), description: t("toast.roleUpdatedDesc", { role: newRole }) });
      fetchUsers();
    } catch (err: any) {
      toast({ title: t("toast.error"), description: err.message, variant: "destructive" });
    }
  };

  const toggleApproval = async (userId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_approved: approve })
        .eq("user_id", userId);

      if (error) throw error;
      toast({
        title: approve ? t("toast.userApproved") : t("toast.accessRevoked"),
        description: approve
          ? t("toast.userApprovedDesc")
          : t("toast.accessRevokedDesc"),
      });
      fetchUsers();
    } catch (err: any) {
      toast({ title: t("toast.error"), description: err.message, variant: "destructive" });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        "https://ogkieklnxxmvjgikyzog.supabase.co/functions/v1/delete-user",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete user");

      toast({ title: t("toast.userDeleted"), description: t("toast.userDeletedDesc", { name: userName }) });
      fetchUsers();
    } catch (err: any) {
      toast({ title: t("toast.error"), description: err.message, variant: "destructive" });
    }
  };

  const pendingUsers = users.filter((u) => !u.is_approved);
  const approvedUsers = users.filter((u) => u.is_approved);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive" as const;
      case "caregiver": return "default" as const;
      case "viewer": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-special-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="container py-8 px-4 md:px-6 animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-8 w-8 text-special-600" />
            {t("pages.admin.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("pages.admin.subtitle")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-special-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-special-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">{t("pages.admin.totalUsers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingUsers.length}</p>
                  <p className="text-sm text-muted-foreground">{t("pages.admin.pendingApproval")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedUsers.length}</p>
                  <p className="text-sm text-muted-foreground">{t("pages.admin.approvedUsers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={pendingUsers.length > 0 ? "pending" : "all"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("pages.admin.tabs.pending")}
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("pages.admin.tabs.allUsers")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>{t("pages.admin.pendingTitle")}</CardTitle>
                <CardDescription>{t("pages.admin.pendingSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-special-600" />
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p className="text-lg font-medium">{t("pages.admin.allCaughtUp")}</p>
                    <p className="text-sm">{t("pages.admin.allCaughtUpDesc")}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("pages.admin.tableHeaders.name")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.role")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.registered")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium">{u.full_name}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => toggleApproval(u.user_id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t("pages.admin.approve")}
                              </Button>
                              <Select
                                value={u.role}
                                onValueChange={(val) => updateRole(u.user_id, val as AppRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">{t("pages.admin.roles.admin")}</SelectItem>
                                  <SelectItem value="caregiver">{t("pages.admin.roles.caregiver")}</SelectItem>
                                  <SelectItem value="viewer">{t("pages.admin.roles.viewer")}</SelectItem>
                                </SelectContent>
                              </Select>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("pages.admin.deleteUser")}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("pages.admin.deleteUserConfirm", { name: u.full_name })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteUser(u.user_id, u.full_name || "User")}>
                                      {t("common.delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>{t("pages.admin.allUsersTitle")}</CardTitle>
                <CardDescription>{t("pages.admin.allUsersSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-special-600" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("pages.admin.tableHeaders.name")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.role")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.status")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.joined")}</TableHead>
                        <TableHead>{t("pages.admin.tableHeaders.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium">
                            {u.full_name}
                            {u.user_id === user?.id && (
                              <Badge variant="outline" className="ml-2 text-xs">{t("common.you")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.is_approved ? (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t("common.approved")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                <Clock className="h-3 w-3 mr-1" />
                                {t("common.pending")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {u.user_id !== user?.id ? (
                              <div className="flex items-center gap-2">
                                {u.is_approved ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => toggleApproval(u.user_id, false)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    {t("pages.admin.revoke")}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => toggleApproval(u.user_id, true)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {t("pages.admin.approve")}
                                  </Button>
                                )}
                                <Select
                                  value={u.role}
                                  onValueChange={(val) => updateRole(u.user_id, val as AppRole)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">{t("pages.admin.roles.admin")}</SelectItem>
                                    <SelectItem value="caregiver">{t("pages.admin.roles.caregiver")}</SelectItem>
                                    <SelectItem value="viewer">{t("pages.admin.roles.viewer")}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("pages.admin.deleteUser")}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("pages.admin.deleteUserConfirm", { name: u.full_name })}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteUser(u.user_id, u.full_name || "User")}>
                                        {t("common.delete")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
