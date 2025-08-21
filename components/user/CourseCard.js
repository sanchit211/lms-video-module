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
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Card Container with fixed height */}
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 backdrop-blur-sm h-[480px] flex flex-col">
        
        {/* Solid Color Header */}
        <div className={`h-32 relative overflow-hidden flex-shrink-0`} style={{ backgroundColor: "#00491e" }}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-2 right-8 w-16 h-16 bg-white/15 rounded-full blur-lg"></div>
            <div className="absolute top-8 right-12 w-8 h-8 bg-white/25 rounded-full blur-sm"></div>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">
              Training Course
            </div>
          </div>

          {/* Estimated Time */}
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4" />
              Est. {Math.floor(totalSections * 0.5) || 1}h {(totalSections * 30) % 60 || 30}m
            </div>
          </div>
        </div>

        {/* Card Content with flexible height */}
        <div className="p-6 pt-10 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-[#00491e] group-hover:text-[#f2b700] transition-colors leading-tight mb-2 truncate">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
            <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-[#f2b700] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 ml-4" />
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#00491e]/10 rounded-xl p-3 text-center">
              <BookOpen className="h-5 w-5 text-[#00491e] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#00491e]">{course.modules?.length || 0}</div>
              <div className="text-xs text-[#00491e] font-medium">Modules</div>
            </div>
            
            <div className="bg-[#f2b700]/10 rounded-xl p-3 text-center">
              <Target className="h-5 w-5 text-[#f2b700] mx-auto mb-1" />
              <div className="text-lg font-bold text-[#f2b700]">{totalSections}</div>
              <div className="text-xs text-[#f2b700] font-medium">Sections</div>
            </div>
            
            {totalQuizzes > 0 ? (
              <div className="bg-[#00491e]/10 rounded-xl p-3 text-center">
                <Trophy className="h-5 w-5 text-[#00491e] mx-auto mb-1" />
                <div className="text-lg font-bold text-[#00491e]">{totalQuizzes}</div>
                <div className="text-xs text-[#00491e] font-medium">Quizzes</div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Star className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-500">-</div>
                <div className="text-xs text-gray-400 font-medium">Quizzes</div>
              </div>
            )}
          </div>

          {/* Module Preview with fixed height */}
          <div className="space-y-3 mb-4 flex-grow overflow-y-auto">
            <h4 className="text-sm font-bold text-[#00491e] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f2b700] rounded-full"></div>
              Course Modules
            </h4>
            {course.modules?.slice(0, 3).map((module, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#f2b700]/10 transition-all duration-200 border hover:border-[#f2b700]/30">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md`} style={{ backgroundColor: primaryColor }}>
                  <span className="text-sm font-bold text-white">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#00491e] text-sm truncate">
                    {module.title || `Module ${idx + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {module.sections?.length || 0} sections
                  </div>
                </div>
                <div className="w-6 h-6 bg-[#f2b700]/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#f2b700] rounded-full"></div>
                </div>
              </div>
            ))}
            
            {course.modules?.length > 3 && (
              <div className="text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <span className="font-medium">+{course.modules.length - 3} more modules to explore</span>
              </div>
            )}
            
            {(!course.modules || course.modules.length === 0) && (
              <div className="text-sm text-gray-400 italic text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No modules in this course yet
              </div>
            )}
          </div>

          {/* Assigned Users Section */}
          {course.assignedUsers && course.assignedUsers.length > 0 && (
            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Team Members</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {course.assignedUsers.length} enrolled
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3">
                  {course.assignedUsers.slice(0, 4).map((user, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-3 border-white shadow-md`}
                      style={{ backgroundColor: primaryColor }}
                      title={user}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {course.assignedUsers.length > 4 && (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-3 border-white shadow-md">
                      +{course.assignedUsers.length - 4}
                    </div>
                  )}
                </div>
                
                {course.assignedUsers.length <= 4 && (
                  <div className="flex flex-wrap gap-1 ml-2">
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

          {/* Enhanced Action Button */}
          <button 
            className={`w-full text-white py-3 px-4 rounded-xl font-bold text-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group transform hover:scale-105 flex-shrink-0 hover:opacity-90`}
            style={{ backgroundColor: primaryColor }}
          >
            <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Start Training</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-[#f2b700]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
