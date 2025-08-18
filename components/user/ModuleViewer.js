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
  Award,
  Star,
  Volume2,
  Maximize,
  RotateCcw,
  Home
} from "lucide-react";

export default function ModuleViewer({ course: propCourse, onBack }) {
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showModuleList, setShowModuleList] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [activeCourse, setActiveCourse] = useState(propCourse);

  useEffect(() => {
    if (!propCourse) {
      // Note: In production, you should get this from your Firebase instead of localStorage
      const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
      if (savedCourses.length > 0) {
        setActiveCourse(savedCourses[0]);
      }
    }
  }, [propCourse]);

  if (!activeCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">No course data available. Please create a course first.</p>
        </div>
      </div>
    );
  }

  const currentModule = activeCourse.modules[currentModuleIdx];
  const currentSection = currentModule.sections[currentSectionIdx];

  // Calculate overall progress
  const totalSections = activeCourse.modules.reduce(
    (sum, module) => sum + module.sections.length,
    0
  );
  const completedSections =
    activeCourse.modules
      .slice(0, currentModuleIdx)
      .reduce((sum, module) => sum + module.sections.length, 0) +
    currentSectionIdx;
  const progress = (completedSections / totalSections) * 100;

  const isLastSection = currentSectionIdx === currentModule.sections.length - 1;
  const isLastModule = currentModuleIdx === activeCourse.modules.length - 1;

  // Generate consistent gradient for course
  const getGradientFromTitle = (title) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600", 
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-purple-500 to-pink-600"
    ];
    const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const gradient = getGradientFromTitle(activeCourse.title);

  const handleQuizSubmit = () => {
    const quizQuestions = currentModule.quizzes || [];
    const allCorrect = quizQuestions.every((q, i) => quizAnswers[i] === q.correctAnswer);

    if (allCorrect) {
      setQuizPassed(true);
      setShowCorrectAnswers(false);
    } else {
      setShowCorrectAnswers(true);
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = optionIndex;
      return updated;
    });
  };

  const goToNext = () => {
    if (!isLastSection) {
      setCurrentSectionIdx(currentSectionIdx + 1);
    } else if (!isLastModule) {
      setCurrentModuleIdx(currentModuleIdx + 1);
      setCurrentSectionIdx(0);
    }
    resetQuizState();
  };

  const goToPrevious = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(currentSectionIdx - 1);
    } else if (currentModuleIdx > 0) {
      setCurrentModuleIdx(currentModuleIdx - 1);
      setCurrentSectionIdx(activeCourse.modules[currentModuleIdx - 1].sections.length - 1);
    }
    resetQuizState();
  };

  const resetQuizState = () => {
    setQuizAnswers([]);
    setQuizPassed(false);
    setShowQuiz(false);
    setShowCorrectAnswers(false);
  };

  const selectModule = (moduleIndex) => {
    setCurrentModuleIdx(moduleIndex);
    setCurrentSectionIdx(0);
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
        videoId = url.split("youtu.be/")[1];
      }
      return { type: "youtube", url: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` };
    }

    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1];
      return { type: "vimeo", url: `https://player.vimeo.com/video/${videoId}` };
    }

    return { type: "unknown", url };
  };

  const embedUrl = currentSection.videoUrl ? getEmbedUrl(currentSection.videoUrl) : null;
  const base64Url = currentSection.videoBase64 ? { type: "local", url: currentSection.videoBase64 } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="group p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                aria-label="Back to courses"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {activeCourse.title}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600 font-medium">
                    Module {currentModuleIdx + 1} of {activeCourse.modules.length}
                  </p>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <p className="text-sm text-gray-600 font-medium">
                    Section {currentSectionIdx + 1} of {currentModule.sections.length}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowModuleList(!showModuleList)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-xl transition-all duration-300 border border-gray-200 hover:border-transparent hover:shadow-lg group"
            >
              <List className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Modules</span>
            </button>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Course Progress</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className={`bg-gradient-to-r ${gradient} h-3 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Module List Sidebar */}
      {showModuleList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <div className="bg-white/95 backdrop-blur-xl w-96 h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Training Modules</h2>
                <button
                  onClick={() => setShowModuleList(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">{activeCourse.modules.length} modules available</p>
            </div>
            
            <div className="p-6 space-y-4">
              {activeCourse.modules.map((module, idx) => (
                <button
                  key={idx}
                  onClick={() => selectModule(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 ${
                    currentModuleIdx === idx
                      ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow-lg scale-105`
                      : "hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      currentModuleIdx === idx 
                        ? "bg-white/20 text-white" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {module.title || `Module ${idx + 1}`}
                      </div>
                      <div className={`text-xs mt-1 flex items-center gap-2 ${
                        currentModuleIdx === idx ? "text-white/80" : "text-gray-500"
                      }`}>
                        <Target className="h-3 w-3" />
                        {module.sections.length} sections
                        {module.quizzes && module.quizzes.length > 0 && (
                          <>
                            <Trophy className="h-3 w-3" />
                            {module.quizzes.length} quiz{module.quizzes.length !== 1 ? 'zes' : ''}
                          </>
                        )}
                      </div>
                    </div>
                    {currentModuleIdx === idx && (
                      <CheckCircle className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setShowModuleList(false)}
          ></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Progress Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border border-white/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">{currentModuleIdx + 1}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentModule.title || `Module ${currentModuleIdx + 1}`}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {currentSection.title || `Section ${currentSectionIdx + 1}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Section {currentSectionIdx + 1} of {currentModule.sections.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Est. {Math.floor(Math.random() * 10) + 5} min</span>
                </div>
              </div>
            </div>
            
            {/* Circular Progress */}
            <div className="relative">
              <div className="w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="2"
                  />
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    strokeDasharray={`${progress}, 100`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{Math.round(progress)}%</span>
                  <span className="text-xs text-gray-500 font-medium">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={goToPrevious}
            disabled={currentModuleIdx === 0 && currentSectionIdx === 0}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              currentModuleIdx === 0 && currentSectionIdx === 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl hover:scale-105"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              {completedSections + 1} / {totalSections}
            </div>
          </div>

          <button
            onClick={goToNext}
            disabled={isLastModule && isLastSection}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              isLastModule && isLastSection
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : `text-white bg-gradient-to-r ${gradient} hover:shadow-xl hover:scale-105 shadow-lg`
            }`}
          >
            {isLastSection ? "Next Module" : "Next Section"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Enhanced Content Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Section Header */}
          <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4 opacity-20">
              <BookOpen className="h-16 w-16" />
            </div>
            <div className="relative">
              <h3 className="text-2xl font-bold mb-2">
                {currentSection.title || `Section ${currentSectionIdx + 1}`}
              </h3>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span className="text-sm font-medium">Learning Content</span>
                </div>
                {isLastSection && currentModule.quizzes && currentModule.quizzes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">Quiz Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Content */}
          <div className="p-8">
            {base64Url || embedUrl ? (
              <div className="relative">
                <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-6 border-4 border-gray-200">
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
                        <Volume2 className="h-12 w-12 mx-auto mb-4 text-red-400" />
                        <p className="font-semibold">Unsupported video type</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Video Controls */}
                <div className="flex justify-center gap-2 mb-6">
                  <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
                    <Volume2 className="h-4 w-4" />
                    <span>Video Learning</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No video available for this section</p>
                  <p className="text-gray-400 text-sm mt-2">Content may be text-based or will be added later</p>
                </div>
              </div>
            )}

            {/* Quiz Button */}
            {isLastSection && !showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowQuiz(true)}
                  className={`bg-gradient-to-r ${gradient} hover:shadow-2xl text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-3 mx-auto`}
                >
                  <Trophy className="h-5 w-5" />
                  Take Module Quiz
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quiz Section */}
        {showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-4 right-4 opacity-20">
                <Trophy className="h-16 w-16" />
              </div>
              <div className="relative flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Module Quiz</h3>
                  <p className="text-white/90 mt-1">Test your knowledge</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{quizAnswers.filter(a => a !== undefined).length}</div>
                  <div className="text-sm text-white/80">of {currentModule.quizzes.length}</div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {!quizPassed ? (
                <div className="space-y-8">
                  {currentModule.quizzes.map((q, index) => {
                    const userAnswer = quizAnswers[index];
                    const isAnswered = userAnswer !== undefined;

                    return (
                      <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                            {index + 1}
                          </div>
                          <p className="font-semibold text-gray-900 text-lg leading-relaxed">
                            {q.question}
                          </p>
                        </div>
                        
                        <div className="space-y-3 ml-12">
                          {q.options.map((option, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-4 px-6 py-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                                quizAnswers[index] === optIdx
                                  ? "bg-blue-50 border-blue-300 shadow-md scale-[1.02]"
                                  : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 hover:scale-[1.01]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${index}`}
                                checked={quizAnswers[index] === optIdx}
                                onChange={() => handleOptionSelect(index, optIdx)}
                                className="hidden"
                              />
                              <div className={`flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all ${
                                quizAnswers[index] === optIdx 
                                  ? "border-blue-500 bg-blue-500 shadow-lg" 
                                  : "border-gray-300 hover:border-blue-400"
                              }`}>
                                {quizAnswers[index] === optIdx && (
                                  <div className="h-3 w-3 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className="text-gray-800 font-medium flex-1">{option}</span>
                            </label>
                          ))}
                        </div>

                        {showCorrectAnswers && userAnswer !== q.correctAnswer && (
                          <div className="mt-4 ml-12 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
                            <div className="flex items-center gap-2 text-red-800">
                              <Target className="h-4 w-4" />
                              <span className="font-semibold">Correct answer:</span>
                              <span className="font-bold">{q.options[q.correctAnswer]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-6 flex justify-center gap-4">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length < currentModule.quizzes.length}
                      className={`py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        quizAnswers.length < currentModule.quizzes.length
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                      }`}
                    >
                      {quizAnswers.length < currentModule.quizzes.length 
                        ? `Answer ${currentModule.quizzes.length - quizAnswers.length} more question${currentModule.quizzes.length - quizAnswers.length !== 1 ? 's' : ''}`
                        : "Submit Quiz"
                      }
                    </button>
                    {showCorrectAnswers && (
                      <button
                        onClick={() => {
                          setQuizAnswers([]);
                          setShowCorrectAnswers(false);
                        }}
                        className="py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        Try Again
                      </button>
                    )}
                  </div>

                  {showCorrectAnswers && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                      <div className="text-red-600 mb-4">
                        <RotateCcw className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-semibold text-lg">Some answers were incorrect</p>
                        <p className="text-sm">Review the correct answers above and try again</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                    <div className="flex justify-center items-center mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h4 className="font-bold text-2xl text-gray-900">Great job!</h4>
                    <p className="text-gray-600 mt-2">You've answered all questions correctly.</p>
                  </div>

                  {!(isLastModule && isLastSection) ? (
                    <div className="text-center">
                      <button
                        onClick={goToNext}
                        className={`bg-gradient-to-r ${gradient} hover:shadow-2xl text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-3 mx-auto`}
                      >
                        {isLastSection ? "Continue to Next Module" : "Continue to Next Section"}
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Training Completed!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Congratulations on completing "{activeCourse.title}"
                      </p>
                      <button
                        onClick={onBack}
                        className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <Home className="h-5 w-5 mr-2" />
                        Back to Training Dashboard
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