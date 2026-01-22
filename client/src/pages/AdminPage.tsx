import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/lib/user";
import { ArrowLeft, Users, Video, Clock, LogOut } from "lucide-react";

interface UserWithProgress {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  videosWatched: number;
  unlockedAnimals: string[];
  lastActivity: string;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/");
      return;
    }

    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          "x-admin-id": user?.id || ""
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalUsers = users.filter(u => !u.isAdmin).length;
  const totalVideosWatched = users.reduce((acc, u) => acc + u.videosWatched, 0);
  const avgVideosPerUser = totalUsers > 0 ? (totalVideosWatched / totalUsers).toFixed(1) : '0';

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setLocation("/gallery")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#3E2D24]/80 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-[#D4A045]" />
              <span className="text-white/60 text-sm">Total Users</span>
            </div>
            <p className="text-3xl font-bold" data-testid="text-total-users">{totalUsers}</p>
          </div>

          <div className="bg-[#3E2D24]/80 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-6 h-6 text-[#D4A045]" />
              <span className="text-white/60 text-sm">Videos Watched</span>
            </div>
            <p className="text-3xl font-bold" data-testid="text-total-videos">{totalVideosWatched}</p>
          </div>

          <div className="bg-[#3E2D24]/80 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-[#D4A045]" />
              <span className="text-white/60 text-sm">Avg Videos/User</span>
            </div>
            <p className="text-3xl font-bold" data-testid="text-avg-videos">{avgVideosPerUser}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="bg-[#3E2D24]/60 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Name</th>
                    <th className="text-left p-4 text-white/60 font-medium">Email</th>
                    <th className="text-left p-4 text-white/60 font-medium">Phone</th>
                    <th className="text-left p-4 text-white/60 font-medium">Videos</th>
                    <th className="text-left p-4 text-white/60 font-medium">Signed Up</th>
                    <th className="text-left p-4 text-white/60 font-medium">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => !u.isAdmin).map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`row-user-${user.id}`}>
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4 text-white/80">{user.email}</td>
                      <td className="p-4 text-white/80">{user.phone}</td>
                      <td className="p-4">
                        <span className="bg-[#D4A045]/20 text-[#D4A045] px-2 py-1 rounded-full text-sm">
                          {user.videosWatched}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="p-4 text-white/60 text-sm">{formatDate(user.lastActivity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.filter(u => !u.isAdmin).length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60">No users yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
