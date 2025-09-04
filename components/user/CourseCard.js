'use client';

import { ChevronRight, BookOpen, Play, Clock, Users, Trophy, Target, Star } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  
  // Calculate total sections across all modules
  const totalSections = course.modules?.reduce(
    (sum, module) => sum + (module.sections?.length || 0), 
    0
  ) || 0;

  // Calculate total quizzes across all modules
  const totalQuizzes = course.modules?.reduce(
    (sum, module) => sum + (module.quizzes?.length || 0), 
    0
  ) || 0;

  // Generate a solid color based on course title hash for consistency
  const getColorFromTitle = (title) => {
    const colors = ['#00491e', '#f2b700']; // Only your two colors
    const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const primaryColor = getColorFromTitle(course.title);

  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 w-full"
    >
      {/* Card Container with responsive height */}
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 backdrop-blur-sm h-auto min-h-[400px] sm:h-[480px] flex flex-col">
        
        {/* Responsive Header */}
        <div className={`h-24 sm:h-32 relative overflow-hidden flex-shrink-0`} style={{ backgroundColor: "#00491e" }}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-12 sm:w-20 h-12 sm:h-20 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-1 sm:bottom-2 right-4 sm:right-8 w-8 sm:w-16 h-8 sm:h-16 bg-white/15 rounded-full blur-lg"></div>
            <div className="absolute top-4 sm:top-8 right-6 sm:right-12 w-4 sm:w-8 h-4 sm:h-8 bg-white/25 rounded-full blur-sm"></div>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">
              Training Course
            </div>
          </div>

          {/* Estimated Time */}
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium bg-black/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
              Est. {Math.floor(totalSections * 0.5) || 1}h {(totalSections * 30) % 60 || 30}m
            </div>
          </div>
        </div>

        {/* Card Content with responsive padding */}
        <div className="p-4 sm:p-6 pt-6 sm:pt-10 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-[#00491e] group-hover:text-[#f2b700] transition-colors leading-tight mb-2 line-clamp-2 sm:truncate">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 sm:line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 sm:h-6 w-5 sm:w-6 text-gray-400 group-hover:text-[#f2b700] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 ml-2 sm:ml-4" />
          </div>

          {/* Enhanced Stats Grid - Responsive */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-[#00491e]/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
              <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-[#00491e] mx-auto mb-1" />
              <div className="text-base sm:text-lg font-bold text-[#00491e]">{course.modules?.length || 0}</div>
              <div className="text-xs text-[#00491e] font-medium">Modules</div>
            </div>
            
            <div className="bg-[#f2b700]/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
              <Target className="h-4 sm:h-5 w-4 sm:w-5 text-[#f2b700] mx-auto mb-1" />
              <div className="text-base sm:text-lg font-bold text-[#f2b700]">{totalSections}</div>
              <div className="text-xs text-[#f2b700] font-medium">Sections</div>
            </div>
            
            {totalQuizzes > 0 ? (
              <div className="bg-[#00491e]/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <Trophy className="h-4 sm:h-5 w-4 sm:w-5 text-[#00491e] mx-auto mb-1" />
                <div className="text-base sm:text-lg font-bold text-[#00491e]">{totalQuizzes}</div>
                <div className="text-xs text-[#00491e] font-medium">Quizzes</div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                <Star className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-base sm:text-lg font-bold text-gray-500">-</div>
                <div className="text-xs text-gray-400 font-medium">Quizzes</div>
              </div>
            )}
          </div>

          {/* Module Preview with responsive height */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 flex-grow overflow-y-auto max-h-40 sm:max-h-none">
            <h4 className="text-sm font-bold text-[#00491e] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f2b700] rounded-full"></div>
              Course Modules
            </h4>
            {course.modules?.slice(0, 3).map((module, idx) => (
              <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#f2b700]/10 transition-all duration-200 border hover:border-[#f2b700]/30">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md`} style={{ backgroundColor: primaryColor }}>
                  <span className="text-xs sm:text-sm font-bold text-white">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#00491e] text-xs sm:text-sm truncate">
                    {module.title || `Module ${idx + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {module.sections?.length || 0} sections
                  </div>
                </div>
                <div className="w-5 sm:w-6 h-5 sm:h-6 bg-[#f2b700]/20 rounded-full flex items-center justify-center">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#f2b700] rounded-full"></div>
                </div>
              </div>
            ))}
            
            {course.modules?.length > 3 && (
              <div className="text-xs sm:text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <span className="font-medium">+{course.modules.length - 3} more modules</span>
              </div>
            )}
            
            {(!course.modules || course.modules.length === 0) && (
              <div className="text-xs sm:text-sm text-gray-400 italic text-center py-4 sm:py-6 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-200">
                <BookOpen className="h-6 sm:h-8 w-6 sm:w-8 text-gray-300 mx-auto mb-2" />
                No modules in this course yet
              </div>
            )}
          </div>

          {/* Assigned Users Section - Mobile Optimized */}
          {course.assignedUsers && course.assignedUsers.length > 0 && (
            <div className="border-t border-gray-100 pt-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Team Members</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {course.assignedUsers.length} enrolled
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {course.assignedUsers.slice(0, 4).map((user, idx) => (
                    <div
                      key={idx}
                      className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold border-2 sm:border-3 border-white shadow-md`}
                      style={{ backgroundColor: primaryColor }}
                      title={user}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {course.assignedUsers.length > 4 && (
                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 sm:border-3 border-white shadow-md">
                      +{course.assignedUsers.length - 4}
                    </div>
                  )}
                </div>
                
                {/* Hide user names on mobile if more than 4 users */}
                {course.assignedUsers.length <= 4 && (
                  <div className="flex flex-wrap gap-1 ml-2 hidden sm:flex">
                    {course.assignedUsers.slice(0, 2).map((user, idx) => (
                      <span key={idx} className="bg-[#f2b700]/20 text-[#00491e] text-xs px-2 py-1 rounded-full font-medium">
                        {user}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Action Button - Responsive */}
          <button 
            className={`w-full text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-bold text-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group transform hover:scale-105 flex-shrink-0 hover:opacity-90`}
            style={{ backgroundColor: primaryColor }}
          >
            <Play className="h-3 sm:h-4 w-3 sm:w-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm sm:text-base">Start Training</span>
            <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-[#f2b700]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
