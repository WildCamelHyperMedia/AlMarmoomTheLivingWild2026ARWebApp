import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/lib/user";
import { animals } from "@/lib/data";
import { 
  LayoutDashboard, Users, History, Trophy, LogOut, 
  TrendingUp, Eye, UserPlus, Calendar, ChevronRight,
  Menu, X, Images, Star, Download
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

const getAnimalName = (id: string): string => {
  const animal = animals.find(a => a.id === id);
  if (!animal) return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUserAnimals, setSelectedUserAnimals] = useState<{ name: string; animals: string[] } | null>(null);

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

  const exportUsersToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Videos Watched', 'Animals Watched', 'Login Count', 'Signed Up', 'Last Login'];
    const rows = regularUsers.map(user => [
      user.name,
      user.email,
      user.phone,
      user.videosWatched.toString(),
      (user.unlockedAnimals || []).map(id => getAnimalName(id)).join('; '),
      user.loginCount.toString(),
      new Date(user.createdAt).toLocaleDateString(),
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `al-marmoom-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Calculate most engaged animal
  const mostEngagedAnimal = useMemo(() => {
    const animalCounts: Record<string, number> = {};
    regularUsers.forEach(user => {
      (user.unlockedAnimals || []).forEach(animalId => {
        animalCounts[animalId] = (animalCounts[animalId] || 0) + 1;
      });
    });
    
    let maxAnimal = '';
    let maxCount = 0;
    Object.entries(animalCounts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxAnimal = id;
        maxCount = count;
      }
    });
    
    return maxAnimal ? { id: maxAnimal, name: getAnimalName(maxAnimal), count: maxCount } : null;
  }, [regularUsers]);

  return (
    <div className="min-h-[100dvh] bg-background text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-[#2A1F1A] border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-[#3E2D24] rounded-lg"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <img src="/logo.png" alt="Al Marmoom" className="h-8 w-auto" />
        <span className="text-sm text-white/50">Admin</span>
      </div>

      {/* Sidebar */}
      <div className={`fixed md:sticky top-[52px] md:top-0 bottom-0 left-0 z-40 w-64 bg-[#2A1F1A] md:h-screen md:flex-shrink-0 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo - hidden on mobile since we have header */}
          <div className="hidden md:flex p-6 border-b border-white/10 items-center gap-3">
            <img src="/logo.png" alt="Al Marmoom" className="h-10 w-auto" />
            <div>
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
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
            
            {/* Gallery Link */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => { setLocation("/gallery"); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-white/10 text-white/80"
              >
                <Images className="w-5 h-5" />
                <span className="font-medium">View Gallery</span>
              </button>
            </div>
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
          className="fixed top-[52px] inset-x-0 bottom-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
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
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl md:text-2xl font-bold">Registered Users</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportUsersToCSV}
                        className="flex items-center gap-2 px-3 py-2 bg-[#D4A045] text-background rounded-lg font-medium text-sm hover:bg-[#D4A045]/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                      </button>
                      <span className="bg-[#3E2D24] px-3 py-1 rounded-full text-sm">
                        {regularUsers.length} users
                      </span>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {regularUsers.map((user) => (
                      <div key={user.id} className="bg-[#3E2D24]/60 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-sm text-white/60">{user.email}</p>
                            <p className="text-xs text-white/40">{user.phone}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedUserAnimals({ name: user.name, animals: user.unlockedAnimals || [] })}
                            className="bg-[#D4A045]/20 text-[#D4A045] px-3 py-1 rounded-full text-sm font-bold hover:bg-[#D4A045]/30 transition-colors"
                          >
                            {user.videosWatched} videos
                          </button>
                        </div>
                        <div className="flex gap-4 text-xs text-white/50 pt-2 border-t border-white/10">
                          <span>{user.loginCount} logins</span>
                          <span>Joined {formatShortDate(user.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    {regularUsers.length === 0 && (
                      <div className="text-center py-12 text-white/60 bg-[#3E2D24]/60 rounded-xl">No users yet</div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-[#3E2D24]/60 rounded-xl overflow-hidden">
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
                                <button 
                                  onClick={() => setSelectedUserAnimals({ name: user.name, animals: user.unlockedAnimals || [] })}
                                  className="bg-[#D4A045]/20 text-[#D4A045] px-2 py-1 rounded-full text-sm hover:bg-[#D4A045]/30 transition-colors cursor-pointer"
                                >
                                  {user.videosWatched}
                                </button>
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
                  <h2 className="text-xl md:text-2xl font-bold">Login History</h2>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2">
                    {analytics.recentLogins.map((login) => (
                      <div key={login.id} className="bg-[#3E2D24]/60 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{login.userName}</p>
                          <p className="text-xs text-white/50">{login.userEmail}</p>
                        </div>
                        <p className="text-xs text-white/60">{formatDate(login.loginAt)}</p>
                      </div>
                    ))}
                    {analytics.recentLogins.length === 0 && (
                      <div className="text-center py-12 text-white/60 bg-[#3E2D24]/60 rounded-xl">No login history yet</div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-[#3E2D24]/60 rounded-xl overflow-hidden">
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
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-center">Video Watch Champions</h2>

                  {/* Most Engaged Animal */}
                  {mostEngagedAnimal && (
                    <div className="bg-gradient-to-r from-[#D4A045]/20 to-[#D4A045]/5 rounded-xl p-4 border border-[#D4A045]/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#D4A045]/20 flex items-center justify-center">
                          <Star className="w-6 h-6 text-[#D4A045]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-white/50 uppercase tracking-wider">Most Engaged Animal</p>
                          <p className="text-lg font-bold text-[#D4A045]">{mostEngagedAnimal.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{mostEngagedAnimal.count}</p>
                          <p className="text-xs text-white/50">users watched</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analytics.leaderboard.length >= 3 ? (
                    <>
                      {/* Podium for Top 3 */}
                      <div className="flex items-end justify-center gap-4 py-8">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-4">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 p-1">
                              <div className="w-full h-full rounded-full bg-[#2A1F1A] flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-bold text-gray-300">
                                  {analytics.leaderboard[1]?.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-background font-bold shadow-lg">
                              2
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-gray-500/40 to-gray-400/20 rounded-t-xl w-28 md:w-32 h-32 flex flex-col items-center justify-end pb-4 border-t-4 border-gray-400">
                            <p className="font-bold text-center truncate w-full px-2">{analytics.leaderboard[1]?.name}</p>
                            <p className="text-2xl font-bold text-gray-300">{analytics.leaderboard[1]?.videosWatched}</p>
                            <p className="text-xs text-white/50">videos</p>
                          </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center -mt-8">
                          <div className="text-4xl mb-2 animate-bounce">👑</div>
                          <div className="relative mb-4">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-1 shadow-lg shadow-yellow-500/30">
                              <div className="w-full h-full rounded-full bg-[#2A1F1A] flex items-center justify-center">
                                <span className="text-3xl md:text-4xl font-bold text-yellow-400">
                                  {analytics.leaderboard[0]?.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-background font-bold text-lg shadow-lg">
                              1
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-yellow-600/40 to-yellow-400/20 rounded-t-xl w-32 md:w-40 h-44 flex flex-col items-center justify-end pb-4 border-t-4 border-yellow-400">
                            <p className="font-bold text-lg text-center truncate w-full px-2">{analytics.leaderboard[0]?.name}</p>
                            <p className="text-3xl font-bold text-yellow-400">{analytics.leaderboard[0]?.videosWatched}</p>
                            <p className="text-xs text-white/50">videos</p>
                          </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-4">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 p-1">
                              <div className="w-full h-full rounded-full bg-[#2A1F1A] flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-bold text-orange-400">
                                  {analytics.leaderboard[2]?.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-700 rounded-full flex items-center justify-center text-background font-bold shadow-lg">
                              3
                            </div>
                          </div>
                          <div className="bg-gradient-to-t from-orange-700/40 to-orange-500/20 rounded-t-xl w-28 md:w-32 h-24 flex flex-col items-center justify-end pb-4 border-t-4 border-orange-500">
                            <p className="font-bold text-center truncate w-full px-2">{analytics.leaderboard[2]?.name}</p>
                            <p className="text-2xl font-bold text-orange-400">{analytics.leaderboard[2]?.videosWatched}</p>
                            <p className="text-xs text-white/50">videos</p>
                          </div>
                        </div>
                      </div>

                      {/* Rest of the leaderboard */}
                      {analytics.leaderboard.length > 3 && (
                        <div className="bg-[#3E2D24]/60 rounded-xl p-4">
                          <h3 className="text-center text-white/60 mb-4 text-sm uppercase tracking-wider">Other Participants</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {analytics.leaderboard.slice(3).map((user, i) => (
                              <div 
                                key={user.id}
                                className="bg-[#2A1F1A]/80 rounded-lg p-4 text-center hover:bg-[#2A1F1A] transition-colors"
                              >
                                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#D4A045]/10 flex items-center justify-center">
                                  <span className="text-[#D4A045] font-bold">{i + 4}</span>
                                </div>
                                <p className="font-medium truncate text-sm">{user.name}</p>
                                <p className="text-lg font-bold text-[#D4A045] mt-1">{user.videosWatched}</p>
                                <p className="text-[10px] text-white/40">videos</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : analytics.leaderboard.length > 0 ? (
                    <div className="text-center py-12 bg-[#3E2D24]/60 rounded-xl">
                      <p className="text-white/60 mb-4">Need at least 3 users to show the podium</p>
                      <div className="space-y-3 max-w-sm mx-auto">
                        {analytics.leaderboard.map((user, i) => (
                          <div key={user.id} className="flex items-center gap-3 bg-[#2A1F1A] p-4 rounded-lg">
                            <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                            <span className="flex-1 font-medium">{user.name}</span>
                            <span className="text-[#D4A045] font-bold">{user.videosWatched}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-[#3E2D24]/60 rounded-xl">
                      <Trophy className="w-16 h-16 mx-auto text-white/20 mb-4" />
                      <p className="text-white/60">No champions yet</p>
                      <p className="text-sm text-white/40 mt-2">Users will appear here as they watch videos</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Animals Watched Modal */}
      {selectedUserAnimals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70" 
            onClick={() => setSelectedUserAnimals(null)} 
          />
          <div className="relative bg-[#2A1F1A] rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <button 
              onClick={() => setSelectedUserAnimals(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Videos Watched by {selectedUserAnimals.name}</h3>
            <div className="space-y-2">
              {selectedUserAnimals.animals.length > 0 ? (
                selectedUserAnimals.animals.map((animalId, i) => (
                  <div 
                    key={animalId} 
                    className="flex items-center gap-3 p-3 bg-[#3E2D24]/60 rounded-lg"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#D4A045]/20 flex items-center justify-center text-xs text-[#D4A045]">
                      {i + 1}
                    </span>
                    <span className="flex-1">{getAnimalName(animalId)}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-center py-4">No videos watched yet</p>
              )}
            </div>
          </div>
        </div>
      )}
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
