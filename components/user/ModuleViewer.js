"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, List, CheckCircle } from "lucide-react";

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
      const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
      if (savedCourses.length > 0) {
        setActiveCourse(savedCourses[0]); // Load the first saved course
      }
    }
  }, [propCourse]);

  if (!activeCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No course data available. Please create a course first.</p>
      </div>
    );
  }



  const currentModule = activeCourse.modules[currentModuleIdx];
  const currentSection = currentModule.sections[currentSectionIdx];

  console.log("current module", currentModule);
  console.log("active course", activeCourse)

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

  const handleQuizSubmit = () => {
    const quizQuestions = currentModule.quizzes || [];
    const allCorrect = quizQuestions.every((q, i) => quizAnswers[i] === q.correctAnswer);

    if (allCorrect) {
      setQuizPassed(true);
      setShowCorrectAnswers(false);
    } else {
      setShowCorrectAnswers(true);
      alert("You have selected the wrong answers.");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Back to courses"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{activeCourse.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Module {currentModuleIdx + 1} of {activeCourse.modules.length} • 
                  Section {currentSectionIdx + 1} of {currentModule.sections.length}
                </p>
              </div>
            </div>
            {/* <button
              onClick={() => setShowModuleList(!showModuleList)}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <List className="h-4 w-4" />
              Module List
            </button> */}
          </div>
        </div>
      </header>

      {/* Module List Sidebar */}
      {showModuleList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-80 h-full overflow-y-auto p-4 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
              <button
                onClick={() => setShowModuleList(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {activeCourse.modules.map((module, idx) => (
                <button
                  key={idx}
                  onClick={() => selectModule(idx)}
                  className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                    currentModuleIdx === idx
                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="font-medium flex items-center">
                    {currentModuleIdx === idx && (
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    {module.title || `Module ${idx + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {module.sections.length} sections • {idx === currentModuleIdx ? "Current" : ""}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentModule.title || `Module ${currentModuleIdx + 1}`}
            </h2>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            Section {currentSectionIdx + 1} of {currentModule.sections.length}: {currentSection.title}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mb-6">
          <button
            onClick={goToPrevious}
            disabled={currentModuleIdx === 0 && currentSectionIdx === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentModuleIdx === 0 && currentSectionIdx === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => setShowModuleList(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <List className="h-4 w-4" />
            Modules
          </button>
          <button
            onClick={goToNext}
            disabled={isLastModule && isLastSection}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isLastModule && isLastSection
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            {isLastSection ? "Next Module" : "Next Section"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Current Section Content */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentSection.title || `Section ${currentSectionIdx + 1}`}
          </h3>

          {base64Url || embedUrl ? (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 shadow-md">
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
                <div className="flex items-center justify-center h-full text-red-500">
                  Unsupported video type
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
              <p className="text-gray-500">No video available for this section</p>
            </div>
          )}

          {isLastSection && !showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
            >
              Take Quiz
            </button>
          )}
        </div>

        {/* Quiz Section */}
        {showQuiz && Array.isArray(currentModule.quizzes) && currentModule.quizzes.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Section Quiz</h3>
              <span className="text-sm font-medium text-gray-500">
                {quizAnswers.filter(a => a !== undefined).length} of {currentModule.quizzes.length} answered
              </span>
            </div>

            {!quizPassed ? (
              <div className="space-y-6">
                {currentModule.quizzes.map((q, index) => {
                  const userAnswer = quizAnswers[index];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <div key={index} className="space-y-3">
                      <p className="font-medium text-gray-800">
                        <span className="text-blue-600 mr-2">{index + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                              quizAnswers[index] === optIdx
                                ? "bg-blue-50 border-blue-300"
                                : "border-gray-200 hover:border-blue-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={quizAnswers[index] === optIdx}
                              onChange={() => handleOptionSelect(index, optIdx)}
                              className="hidden"
                            />
                            <div className={`flex items-center justify-center h-5 w-5 rounded-full border ${
                              quizAnswers[index] === optIdx 
                                ? "border-blue-500 bg-blue-500" 
                                : "border-gray-300"
                            }`}>
                              {quizAnswers[index] === optIdx && (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
                            </div>
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>

                      {showCorrectAnswers && !isCorrect && (
                        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          Correct answer: <strong>{q.options[q.correctAnswer]}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-4">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={quizAnswers.length < currentModule.quizzes.length}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      quizAnswers.length < currentModule.quizzes.length
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    }`}
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Great job!</h4>
                    <p className="text-sm mt-1">You've answered all questions correctly.</p>
                  </div>
                </div>

                {!(isLastModule && isLastSection) ? (
                  <button
                    onClick={goToNext}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                  >
                    {isLastSection ? "Continue to Next Module" : "Continue to Next Section"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 text-center py-8 px-4 rounded-lg">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Training Completed!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Congratulations on completing "{activeCourse.title}"
                    </p>
                    <button
                      onClick={onBack}
                      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      Back to Training Dashboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}