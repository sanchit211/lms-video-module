'use client';

import { ChevronRight, BookOpen } from 'lucide-react';



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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 hover:border-green-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
          {course.title}
        </h3>
        <ChevronRight className="h-5 w-5 text-green-500 group-hover:text-green-700 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          📚 {course.modules?.length || 0} modules
        </span>
        <span className="flex items-center gap-1">
          📄 {totalSections} sections
        </span>
        {totalQuizzes > 0 && (
          <span className="flex items-center gap-1">
            ❓ {totalQuizzes} quizzes
          </span>
        )}
      </div>

      {/* Modules Preview */}
      <div className="space-y-2">
        {course.modules?.slice(0, 3).map((module, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="font-medium text-gray-800 truncate">
              {module.title || `Module ${idx + 1}`}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              ({module.sections?.length || 0} sections)
            </span>
          </div>
        ))}
        
        {course.modules?.length > 3 && (
          <div className="text-sm text-gray-500 pl-4">
            +{course.modules.length - 3} more modules
          </div>
        )}
        
        {(!course.modules || course.modules.length === 0) && (
          <div className="text-sm text-gray-400 italic text-center py-2">
            No modules in this course
          </div>
        )}
      </div>

      {/* Assigned Users (if available) */}
      {course.assignedUsers && course.assignedUsers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Assigned to:</div>
          <div className="flex flex-wrap gap-1">
            {course.assignedUsers.slice(0, 2).map((user, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {user}
              </span>
            ))}
            {course.assignedUsers.length > 2 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{course.assignedUsers.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}