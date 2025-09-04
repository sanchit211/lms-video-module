'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/user/CourseCard';
import ModuleViewer from '../../components/user/ModuleViewer';
import { BookOpen, LogOut, TrendingUp, Award, Search, Filter, Home, Users, Menu, X, ChevronRight } from 'lucide-react';
import { db } from '@/app/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';

export default function UserPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const q = query(collection(db, 'courses'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userCourses = courseData.filter((course) =>
        course.assignedUsers?.includes(user.username)
      );

      setCourses(userCourses);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) redirect('/');
  if (user.role === 'admin') redirect('/admin');

  // Stats
  const totalCourses = courses.length;
  const totalSections = courses.reduce((sum, course) =>
    sum + (course.modules?.reduce((mSum, m) => mSum + (m.sections?.length || 0), 0) || 0), 0
  );
  const totalModules = courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Trainings', icon: BookOpen },
  ];

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-amber-50 flex relative">
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${sidebarCollapsed ? 'w-20' : 'w-80'} 
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative z-50 min-h-screen
            bg-white/90 backdrop-blur-xl shadow-xl border-r border-gray-200/50 flex flex-col
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Logo + User Info */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <Image
                  src="/subway_navbar_logo.png"
                  alt="Logo"
                  width={sidebarCollapsed ? 40 : 60}
                  height={sidebarCollapsed ? 24 : 36}
                  className="rounded-lg transition-all duration-300"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00491e] rounded-full border-2 border-white"></div>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-[#00491e]">Training Portal</h1>
                  <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
                </div>
              )}
            </div>

            {/* Collapse Button (Desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 bg-[#00491e]/10 hover:bg-[#00491e]/20 rounded-lg transition-all duration-300 hover:scale-105"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronRight className={`h-4 w-4 text-[#00491e] transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-[#00491e] text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-[#f2b700]/10 hover:scale-105'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform flex-shrink-0`} />
                    {!sidebarCollapsed && <span className="font-medium truncate">{item.label}</span>}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            {!sidebarCollapsed && (
              <div className="mt-8 p-4 bg-[#f2b700]/10 rounded-2xl border border-[#f2b700]/30">
                <h3 className="text-sm font-semibold text-[#00491e] mb-3">Quick Overview</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trainings</span>
                    <span className="font-bold text-[#00491e]">{totalCourses}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Modules</span>
                    <span className="font-bold text-[#f2b700]">{totalModules}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sections</span>
                    <span className="font-bold text-[#00491e]">{totalSections}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105 group ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
              {sidebarCollapsed && (
                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Toggle Button */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-[#00491e]/10 hover:bg-[#00491e]/20 rounded-xl transition-all duration-300 hover:scale-105"
              >
                {mobileSidebarOpen ? (
                  <X className="h-5 w-5 text-[#00491e]" />
                ) : (
                  <Menu className="h-5 w-5 text-[#00491e]" />
                )}
              </button>

              <div>
                <h1 className="text-2xl font-bold text-[#00491e]">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'courses' && 'My Trainings'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'dashboard' && 'Overview of your learning journey'}
                  {activeTab === 'courses' && 'Browse and access your assigned training courses'}
                </p>
              </div>
            </div>
          </header>

          {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && (
              <>
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00491e] rounded-xl flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#00491e]">{totalCourses}</div>
                        <div className="text-sm text-gray-600 font-medium">Assigned Trainings</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f2b700] rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#f2b700]">{totalModules}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Modules</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00491e] rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#00491e]">{totalSections}</div>
                        <div className="text-sm text-gray-600 font-medium">Learning Sections</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f2b700] rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#f2b700]">85%</div>
                        <div className="text-sm text-gray-600 font-medium">Avg Progress</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Courses Preview */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#00491e]">Recent Trainings</h2>
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className="text-[#f2b700] hover:text-[#f2b700]/80 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      View All
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="p-4 bg-gray-50 rounded-xl hover:bg-[#f2b700]/10 transition-all duration-200 border border-gray-200 cursor-pointer hover:border-[#f2b700]/30"
                           onClick={() => setSelectedCourse(course)}>
                        <h3 className="font-semibold text-[#00491e] mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-[#f2b700]/20 text-[#00491e] px-2 py-1 rounded-full font-medium">
                            {course.modules?.length || 0} modules
                          </span>
                          <button className="text-[#f2b700] hover:text-[#f2b700]/80 text-sm font-medium transition-colors">
                            Start →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'courses' && (
              <>
                {/* Search and Filter */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search your trainings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f2b700] focus:border-[#f2b700] transition-all duration-200 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Filter className="h-4 w-4" />
                      <span>Showing {filteredCourses.length} of {totalCourses} trainings</span>
                    </div>
                  </div>
                </div>

                {/* Courses Grid */}
                {isLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/80 rounded-2xl p-6 shadow-lg animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="w-24 h-24 bg-[#00491e]/10 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-[#00491e]" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#00491e] mb-3">
                      {searchTerm ? 'No trainings found' : 'No Trainings Assigned'}
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {searchTerm 
                        ? `No trainings match "${searchTerm}". Try adjusting your search.`
                        : "Contact your administrator to get trainings assigned to you."
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="bg-[#00491e] hover:bg-[#00491e]/90 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course) => {
                      const totalSections = course.modules?.reduce(
                        (sum, module) => sum + (module.sections?.length || 0), 
                        0
                      ) || 0;

                      return (
                        <CourseCard 
                          key={course.id} 
                          course={{
                            ...course,
                            totalSections
                          }} 
                          onClick={() => setSelectedCourse(course)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <ModuleViewer course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
}
