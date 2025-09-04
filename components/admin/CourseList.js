'use client';

import { useAuth } from '../../context/AuthContext';
import { BookOpen, ChevronDown, ChevronUp, Trash2, Users, PlayCircle, FileVideo, RefreshCw, Clock, Target, Trophy, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/app/firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function CourseList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load courses from Firebase on mount and set up real-time listener
  useEffect(() => {
    const loadCoursesFromFirebase = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const coursesQuery = query(
          collection(db, "courses"), 
          orderBy("createdAt", "desc")
        );
        
        const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
          const coursesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setCourses(coursesList);
          setIsLoading(false);
          console.log("Loaded courses from Firebase:", coursesList);
        }, (error) => {
          console.error("Error loading courses from Firebase:", error);
          setError("Failed to load courses from database.");
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up Firebase listener:", error);
        setError("Failed to connect to database.");
        setIsLoading(false);
      }
    };

    const unsubscribe = loadCoursesFromFirebase();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Manual refresh function
  const refreshCourses = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const coursesQuery = query(
        collection(db, "courses"), 
        orderBy("createdAt", "desc")
      );
      
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(coursesList);
      console.log("Refreshed courses from Firebase:", coursesList);
    } catch (error) {
      console.error("Error refreshing courses:", error);
      setError("Failed to refresh courses from database.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (courseId, moduleIndex) => {
    setExpandedModules((prev) => ({
      ...prev,
      [`${courseId}-${moduleIndex}`]: !prev[`${courseId}-${moduleIndex}`],
    }));
  };

  const getCourseModules = (course) => {
    return course.modules || [];
  };

  const getModuleSections = (module) => {
    if (module.sections) {
      return module.sections;
    }
    return [];
  };

  const getModuleTitle = (module, index) => {
    if (module.title) return module.title;
    if (module.sections?.[0]?.title) return module.sections[0].title;
    return `Module ${index + 1}`;
  };

  // Filter courses based on the logged-in user
  const filteredCourses = user?.role === 'admin'
    ? courses
    : courses.filter((course) =>
        course.assignedUsers?.includes(user?.username)
      );

  // Handle course deletion from Firebase
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      try {
        setIsLoading(true);
        
        await deleteDoc(doc(db, "courses", courseId));
        setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
        
        console.log("Course deleted successfully from Firebase");
      } catch (error) {
        console.error("Error deleting course from Firebase:", error);
        setError("Failed to delete course. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Calculate course stats
  const getTotalSections = (course) => {
    return course.modules?.reduce((sum, module) => 
      sum + (module.sections?.length || 0), 0) || 0;
  };

  const getTotalQuizzes = (course) => {
    return course.modules?.reduce((sum, module) => 
      sum + (module.quizzes?.length || 0), 0) || 0;
  };

  // Generate color for course
  const getColorFromTitle = (title) => {
    const colors = ['#00491e', '#f2b700'];
    const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12 col-span-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00491e]"></div>
      <span className="ml-3 text-gray-600 font-medium">Loading courses...</span>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#00491e] rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00491e]">
              {user?.role === 'admin' ? 'All Training Courses' : 'My Training Courses'}
            </h2>
            <p className="text-gray-600 text-sm">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshCourses}
          disabled={isLoading}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#f2b700]/20 text-[#00491e] rounded-xl hover:bg-[#f2b700]/30 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          title="Refresh courses"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-sm font-bold">!</span>
          </div>
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content - 2 Column Grid Layout */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto ">
        {isLoading && courses.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoadingSpinner />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 col-span-2 ">
            <div className="relative">
              <div className="w-24 h-24 bg-[#00491e]/10 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-[#00491e]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#00491e] mb-3">No Training Courses Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {user?.role === 'admin' ? 
                'Create your first training course to get started with the learning management system.' : 
                'No training courses have been assigned to you yet. Contact your administrator for access.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
            {filteredCourses.map((course) => {
              const primaryColor = getColorFromTitle(course.title);
              const totalSections = getTotalSections(course);
              const totalQuizzes = getTotalQuizzes(course);
              const modules = getCourseModules(course);

              return (
                <div
                  key={course.id}
                  className="bg-[#FFFFF0] cursor-pointer rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02] flex flex-col"
                >
                  {/* Course Header */}
                  <div className="p-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {course.title?.charAt(0)?.toUpperCase() || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-[#00491e] mb-1 line-clamp-2">
                              {course.title || 'Untitled Course'}
                            </h3>
                            {course.description && (
                              <p className="text-gray-600 text-xs line-clamp-2">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats Grid - Compact */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="bg-[#00491e]/10 rounded-lg p-2 text-center">
                            <BookOpen className="h-4 w-4 text-[#00491e] mx-auto mb-1" />
                            <div className="text-sm font-bold text-[#00491e]">{modules.length}</div>
                            <div className="text-xs text-[#00491e] font-medium">Modules</div>
                          </div>
                          
                          <div className="bg-[#f2b700]/10 rounded-lg p-2 text-center">
                            <Target className="h-4 w-4 text-[#f2b700] mx-auto mb-1" />
                            <div className="text-sm font-bold text-[#f2b700]">{totalSections}</div>
                            <div className="text-xs text-[#f2b700] font-medium">Sections</div>
                          </div>
                          
                          <div className="bg-[#00491e]/10 rounded-lg p-2 text-center">
                            <Trophy className="h-4 w-4 text-[#00491e] mx-auto mb-1" />
                            <div className="text-sm font-bold text-[#00491e]">{totalQuizzes}</div>
                            <div className="text-xs text-[#00491e] font-medium">Quizzes</div>
                          </div>
                          
                          <div className="bg-[#f2b700]/10 rounded-lg p-2 text-center">
                            <Clock className="h-4 w-4 text-[#f2b700] mx-auto mb-1" />
                            <div className="text-sm font-bold text-[#f2b700]">
                              {Math.floor(totalSections * 0.5) || 1}h
                            </div>
                            <div className="text-xs text-[#f2b700] font-medium">Time</div>
                          </div>
                        </div>

                        {/* Assigned Users - Compact */}
                        {course.assignedUsers && course.assignedUsers.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-700 flex-shrink-0">Team:</span>
                              <div className="flex -space-x-1 min-w-0">
                                {course.assignedUsers.slice(0, 2).map((username, idx) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: primaryColor }}
                                    title={username}
                                  >
                                    {username.charAt(0).toUpperCase()}
                                  </div>
                                ))}
                                {course.assignedUsers.length > 2 && (
                                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm flex-shrink-0">
                                    +{course.assignedUsers.length - 2}
                                  </div>
                                )}
                              </div>
                            </div>

                            {course.createdAt && (
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                {course.createdAt.toDate ? 
                                  course.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                                  new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300 ml-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex-shrink-0 cursor-pointer"
                          title="Delete training"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modules List - Scrollable */}
                  <div className="divide-y divide-gray-100 flex-1 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {modules.map((module, moduleIdx) => {
                        const sections = getModuleSections(module);
                        const isExpanded = expandedModules[`${course.id}-${moduleIdx}`];

                        return (
                          <div key={moduleIdx}>
                            <button
                              onClick={() => toggleModule(course.id, moduleIdx)}
                              className="w-full flex justify-between items-center p-4 hover:bg-[#f2b700]/5 transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {moduleIdx + 1}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h4 className="font-semibold text-[#00491e] text-sm group-hover:text-[#f2b700] transition-colors line-clamp-2">
                                    {getModuleTitle(module, moduleIdx)}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600 bg-[#00491e]/10 px-2 py-0.5 rounded-full font-medium">
                                      {sections.length} section{sections.length !== 1 ? 's' : ''}
                                    </span>
                                    {module.quizzes && module.quizzes.length > 0 && (
                                      <span className="text-xs text-[#f2b700] bg-[#f2b700]/10 px-2 py-0.5 rounded-full font-medium">
                                        {module.quizzes.length} quiz{module.quizzes.length !== 1 ? 'zes' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-[#00491e] group-hover:text-[#f2b700] transition-colors" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-[#00491e] group-hover:text-[#f2b700] transition-colors" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 bg-gray-50/50">
                                {sections.length > 0 ? (
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-[#00491e] flex items-center gap-2 mb-3">
                                      <div className="w-1.5 h-1.5 bg-[#f2b700] rounded-full"></div>
                                      Learning Sections ({sections.length})
                                    </h5>
                                    {sections.map((section, sectionIdx) => (
                                      <div
                                        key={sectionIdx}
                                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-[#f2b700]/30 transition-all duration-200"
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="w-6 h-6 bg-[#f2b700]/20 rounded-md flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-[#f2b700]">{sectionIdx + 1}</span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-[#00491e] mb-1 text-sm line-clamp-2">
                                              {section.title || `Section ${sectionIdx + 1}`}
                                            </h4>

                                            {section.videoUrl && !section.isUploadedVideo && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1 bg-[#00491e]/5 p-1.5 rounded-md">
                                                <PlayCircle className="h-3 w-3 text-[#00491e] flex-shrink-0" />
                                                <span className="font-medium flex-shrink-0">Video Link</span>
                                              </div>
                                            )}

                                            {section.isUploadedVideo && section.videoBase64 && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600 bg-[#f2b700]/5 p-1.5 rounded-md mb-2">
                                                <FileVideo className="h-3 w-3 text-[#f2b700] flex-shrink-0" />
                                                <span className="font-medium">Uploaded Video</span>
                                              </div>
                                            )}

                                            {section.quiz && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600 bg-yellow-50 p-1.5 rounded-md">
                                                <Trophy className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                                <span className="font-medium text-yellow-700 truncate">{section.quiz}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                      <BookOpen className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">No sections in this module</p>
                                  </div>
                                )}

                                {module.quizzes && module.quizzes.length > 0 && (
                                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                                    <h5 className="text-xs font-bold text-[#00491e] flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                      Module Quizzes ({module.quizzes.length})
                                    </h5>
                                    {module.quizzes.map((quiz, quizIdx) => (
                                      <div
                                        key={quizIdx}
                                        className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="w-6 h-6 bg-yellow-200 rounded-md flex items-center justify-center flex-shrink-0">
                                            <Trophy className="h-3 w-3 text-yellow-700" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-yellow-800 mb-1 text-sm line-clamp-2">
                                              Quiz {quizIdx + 1}: {quiz.question || 'Untitled Quiz'}
                                            </div>
                                            {quiz.options && quiz.options.length > 0 && (
                                              <div className="text-xs text-yellow-700 flex items-center gap-2">
                                                <span className="bg-yellow-200 px-1.5 py-0.5 rounded-full">
                                                  {quiz.options.length} options
                                                </span>
                                                {quiz.correctAnswer !== undefined && (
                                                  <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                                                    Correct: {quiz.correctAnswer + 1}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading overlay for operations */}
      {isLoading && courses.length > 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-3 text-[#00491e] bg-white p-4 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00491e]"></div>
            <span className="font-medium">Updating courses...</span>
          </div>
        </div>
      )}
    </div>
  );
}