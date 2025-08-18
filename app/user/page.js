'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/user/CourseCard'; // Your enhanced CourseCard
import ModuleViewer from '../../components/user/ModuleViewer';
import { BookOpen, LogOut, TrendingUp, Clock, Users, Award, Search, Filter } from 'lucide-react';
import { db } from '@/app/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';

export default function UserPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    // Listen to Firestore in real-time
    const q = query(collection(db, 'courses'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter only the courses assigned to the logged-in user
      const userCourses = courseData.filter((course) =>
        course.assignedUsers?.includes(user.username)
      );

      setCourses(userCourses);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
    redirect('/admin');
  }

  // Calculate stats from your real data
  const totalCourses = courses.length;
  const totalSections = courses.reduce((sum, course) => 
    sum + (course.modules?.reduce((moduleSum, module) => 
      moduleSum + (module.sections?.length || 0), 0) || 0), 0
  );
  const totalModules = courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0);

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                 <Image
        src="/subway_navbar_logo.png"   // place image in public/my-logo.png
        alt="Logo"
        width={102}
        height={62}
        className="rounded-lg"
      />
            
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    My Training Portal
                  </h1>
                  <p className="text-gray-600 font-medium">Welcome back, {user?.username}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-xl transition-all duration-300 border border-gray-200 hover:border-transparent hover:shadow-lg group"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Courses */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
                  <div className="text-sm text-gray-600 font-medium">Assigned Courses</div>
                </div>
              </div>
            </div>

            {/* Total Modules */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalModules}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Modules</div>
                </div>
              </div>
            </div>

            {/* Total Sections */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalSections}</div>
                  <div className="text-sm text-gray-600 font-medium">Learning Sections</div>
                </div>
              </div>
            </div>

            {/* Average Attendance (from your original data) */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">--</div>
                  <div className="text-sm text-gray-600 font-medium">Avg Attendance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Showing {filteredCourses.length} of {totalCourses} courses</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/70 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            /* Courses Grid */
            <>
              {filteredCourses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchTerm ? 'No trainings found' : 'No Trainings Assigned'}
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? `No courses match "${searchTerm}". Try adjusting your search.`
                      : "Contact your administrator to get courses assigned to you."
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchTerm ? `Search Results (${filteredCourses.length})` : `Available Trainings (${courses.length})`}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-4 py-2 rounded-xl border border-gray-200">
                      <Clock className="h-4 w-4" />
                      <span>Last updated: just now</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => {
                      // Calculate total sections across all modules (keeping your original logic)
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
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Stats Summary */}
        <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-4 hidden lg:block">
          <div className="text-xs font-semibold text-gray-700 mb-2">Quick Stats</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>📚 {totalCourses} courses assigned</div>
            <div>🎯 {totalSections} sections total</div>
            <div>👥 Training in progress</div>
          </div>
        </div>
      </div>
    );
  }

  return <ModuleViewer course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
}