'use client';

import { useAuth } from '../../context/AuthContext';
import { BookOpen, ChevronDown, ChevronUp, Trash2, Users, PlayCircle, FileVideo, RefreshCw } from 'lucide-react';
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
        
        // Create a query to get courses ordered by creation date (newest first)
        const coursesQuery = query(
          collection(db, "courses"), 
          orderBy("createdAt", "desc")
        );
        
        // Set up real-time listener
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

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up Firebase listener:", error);
        setError("Failed to connect to database.");
        setIsLoading(false);
      }
    };

    const unsubscribe = loadCoursesFromFirebase();
    
    // Cleanup function
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
        
        // Delete from Firebase
        await deleteDoc(doc(db, "courses", courseId));
        
        // Update local state immediately for better UX
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

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-3 text-gray-600">Loading courses...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          {user?.role === 'admin' ? 'All Trainings' : 'My Trainings'}
          <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
            {filteredCourses.length}
          </span>
        </h2>
        
        <button
          onClick={refreshCourses}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh courses"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {isLoading && courses.length === 0 ? (
          <LoadingSpinner />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="bg-green-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-lg font-medium text-gray-600 mb-2">No trainings found</p>
            <p className="text-sm text-gray-500">
              {user?.role === 'admin' ? 'Create your first training to get started' : 'No trainings have been assigned to you yet'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-green-300 transition-all duration-200 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {course.title || 'Untitled Course'}
                  </h3>
                  <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">
                        Assigned to: {course.assignedUsers?.join(', ') || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      <span>📚</span>
                      <span className="font-medium">{getCourseModules(course).length} modules</span>
                    </div>
                    {course.createdAt && (
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span>📅</span>
                        <span className="font-medium">
                          {course.createdAt.toDate ? 
                            course.createdAt.toDate().toLocaleDateString() : 
                            new Date(course.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete training"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {getCourseModules(course).map((module, moduleIdx) => {
                  const sections = getModuleSections(module);
                  const isExpanded = expandedModules[`${course.id}-${moduleIdx}`];

                  return (
                    <div key={moduleIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(course.id, moduleIdx)}
                        className="w-full flex justify-between items-center p-4 bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <span className="text-sm font-semibold text-gray-800">
                            {getModuleTitle(module, moduleIdx)}
                          </span>
                          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border">
                            {sections.length} section{sections.length !== 1 ? 's' : ''}
                          </span>
                          {module.quizzes && module.quizzes.length > 0 && (
                            <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded-full">
                              ❓ {module.quizzes.length} quiz{module.quizzes.length !== 1 ? 'zes' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-white border-t border-green-100">
                          {sections.length > 0 ? (
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                📚 Sections ({sections.length})
                              </h5>
                              {sections.map((section, sectionIdx) => (
                                <div
                                  key={sectionIdx}
                                  className="border-l-3 border-green-300 pl-4 py-2 bg-green-50 rounded-r-lg"
                                >
                                  <h4 className="text-sm font-medium text-gray-800 mb-2">
                                    {section.title || `Section ${sectionIdx + 1}`}
                                  </h4>

                                  {section.videoUrl && !section.isUploadedVideo && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                      <PlayCircle className="h-3 w-3 text-green-600" />
                                      <span>Video Link:</span>
                                      <a
                                        href={section.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 hover:underline truncate max-w-xs"
                                      >
                                        {section.videoUrl}
                                      </a>
                                    </div>
                                  )}

                                  {section.isUploadedVideo && section.videoBase64 && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                        <FileVideo className="h-3 w-3 text-green-600" />
                                        <span>Uploaded Video:</span>
                                        <span className="text-green-600 font-medium">
                                          {section.videoFileName || 'Uploaded Video'}
                                        </span>
                                      </div>
                                      <video
                                        controls
                                        src={section.videoBase64}
                                        className="w-full max-w-md rounded-lg"
                                        playsInline
                                      />
                                    </div>
                                  )}

                                  {section.quiz && (
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <span>❓</span>
                                      <span>Quiz:</span>
                                      <span className="text-green-700 font-medium">{section.quiz}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg text-center">
                              No sections in this module
                            </div>
                          )}

                          {module.quizzes && module.quizzes.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                ❓ Quizzes ({module.quizzes.length})
                              </h5>
                              {module.quizzes.map((quiz, quizIdx) => (
                                <div
                                  key={quizIdx}
                                  className="border-l-3 border-yellow-300 pl-4 py-2 bg-yellow-50 rounded-r-lg"
                                >
                                  <div className="text-sm font-medium text-gray-800 mb-1">
                                    Quiz {quizIdx + 1}: {quiz.question || 'Untitled Quiz'}
                                  </div>
                                  {quiz.options && quiz.options.length > 0 && (
                                    <div className="text-xs text-gray-600">
                                      <span>{quiz.options.length} options</span>
                                      {quiz.correctAnswer !== undefined && (
                                        <span className="ml-2 text-green-600 font-medium">
                                          ✓ Correct: Option {quiz.correctAnswer + 1}
                                        </span>
                                      )}
                                    </div>
                                  )}
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
          ))
        )}
      </div>

      {/* Loading overlay for operations */}
      {isLoading && courses.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="flex items-center gap-2 text-green-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}