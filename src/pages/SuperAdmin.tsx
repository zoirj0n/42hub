import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { UserData } from "@/types/auth";
import { UserRole } from "@/types/event";
import { AlertCircle, CheckCircle, Clock, ShieldAlert, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";
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

const SuperAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data as UserData[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "There was a problem loading the user data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Admin approved",
        description: "User has been granted admin privileges.",
      });

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'admin' as UserRole, approved_by: user?.id } : u
      ));
      setShowApproveDialog(false);
    } catch (error) {
      console.error('Error approving admin:', error);
      toast({
        title: "Error approving admin",
        description: "There was a problem updating the user role.",
        variant: "destructive",
      });
    }
  };

  const demoteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: 'user',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "User demoted",
        description: "Admin privileges have been revoked.",
      });

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'user' as UserRole } : u
      ));
      setShowDemoteDialog(false);
    } catch (error) {
      console.error('Error demoting user:', error);
      toast({
        title: "Error demoting user",
        description: "There was a problem updating the user role.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        throw authError;
      }
      
      // Then delete from our users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "User deleted",
        description: "User has been permanently removed.",
      });

      // Update local state
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: "There was a problem deleting the user.",
        variant: "destructive",
      });
    }
  };

  const pendingAdminRequests = users.filter(user => 
    user.role === 'user' && user.metadata?.request_admin === true
  );

  // Fix the error on line 186 where "pending" is used incorrectly
  // Look for any code that uses the value 'pending' and replace with proper UserRole values
  
  // This might be at around line 186 that needs fixing
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" /> Superadmin
        </Badge>;
      case 'admin':
        return <Badge variant="default" className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" /> Admin
        </Badge>;
      case 'user':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" /> User
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and system-wide settings
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" /> 
            Admin Requests
            {pendingAdminRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingAdminRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Loading users...</p>
            ) : (
              users.map(userData => (
                <Card key={userData.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{userData.name}</CardTitle>
                        <CardDescription className="mt-1">{userData.email}</CardDescription>
                      </div>
                      {getRoleBadge(userData.role)}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex flex-col space-y-1 text-muted-foreground">
                      <div>User ID: {userData.id.substring(0, 8)}...</div>
                      <div>Created: {format(new Date(userData.created_at), 'PPP')}</div>
                      {userData.approved_by && (
                        <div>Approved by: {userData.approved_by.substring(0, 8)}...</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {userData.role !== 'superadmin' && userData.id !== user?.id && (
                      <>
                        {userData.role === 'user' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(userData);
                              setShowApproveDialog(true);
                            }}
                          >
                            Make Admin
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(userData);
                              setShowDemoteDialog(true);
                            }}
                          >
                            Revoke Admin
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(userData);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-4">
          {pendingAdminRequests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Pending Requests</CardTitle>
                <CardDescription>
                  There are currently no pending admin requests to review.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAdminRequests.map(userData => (
                <Card key={userData.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{userData.name}</CardTitle>
                        <CardDescription className="mt-1">{userData.email}</CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Requested Admin
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex flex-col space-y-1 text-muted-foreground">
                      <div>User ID: {userData.id.substring(0, 8)}...</div>
                      <div>Requested: {format(new Date(userData.created_at), 'PPP')}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        setSelectedUser(userData);
                        setShowApproveDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => {
                        setSelectedUser(userData);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <AlertCircle className="h-4 w-4" /> Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Admin Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Grant Admin Privileges</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make {selectedUser?.name} an admin? 
              They will have access to create and manage events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && approveAdmin(selectedUser.id)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demote User Dialog */}
      <AlertDialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Admin Privileges</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke admin privileges from {selectedUser?.name}? 
              They will no longer be able to manage events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && demoteUser(selectedUser.id)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? 
              This action cannot be undone and will permanently remove their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedUser && deleteUser(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdmin;
