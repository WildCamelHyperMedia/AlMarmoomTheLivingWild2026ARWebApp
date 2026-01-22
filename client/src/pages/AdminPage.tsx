import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/lib/user";
import { 
  LayoutDashboard, Users, History, Trophy, LogOut, 
  TrendingUp, Eye, UserPlus, Calendar, ChevronRight,
  Menu, X
} from "lucide-react";

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
  loginCount: number;
  lastLogin: string | null;
}

interface Analytics {
  stats: {
    totalUsers: number;
    totalVideosWatched: number;
    avgVideosPerUser: number;
    signupsToday: number;
    signupsThisWeek: number;
    totalLogins: number;
  };
  loginStats: { date: string; count: number }[];
  leaderboard: { id: string; name: string; email: string; videosWatched: number }[];
  recentLogins: { id: string; userId: string; loginAt: string; userName: string; userEmail: string }[];
}

type AdminView = "dashboard" | "users" | "history" | "leaderboard";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { "x-admin-id": user?.id || "" } }),
        fetch("/api/admin/analytics", { headers: { "x-admin-id": user?.id || "" } })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user?.isAdmin) return null;

  const menuItems = [
    { id: "dashboard" as AdminView, icon: LayoutDashboard, label: "Dashboard" },
    { id: "users" as AdminView, icon: Users, label: "Users" },
    { id: "history" as AdminView, icon: History, label: "Login History" },
    { id: "leaderboard" as AdminView, icon: Trophy, label: "Leaderboard" },
  ];

  const regularUsers = users.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#3E2D24] rounded-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#2A1F1A] transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-[#D4A045]">Al Marmoom</h1>
            <p className="text-xs text-white/50 mt-1">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id 
                    ? "bg-[#D4A045] text-background" 
                    : "hover:bg-white/10 text-white/80"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D4A045]/20 flex items-center justify-center">
                <span className="text-[#D4A045] font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-white/50">Loading...</div>
            </div>
          ) : (
            <>
              {/* Dashboard View */}
              {currentView === "dashboard" && analytics && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon={Users} label="Total Users" value={analytics.stats.totalUsers} color="blue" />
                    <StatCard icon={Eye} label="Videos Watched" value={analytics.stats.totalVideosWatched} color="green" />
                    <StatCard icon={TrendingUp} label="Avg per User" value={analytics.stats.avgVideosPerUser} color="purple" />
                    <StatCard icon={UserPlus} label="Today" value={analytics.stats.signupsToday} color="yellow" />
                    <StatCard icon={Calendar} label="This Week" value={analytics.stats.signupsThisWeek} color="pink" />
                    <StatCard icon={History} label="Total Logins" value={analytics.stats.totalLogins} color="orange" />
                  </div>

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Login Activity Chart */}
                    <div className="bg-[#3E2D24]/60 rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Login Activity (Last 30 Days)</h3>
                      <div className="flex items-end gap-1 h-32">
                        {analytics.loginStats.slice(0, 14).reverse().map((stat, i) => {
                          const maxCount = Math.max(...analytics.loginStats.map(s => Number(s.count)), 1);
                          const height = (Number(stat.count) / maxCount) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-[#D4A045] rounded-t transition-all hover:bg-[#D4A045]/80"
                                style={{ height: `${Math.max(height, 4)}%` }}
                                title={`${stat.date}: ${stat.count} logins`}
                              />
                              <span className="text-[8px] text-white/40">{formatShortDate(stat.date)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top Users */}
                    <div className="bg-[#3E2D24]/60 rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Top Users by Videos Watched</h3>
                      <div className="space-y-3">
                        {analytics.leaderboard.slice(0, 5).map((user, i) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              i === 1 ? 'bg-gray-400/20 text-gray-400' :
                              i === 2 ? 'bg-orange-600/20 text-orange-600' :
                              'bg-white/10 text-white/50'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs text-white/50 truncate">{user.email}</p>
                            </div>
                            <div className="text-[#D4A045] font-bold">{user.videosWatched}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-[#3E2D24]/60 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Recent Logins</h3>
                      <button 
                        onClick={() => setCurrentView("history")}
                        className="text-sm text-[#D4A045] hover:underline flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {analytics.recentLogins.slice(0, 5).map((login) => (
                        <div key={login.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div>
                            <p className="font-medium">{login.userName}</p>
                            <p className="text-xs text-white/50">{login.userEmail}</p>
                          </div>
                          <p className="text-sm text-white/60">{formatDate(login.loginAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users View */}
              {currentView === "users" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Registered Users</h2>
                    <span className="bg-[#3E2D24] px-3 py-1 rounded-full text-sm">
                      {regularUsers.length} users
                    </span>
                  </div>

                  <div className="bg-[#3E2D24]/60 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-white/60 font-medium">Name</th>
                            <th className="text-left p-4 text-white/60 font-medium">Email</th>
                            <th className="text-left p-4 text-white/60 font-medium">Phone</th>
                            <th className="text-left p-4 text-white/60 font-medium">Videos</th>
                            <th className="text-left p-4 text-white/60 font-medium">Logins</th>
                            <th className="text-left p-4 text-white/60 font-medium">Signed Up</th>
                            <th className="text-left p-4 text-white/60 font-medium">Last Login</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regularUsers.map((user) => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4 font-medium">{user.name}</td>
                              <td className="p-4 text-white/80">{user.email}</td>
                              <td className="p-4 text-white/80">{user.phone}</td>
                              <td className="p-4">
                                <span className="bg-[#D4A045]/20 text-[#D4A045] px-2 py-1 rounded-full text-sm">
                                  {user.videosWatched}
                                </span>
                              </td>
                              <td className="p-4 text-white/60">{user.loginCount}</td>
                              <td className="p-4 text-white/60 text-sm">{formatDate(user.createdAt)}</td>
                              <td className="p-4 text-white/60 text-sm">
                                {user.lastLogin ? formatDate(user.lastLogin) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {regularUsers.length === 0 && (
                      <div className="text-center py-12 text-white/60">No users yet</div>
                    )}
                  </div>
                </div>
              )}

              {/* Login History View */}
              {currentView === "history" && analytics && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Login History</h2>

                  <div className="bg-[#3E2D24]/60 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-white/60 font-medium">User</th>
                            <th className="text-left p-4 text-white/60 font-medium">Email</th>
                            <th className="text-left p-4 text-white/60 font-medium">Login Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recentLogins.map((login) => (
                            <tr key={login.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4 font-medium">{login.userName}</td>
                              <td className="p-4 text-white/80">{login.userEmail}</td>
                              <td className="p-4 text-white/60">{formatDate(login.loginAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {analytics.recentLogins.length === 0 && (
                      <div className="text-center py-12 text-white/60">No login history yet</div>
                    )}
                  </div>
                </div>
              )}

              {/* Leaderboard View */}
              {currentView === "leaderboard" && analytics && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Video Watch Leaderboard</h2>

                  <div className="grid gap-4">
                    {analytics.leaderboard.map((user, i) => (
                      <div 
                        key={user.id} 
                        className={`bg-[#3E2D24]/60 rounded-xl p-6 flex items-center gap-4 ${
                          i === 0 ? 'border-2 border-yellow-500/50' :
                          i === 1 ? 'border-2 border-gray-400/50' :
                          i === 2 ? 'border-2 border-orange-600/50' : ''
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          i === 1 ? 'bg-gray-400/20 text-gray-400' :
                          i === 2 ? 'bg-orange-600/20 text-orange-600' :
                          'bg-white/10 text-white/50'
                        }`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg">{user.name}</p>
                          <p className="text-sm text-white/50">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#D4A045]">{user.videosWatched}</p>
                          <p className="text-xs text-white/50">videos watched</p>
                        </div>
                      </div>
                    ))}
                    {analytics.leaderboard.length === 0 && (
                      <div className="text-center py-12 text-white/60 bg-[#3E2D24]/60 rounded-xl">
                        No users on the leaderboard yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { 
  icon: any; 
  label: string; 
  value: number | string; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="bg-[#3E2D24]/60 rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );
}
