"use client";

import { useEffect, useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  List, 
  CheckCircle, 
  Play, 
  BookOpen, 
  Trophy, 
  Target, 
  Clock,
  Volume2,
  RotateCcw,
  Home,
  AlertCircle
} from "lucide-react";

// Firebase imports
import { db } from "@/app/firebaseConfig";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

export default function ModuleViewer({ course: propCourse, courseId, onBack }) {
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showModuleList, setShowModuleList] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [activeCourse, setActiveCourse] = useState(propCourse);
  const [completedSectionsCount, setCompletedSectionsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // THEME
  const SOLID = "#00491e";
  const GRADIENT = "from-green-500 to-teal-600";
  const gradientClass = `bg-gradient-to-r ${GRADIENT}`;
  const gradientBrClass = `bg-gradient-to-br ${GRADIENT}`;

  // Simple modal state for "View status"
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Firebase data fetching
  useEffect(() => {
    const fetchCourseData = async () => {
      if (propCourse) {
        setActiveCourse(propCourse);
        return;
      }

      if (!courseId) {
        await fetchFirstAvailableCourse();
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (courseSnap.exists()) {
          const courseData = { id: courseSnap.id, ...courseSnap.data() };
          setActiveCourse(courseData);
        } else {
          setError("Course not found");
          await fetchFirstAvailableCourse();
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [propCourse, courseId]);

  const fetchFirstAvailableCourse = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const firstCourse = querySnapshot.docs[0];
        const courseData = { id: firstCourse.id, ...firstCourse.data() };
        setActiveCourse(courseData);
      } else {
        setError("No courses available");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const saveProgressToFirebase = async (courseId, moduleIndex, sectionIndex, completedCount) => {
    try {
      const docId = `${courseId}_${getCurrentUserId()}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const progressRef = doc(db, 'courseProgress', docId);
      
      const progressData = {
        courseId: courseId,
        userId: getCurrentUserId(),
        currentModuleIndex: moduleIndex,
        currentSectionIndex: sectionIndex,
        completedSectionsCount: completedCount,
        lastUpdated: new Date(),
        progress: Math.min((completedCount / getTotalSections()) * 100, 100)
      };

      await setDoc(progressRef, progressData);
      console.log("Progress saved successfully!");
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const loadProgressFromFirebase = async (courseId) => {
    try {
      const progressRef = doc(db, 'courseProgress', `${courseId}_${getCurrentUserId()}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const progressData = progressSnap.data();
        setCurrentModuleIdx(progressData.currentModuleIndex || 0);
        setCurrentSectionIdx(progressData.currentSectionIndex || 0);
        setCompletedSectionsCount(progressData.completedSectionsCount || 0);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  const getCurrentUserId = () => {
    return localStorage.getItem('userId') || 'demo-user';
  };

  useEffect(() => {
    if (activeCourse?.id) {
      loadProgressFromFirebase(activeCourse.id);
    }
  }, [activeCourse?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mb-4" style={{ borderColor: SOLID, borderTopColor: "transparent" }}></div>
          <p className="text-gray-600 text-lg font-medium">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border" style={{ borderColor: SOLID }}>
          <AlertCircle className="h-16 w-16 mx-auto mb-4" style={{ color: SOLID }} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: SOLID }}
            >
              Retry
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: SOLID }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: SOLID }}>
            <BookOpen className="h-12 w-12 text-white" />
          </div>
          <p className="text-gray-600 text-lg">No course data available. Please create a course first.</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: SOLID }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentModule = activeCourse.modules[currentModuleIdx];
  const currentSection = currentModule.sections[currentSectionIdx];

  const getTotalSections = () => {
    return activeCourse.modules.reduce(
      (sum, module) => sum + module.sections.length,
      0
    );
  };

  const totalSections = getTotalSections();
  const completedSections =
    activeCourse.modules
      .slice(0, currentModuleIdx)
      .reduce((sum, module) => sum + module.sections.length, 0) +
    currentSectionIdx;

  // Display progress (clamped for the bar)
  const progress = Math.min((completedSectionsCount / totalSections) * 100, 100);

  // Status logic based on RAW value (not clamped), per your requirement
  const rawProgress = totalSections > 0 ? (completedSectionsCount / totalSections) * 100 : 0;

  const statusFromProgress = (value) => {
    if (value === 0) return "not_started";
    if (value === 100) return "completed";
    return "in_progress";
  };

  const status = statusFromProgress(rawProgress);
  const statusMeta = (() => {
    switch (status) {
      case "not_started":
        return { label: "Not started", icon: "⏳", className: "text-white", style: { backgroundColor: SOLID } };
      case "in_progress":
        return { label: "In progress", icon: "🚧", className: "text-white", style: { backgroundColor: SOLID } };
      case "completed":
        return { label: "You have successfully completed the training", icon: "✅", className: "text-white", classGradient: gradientClass };
      default:
        return { label: "In progress", icon: "🚧", className: "text-white", style: { backgroundColor: SOLID } };
    }
  })();

  const isLastSection = currentSectionIdx === currentModule.sections.length - 1;
  const isLastModule = currentModuleIdx === activeCourse.modules.length - 1;

  const handleQuizSubmit = () => {
    const quizQuestions = currentModule.quizzes || [];
    const allCorrect = quizQuestions.every((q, i) => quizAnswers[i] === q.correctAnswer);

    if (allCorrect) {
      setQuizPassed(true);
      setShowCorrectAnswers(false);
      const currentSections = activeCourse.modules
        .slice(0, currentModuleIdx)
        .reduce((sum, module) => sum + module.sections.length, 0) + currentModule.sections.length;
      setCompletedSectionsCount(currentSections);
      if (activeCourse.id) {
        saveProgressToFirebase(activeCourse.id, currentModuleIdx, currentSectionIdx, currentSections);
      }
    } else {
      setShowCorrectAnswers(true);
    }
  };

  const goToNext = async () => {
    const currentSections = activeCourse.modules
      .slice(0, currentModuleIdx)
      .reduce((sum, module) => sum + module.sections.length, 0) + currentSectionIdx + 1;
      
    let newModuleIdx = currentModuleIdx;
    let newSectionIdx = currentSectionIdx;

    if (isLastSection) {
      if (currentModule.quizzes && currentModule.quizzes.length > 0) {
        if (quizPassed) {
          setCompletedSectionsCount(currentSections);
        }
      } else {
        setCompletedSectionsCount(currentSections);
      }
    } else {
      setCompletedSectionsCount(currentSections);
    }

    if (!isLastSection) {
      newSectionIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(newSectionIdx);
    } else if (!isLastModule) {
      newModuleIdx = currentModuleIdx + 1;
      newSectionIdx = 0;
      setCurrentModuleIdx(newModuleIdx);
      setCurrentSectionIdx(newSectionIdx);
    }

    if (activeCourse.id) {
      await saveProgressToFirebase(activeCourse.id, newModuleIdx, newSectionIdx, currentSections);
    }

    resetQuizState();
  };

  const goToPrevious = async () => {
    let newModuleIdx = currentModuleIdx;
    let newSectionIdx = currentSectionIdx;

    if (currentSectionIdx > 0) {
      newSectionIdx = currentSectionIdx - 1;
      setCurrentSectionIdx(newSectionIdx);
    } else if (currentModuleIdx > 0) {
      newModuleIdx = currentModuleIdx - 1;
      newSectionIdx = activeCourse.modules[currentModuleIdx - 1].sections.length - 1;
      setCurrentModuleIdx(newModuleIdx);
      setCurrentSectionIdx(newSectionIdx);
    }

    if (activeCourse.id && (newModuleIdx !== currentModuleIdx || newSectionIdx !== currentSectionIdx)) {
      await saveProgressToFirebase(activeCourse.id, newModuleIdx, newSectionIdx, completedSectionsCount);
    }

    resetQuizState();
  };

  const resetQuizState = () => {
    setQuizAnswers([]);
    setQuizPassed(false);
    setShowQuiz(false);
    setShowCorrectAnswers(false);
  };

  const selectModule = async (moduleIndex) => {
    setCurrentModuleIdx(moduleIndex);
    setCurrentSectionIdx(0);
    if (activeCourse.id) {
      await saveProgressToFirebase(activeCourse.id, moduleIndex, 0, completedSectionsCount);
    }
    resetQuizState();
    setShowModuleList(false);
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.match(/\.(mp4|webm|ogg)$/)) {
      return { type: "local", url };
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("v=")) {
        videoId = url.split("v=")[1];
        const ampersandPosition = videoId.indexOf("&");
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/");
      }
      return { type: "youtube", url: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` };
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/");
      return { type: "vimeo", url: `https://player.vimeo.com/video/${videoId}` };
    }
    return { type: "unknown", url };
  };

  const embedUrl = currentSection.videoUrl ? getEmbedUrl(currentSection.videoUrl) : null;
  const base64Url = currentSection.videoBase64 ? { type: "local", url: currentSection.videoBase64 } : null;

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  return (
 <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f9fafb 0%, #ecfdf5 50%, #f0fdf4 100%)" }}>
  {/* Header - Fully Responsive */}
  <header className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-40" style={{ borderBottom: `1px solid ${SOLID}20` }}>
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="flex justify-between items-center py-3 sm:py-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="group p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 border flex-shrink-0"
            style={{ borderColor: `${SOLID}33` }}
            aria-label="Back to courses"
          >
            <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5" style={{ color: SOLID }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-teal-700 truncate">
              {activeCourse.title}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm">
              <p className="font-medium" style={{ color: SOLID }}>
                Module {currentModuleIdx + 1}/{activeCourse.modules.length}
              </p>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: SOLID }}></div>
              <p className="font-medium" style={{ color: SOLID }}>
                Section {currentSectionIdx + 1}/{currentModule.sections.length}
              </p>
            </div>

            {/* Status row - Mobile optimized */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span
                className={[
                  "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold",
                  statusMeta.classGradient ? statusMeta.classGradient : "",
                  statusMeta.className || ""
                ].join(" ")}
                style={statusMeta.style || {}}
                title="Training status"
              >
                <span className="text-xs sm:text-sm">{statusMeta.icon}</span>
                <span className="hidden sm:inline">{statusMeta.label}</span>
                <span className="sm:hidden">{statusMeta.label.split(' ')[0]}</span>
              </span>

              <button
                type="button"
                className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: SOLID }}
                onClick={() => setShowStatusModal(true)}
              >
                <span className="hidden sm:inline">View status</span>
                <span className="sm:hidden">Status</span>
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowModuleList(!showModuleList)}
          className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 border ${gradientClass} text-white cursor-pointer flex-shrink-0`}
          style={{ borderColor: "transparent" }}
        >
          <List className="h-3 sm:h-4 w-3 sm:w-4" />
          <span className="hidden sm:inline md:inline">Modules</span>
        </button>
      </div>
      
      {/* Progress Bar - Mobile optimized */}
      <div className="pb-3 sm:pb-4">
        <div className="flex justify-between items-center mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-semibold" style={{ color: SOLID }}>Course Progress</span>
          <span className="text-xs sm:text-sm font-bold text-teal-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full rounded-full h-2 sm:h-3 shadow-inner" style={{ backgroundColor: `${SOLID}1A` }}>
          <div
            className={`h-2 sm:h-3 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden ${gradientClass}`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </header>

  {/* Status Modal - Mobile optimized */}
  {showStatusModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 border" style={{ borderColor: `${SOLID}22` }}>
        <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: SOLID }}>Training Status</h3>
        <p className="mb-4 text-sm sm:text-base" style={{ color: `${SOLID}CC` }}>
          {statusMeta.label}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg text-white text-sm"
            style={{ backgroundColor: SOLID }}
            onClick={() => setShowStatusModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Module List Sidebar - Fully responsive */}
  {showModuleList && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      <div className="bg-white/95 backdrop-blur-xl w-full sm:w-80 lg:w-96 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-4 sm:p-6" style={{ borderBottom: `1px solid ${SOLID}20` }}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: SOLID }}>Training Modules</h2>
            <button
              onClick={() => setShowModuleList(false)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-4 sm:h-5 w-4 sm:w-5" style={{ color: SOLID }} />
            </button>
          </div>
          <p className="text-xs sm:text-sm mt-2" style={{ color: `${SOLID}CC` }}>{activeCourse.modules.length} modules available</p>
        </div>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {activeCourse.modules.map((module, idx) => (
            <button
              key={idx}
              onClick={() => selectModule(idx)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 border-2 ${
                currentModuleIdx === idx
                  ? `${gradientClass} text-white border-transparent shadow-lg scale-[1.02]`
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              style={currentModuleIdx === idx ? {} : { borderColor: `${SOLID}33` }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base ${
                    currentModuleIdx === idx ? "bg-white/20 text-white" : ""
                  }`}
                  style={currentModuleIdx === idx ? {} : { backgroundColor: `${SOLID}10`, color: SOLID }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base truncate" style={{ color: currentModuleIdx === idx ? "white" : SOLID }}>
                    {module.title || `Module ${idx + 1}`}
                  </div>
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 sm:gap-2 flex-wrap`}
                    style={{ color: currentModuleIdx === idx ? "rgba(255,255,255,0.8)" : `${SOLID}99` }}
                  >
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{module.sections.length} sections</span>
                    </div>
                    {module.quizzes && module.quizzes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span>{module.quizzes.length} quiz{module.quizzes.length !== 1 ? 'zes' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                {currentModuleIdx === idx && (
                  <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-white flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 sm:block" onClick={() => setShowModuleList(false)}></div>
    </div>
  )}

  <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
    {/* Progress Section - Mobile optimized */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl" style={{ border: `1px solid ${SOLID}14` }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className={`w-10 sm:w-12 h-10 sm:h-12 ${gradientBrClass} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-base sm:text-lg">{currentModuleIdx + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate" style={{ color: SOLID }}>
                {currentModule.title || `Module ${currentModuleIdx + 1}`}
              </h2>
              <p className="font-medium text-sm sm:text-base truncate" style={{ color: `${SOLID}CC` }}>
                {currentSection.title || `Section ${currentSectionIdx + 1}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2" style={{ color: `${SOLID}CC` }}>
              <Target className="h-3 sm:h-4 w-3 sm:w-4" />
              <span>Section {currentSectionIdx + 1} of {currentModule.sections.length}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2" style={{ color: `${SOLID}CC` }}>
              <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
              <span>Est. {Math.floor(Math.random() * 10) + 5} min</span>
            </div>
          </div>
        </div>
        
        {/* Circular Progress - Responsive sizing */}
        <div className="relative mx-auto lg:mx-0">
          <div className="w-20 sm:w-24 h-20 sm:h-24">
            <svg className="w-20 sm:w-24 h-20 sm:h-24 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="2"
              />
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke={`url(#ringGradient)`}
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg font-bold" style={{ color: SOLID }}>{Math.round(progress)}%</span>
              <span className="text-xs font-medium" style={{ color: `${SOLID}99` }}>Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Navigation - Mobile optimized */}
    <div className="flex justify-between items-center mb-6 sm:mb-8 gap-2">
      <button
        onClick={goToPrevious}
        disabled={currentModuleIdx === 0 && currentSectionIdx === 0}
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 text-white`}
        style={{
          backgroundColor: currentModuleIdx === 0 && currentSectionIdx === 0 ? `${SOLID}33` : SOLID,
          cursor: currentModuleIdx === 0 && currentSectionIdx === 0 ? "not-allowed" : "pointer"
        }}
      >
        <ChevronLeft className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full" style={{ border: `1px solid ${SOLID}33`, color: SOLID }}>
        <div className="text-xs sm:text-sm font-medium">
          {completedSections + 1} / {totalSections}
        </div>
      </div>

      <button
        onClick={goToNext}
        disabled={isLastModule && isLastSection}
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 text-white ${gradientClass}`}
        style={{
          opacity: isLastModule && isLastSection ? 0.5 : 1,
          cursor: isLastModule && isLastSection ? "not-allowed" : "pointer"
        }}
      >
        <span className="hidden sm:inline">{isLastSection ? "Next Module" : "Next Section"}</span>
        <span className="sm:hidden">{isLastSection ? "Next Mod" : "Next Sec"}</span>
        <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
      </button>
    </div>

    {/* Content Section - Mobile optimized */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden" style={{ borderColor: `${SOLID}14` }}>
      {/* Section Header */}
      <div className={`${gradientClass} p-4 sm:p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-20">
          <BookOpen className="h-12 sm:h-16 w-12 sm:w-16 text-white" />
        </div>
        <div className="relative">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 pr-16 sm:pr-20">
            {currentSection.title || `Section ${currentSectionIdx + 1}`}
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 text-white/90 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <Play className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Learning Content</span>
            </div>
            {isLastSection && currentModule.quizzes && currentModule.quizzes.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Trophy className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Quiz Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Content - Mobile optimized */}
      <div className="p-4 sm:p-6 lg:p-8">
        {base64Url || embedUrl ? (
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl mb-4 sm:mb-6 border-2 sm:border-4" style={{ borderColor: `${SOLID}22` }}>
              {base64Url?.type === "local" || embedUrl?.type === "local" ? (
                <video 
                  controls 
                  className="w-full h-full" 
                  src={base64Url?.url || embedUrl?.url} 
                  playsInline
                />
              ) : embedUrl?.type === "youtube" || embedUrl?.type === "vimeo" ? (
                <iframe
                  src={embedUrl.url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={currentSection.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-red-500 bg-red-50">
                  <div className="text-center">
                    <Volume2 className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-2 sm:mb-4 text-red-400" />
                    <p className="font-semibold text-sm sm:text-base">Unsupported video type</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Controls */}
            <div className="flex justify-center gap-2 mb-4 sm:mb-6">
              <div className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white" style={{ backgroundColor: SOLID }}>
                <Volume2 className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
                <span>Video Learning</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 sm:h-64 rounded-lg sm:rounded-2xl border-2 border-dashed" style={{ background: `${SOLID}08`, borderColor: `${SOLID}33` }}>
            <div className="text-center px-4">
              <Play className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-2 sm:mb-4" style={{ color: SOLID }} />
              <p className="text-base sm:text-lg font-medium" style={{ color: SOLID }}>No video available for this section</p>
              <p className="text-xs sm:text-sm mt-2" style={{ color: `${SOLID}99` }}>Content may be text-based or will be added later</p>
            </div>
          </div>
        )}

        {/* Quiz Button - Mobile optimized */}
        {isLastSection && !showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowQuiz(true)}
              className={`${gradientClass} cursor-pointer hover:shadow-2xl text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base`}
            >
              <Trophy className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="hidden sm:inline">Take Module Quiz</span>
              <span className="sm:hidden">Take Quiz</span>
              <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Quiz Section - Mobile optimized */}
    {showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
      <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border overflow-hidden" style={{ borderColor: `${SOLID}14` }}>
        {/* Quiz Header */}
        <div className={`${gradientClass} p-4 sm:p-6 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 opacity-20">
            <Trophy className="h-12 sm:h-16 w-12 sm:w-16 text-white" />
          </div>
          <div className="relative flex justify-between items-center">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Module Quiz</h3>
              <p className="text-white/90 mt-1 text-sm sm:text-base">Test your knowledge</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold">{quizAnswers.filter(a => a !== undefined).length}</div>
              <div className="text-xs sm:text-sm text-white/80">of {currentModule.quizzes.length}</div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {!quizPassed ? (
            <div className="space-y-6 sm:space-y-8">
              {currentModule.quizzes.map((q, index) => {
                const userAnswer = quizAnswers[index];
                const isAnswered = userAnswer !== undefined;

                return (
                  <div key={index} className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border" style={{ backgroundColor: `${SOLID}05`, borderColor: `${SOLID}22` }}>
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className={`w-6 sm:w-8 h-6 sm:h-8 ${gradientBrClass} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 mt-1`}>
                        {index + 1}
                      </div>
                      <p className="font-semibold text-base sm:text-lg leading-relaxed" style={{ color: SOLID }}>
                        {q.question}
                      </p>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 ml-9 sm:ml-12">
                      {q.options.map((option, optIdx) => {
                        const selected = quizAnswers[index] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 ${selected ? "shadow-md scale-[1.02]" : ""}`}
                            style={{
                              borderColor: selected ? `${SOLID}66` : `${SOLID}22`,
                              backgroundColor: selected ? `${SOLID}0F` : "white"
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={selected}
                              onChange={() => handleOptionSelect(index, optIdx)}
                              className="hidden"
                            />
                            <div
                              className="flex items-center justify-center h-5 sm:h-6 w-5 sm:w-6 rounded-full border-2 transition-all flex-shrink-0"
                              style={{
                                borderColor: selected ? SOLID : `${SOLID}66`,
                                backgroundColor: selected ? SOLID : "transparent",
                                boxShadow: selected ? `0 0 0 2px ${SOLID}33` : "none"
                              }}
                            >
                              {selected && <div className="h-2 sm:h-3 w-2 sm:w-3 rounded-full bg-white"></div>}
                            </div>
                            <span className="font-medium flex-1 text-sm sm:text-base" style={{ color: SOLID }}>{option}</span>
                          </label>
                        );
                      })}
                    </div>

                    {showCorrectAnswers && isAnswered && userAnswer !== q.correctAnswer && (
                      <div className="mt-4 ml-9 sm:ml-12 p-3 sm:p-4 rounded-r-xl" style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444" }}>
                        <div className="flex items-center gap-2 flex-wrap" style={{ color: "#991b1b" }}>
                          <Target className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base">Correct answer:</span>
                          <span className="font-bold text-sm sm:text-base">{q.options[q.correctAnswer]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={handleQuizSubmit}
                  disabled={quizAnswers.length < currentModule.quizzes.length}
                  className={`py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 text-white w-full sm:w-auto`}
                  style={{
                    backgroundColor: quizAnswers.length < currentModule.quizzes.length ? `${SOLID}33` : SOLID,
                    cursor: quizAnswers.length < currentModule.quizzes.length ? "not-allowed" : "pointer"
                  }}
                >
                  {quizAnswers.length < currentModule.quizzes.length 
                    ? `Answer ${currentModule.quizzes.length - quizAnswers.length} more`
                    : "Submit Quiz"
                  }
                </button>
                {showCorrectAnswers && (
                  <button
                    onClick={() => {
                      setQuizAnswers([]);
                      setShowCorrectAnswers(false);
                    }}
                    className="py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg text-white w-full sm:w-auto"
                    style={{ backgroundColor: SOLID }}
                  >
                    Try Again
                  </button>
                )}
              </div>

              {showCorrectAnswers && (
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center" style={{ backgroundColor: "#fef2f2", border: "2px solid #fecaca" }}>
                  <div className="mb-4" style={{ color: "#dc2626" }}>
                    <RotateCcw className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2" />
                    <p className="font-semibold text-base sm:text-lg">Some answers were incorrect</p>
                    <p className="text-sm text-red-700">Review the correct answers above and try again</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center" style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}>
                <div className="flex justify-center items-center mb-4">
                  <CheckCircle className="h-10 sm:h-12 w-10 sm:w-12" style={{ color: SOLID }} />
                </div>
                <h4 className="font-bold text-xl sm:text-2xl" style={{ color: SOLID }}>Great job!</h4>
                <p className="mt-2 text-sm sm:text-base" style={{ color: `${SOLID}CC` }}>You've answered all questions correctly.</p>
              </div>

              {!(isLastModule && isLastSection) ? (
                <div className="text-center">
                  <button
                    onClick={goToNext}
                    className={`${gradientClass} hover:shadow-2xl text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base w-full sm:w-auto justify-center`}
                  >
                    <span className="hidden sm:inline">{isLastSection ? "Continue to Next Module" : "Continue to Next Section"}</span>
                    <span className="sm:hidden">{isLastSection ? "Next Module" : "Next Section"}</span>
                    <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center" style={{ background: "linear-gradient(90deg, #eff6ff 0%, #ecfdf5 100%)", border: "2px solid #bfdbfe" }}>
                  <div className="text-4xl sm:text-5xl mb-4">🎉</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: SOLID }}>
                    Training Completed!
                  </h3>
                  <p className="mb-4 sm:mb-6 text-sm sm:text-base px-4" style={{ color: `${SOLID}CC` }}>
                    Congratulations on completing "{activeCourse.title}"
                  </p>
                  <button
                    onClick={onBack}
                    className="inline-flex items-center justify-center text-white font-bold py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                    style={{ backgroundColor: SOLID }}
                  >
                    <Home className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-white" />
                    <span className="hidden sm:inline">Back to Training Dashboard</span>
                    <span className="sm:hidden">Back to Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

  );
}
