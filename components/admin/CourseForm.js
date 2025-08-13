"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Select from "react-select";

export default function CourseForm() {
  const { addCourse, userList } = useAuth();
  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState([
    {
      title: "",
      sections: [
        {
          title: "",
          videoUrl: "",
          videoFile: null,
          videoBase64: "", // Added to store Base64 string temporarily
          videoType: "link", // 'link' or 'upload'
        },
      ],
      quizzes: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    },
  ]);
  const [assignedUser, setAssignedUser] = useState([]);
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [storageWarning, setStorageWarning] = useState(""); // Added for storage limit warnings

  const userOptions =
    userList?.map((user) => ({
      value: user,
      label: user.charAt(0).toUpperCase() + user.slice(1),
    })) || [];

  // Custom styles for react-select to match green theme
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#16a34a' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(22, 163, 74, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#16a34a',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#16a34a' 
        : state.isFocused 
        ? '#dcfce7' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#16a34a' : '#dcfce7',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#dcfce7',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#166534',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#166534',
      '&:hover': {
        backgroundColor: '#16a34a',
        color: 'white',
      },
    }),
  };

  // Load saved courses from local storage on mount
  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) {
      const parsedCourses = JSON.parse(savedCourses);

    }
    // if (userList && userList.length > 0) {
    //   setAssignedUser([{ value: userList[0], label: userList[0].charAt(0).toUpperCase() + userList[0].slice(1) }]);
    // }
  }, [userList]);

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        sections: [
          {
            title: "",
            videoUrl: "",
            videoFile: null,
            videoBase64: "",
            videoType: "link",
          },
        ],
        quizzes: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ],
      },
    ]);
  };

  const removeModule = (index) => {
    if (modules.length > 1) {
      const newModules = modules.filter((_, i) => i !== index);
      setModules(newModules);
    }
  };

  const addSection = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].sections.push({
      title: "",
      videoUrl: "",
      videoFile: null,
      videoBase64: "",
      videoType: "link",
    });
    setModules(newModules);
  };

  const removeSection = (moduleIndex, sectionIndex) => {
    const newModules = [...modules];
    if (newModules[moduleIndex].sections.length > 1) {
      newModules[moduleIndex].sections = newModules[
        moduleIndex
      ].sections.filter((_, i) => i !== sectionIndex);
      setModules(newModules);
    }
  };

  const addQuiz = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].quizzes.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setModules(newModules);
  };

  const removeQuiz = (moduleIndex, quizIndex) => {
    const newModules = [...modules];
    if (newModules[moduleIndex].quizzes.length > 1) {
      newModules[moduleIndex].quizzes = newModules[moduleIndex].quizzes.filter(
        (_, i) => i !== quizIndex
      );
      setModules(newModules);
    }
  };

  const updateModuleTitle = (index, value) => {
    const newModules = [...modules];
    newModules[index].title = value;
    setModules(newModules);
  };

  const updateSection = (moduleIndex, sectionIndex, field, value) => {
    const newModules = [...modules];
    newModules[moduleIndex].sections[sectionIndex][field] = value;
    setModules(newModules);
  };

  const updateQuizQuestion = (moduleIndex, quizIndex, value) => {
    const newModules = [...modules];
    newModules[moduleIndex].quizzes[quizIndex].question = value;
    setModules(newModules);
  };

  const updateQuizOption = (moduleIndex, quizIndex, optionIndex, value) => {
    const newModules = [...modules];
    newModules[moduleIndex].quizzes[quizIndex].options[optionIndex] = value;
    setModules(newModules);
  };

  const updateCorrectAnswer = (moduleIndex, quizIndex, answerIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].quizzes[quizIndex].correctAnswer = answerIndex;
    setModules(newModules);
  };

  const handleVideoTypeChange = (moduleIndex, sectionIndex, type) => {
    const newModules = [...modules];
    newModules[moduleIndex].sections[sectionIndex].videoType = type;
    if (type === "link") {
      newModules[moduleIndex].sections[sectionIndex].videoFile = null;
      newModules[moduleIndex].sections[sectionIndex].videoBase64 = "";
    } else {
      newModules[moduleIndex].sections[sectionIndex].videoUrl = "";
    }
    setModules(newModules);
  };

  const handleFileUpload = (moduleIndex, sectionIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (e.g., limit to 5MB to avoid local storage issues)
      if (file.size > 5 * 1024 * 1024) {
        setStorageWarning("Video file is too large. Please upload a file smaller than 5MB or use a video URL.");
        return;
      }

      // Convert file to Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const newModules = [...modules];
        newModules[moduleIndex].sections[sectionIndex].videoFile = file;
        newModules[moduleIndex].sections[sectionIndex].videoBase64 = event.target.result;
        setModules(newModules);
        setStorageWarning(""); // Clear warning if successful
      };
      reader.onerror = () => {
        setStorageWarning("Error reading the video file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const openModulePopup = (index) => {
    setCurrentModuleIndex(index);
    setShowModulePopup(true);
  };

const handleSubmit = async () => {
  if (
    courseTitle.trim() &&
    modules.some(
      (m) => m.title.trim() && m.sections.some((s) => s.title.trim())
    )
  ) {
    const processedModules = modules.map((module) => ({
      ...module,
      sections: module.sections.map((section) => {
        if (section.videoType === "upload" && section.videoFile) {
          return {
            ...section,
            videoUrl: "", // Clear URL if it exists
            videoFileName: section.videoFile.name, // Store file name
            videoBase64: section.videoBase64, // Store Base64 string
            isUploadedVideo: true,
          };
        }
        return section;
      }),
    }));

    const courseData = {
      title: courseTitle,
      modules: processedModules.filter((m) => m.title.trim()),
      assignedUsers: assignedUser.map((user) => user.value),
      createdAt: new Date().toISOString(), // Add this line
      id: Date.now(), // Also good to have a unique ID
    };

    // Save to local storage
    try {
      const existingCourses = JSON.parse(localStorage.getItem("courses") || "[]");
      // Clean up Base64 for storage (optional: store only metadata to save space)
      const courseDataForStorage = {
        ...courseData,
        modules: courseData.modules.map((module) => ({
          ...module,
          sections: module.sections.map((section) => ({
            ...section,
            // Optionally, omit videoBase64 to save space and store only metadata
            videoBase64: section.videoBase64 ? "Base64 data stored" : "",
          })),
        })),
      };
      existingCourses.push(courseDataForStorage);
      localStorage.setItem("courses", JSON.stringify(existingCourses));
      setStorageWarning("Course saved to local storage successfully!");
    } catch (error) {
      setStorageWarning("Failed to save course to local storage. Storage may be full.");
      console.error(error);
    }

    // Call addCourse (assuming it handles server-side or other logic)
    addCourse(courseData);

    // Reset form
    setCourseTitle("");
    setModules([
      {
        title: "",
        sections: [
          {
            title: "",
            videoUrl: "",
            videoFile: null,
            videoBase64: "",
            videoType: "link",
          },
        ],
        quizzes: [
          {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ],
      },
    ]);
    setAssignedUser([]);
    setStorageWarning("");
  } else {
    setStorageWarning("Please fill in the course title and at least one module with a section title.");
  }
};

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5 text-green-600" />
        Create New Training
      </h2>

      {storageWarning && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {storageWarning}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Title
          </label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="Enter training title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Users
          </label>
          <Select
            isMulti
            options={userOptions}
            value={assignedUser}
            onChange={setAssignedUser}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={selectStyles}
            isDisabled={!userList || userList.length === 0}
            placeholder="Select users..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Training Modules
            </h3>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div
                key={moduleIndex}
                className="border border-gray-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {module.title || `Module ${moduleIndex + 1}`}
                    </h4>
                    <button
                      onClick={() => openModulePopup(moduleIndex)}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Edit Content
                    </button>
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    📚 {module.sections.length} sections
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center gap-1">
                    ❓ {module.quizzes.length} quizzes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Create Training
        </button>
      </div>

      {/* Module Content Popup */}
      {showModulePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-green-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {modules[currentModuleIndex].title ||
                  `Module ${currentModuleIndex + 1}`}{" "}
                Content
              </h3>
              <button
                onClick={() => setShowModulePopup(false)}
                className="text-white hover:text-gray-200 p-1 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title
                </label>
                <input
                  type="text"
                  value={modules[currentModuleIndex].title}
                  onChange={(e) =>
                    updateModuleTitle(currentModuleIndex, e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter module title"
                />
              </div>

              <div className="space-y-8">
                {/* Sections */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    📚 Sections
                  </h4>
                  <div className="space-y-4">
                    {modules[currentModuleIndex].sections.map(
                      (section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="border border-gray-200 rounded-lg p-4 bg-green-50"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-gray-900">
                              Section {sectionIndex + 1}
                            </h5>
                            {modules[currentModuleIndex].sections.length >
                              1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSection(
                                    currentModuleIndex,
                                    sectionIndex
                                  )
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Section title"
                              value={section.title}
                              onChange={(e) =>
                                updateSection(
                                  currentModuleIndex,
                                  sectionIndex,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                            />

                            <div className="flex space-x-4 mb-3">
                              <div className="flex items-center">
                                <input
                                  id={`video-link-${currentModuleIndex}-${sectionIndex}`}
                                  type="radio"
                                  checked={section.videoType === "link"}
                                  onChange={() =>
                                    handleVideoTypeChange(
                                      currentModuleIndex,
                                      sectionIndex,
                                      "link"
                                    )
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <label
                                  htmlFor={`video-link-${currentModuleIndex}-${sectionIndex}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Video Link
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id={`video-upload-${currentModuleIndex}-${sectionIndex}`}
                                  type="radio"
                                  checked={section.videoType === "upload"}
                                  onChange={() =>
                                    handleVideoTypeChange(
                                      currentModuleIndex,
                                      sectionIndex,
                                      "upload"
                                    )
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <label
                                  htmlFor={`video-upload-${currentModuleIndex}-${sectionIndex}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Upload Video
                                </label>
                              </div>
                            </div>

                            {section.videoType === "link" ? (
                              <input
                                type="url"
                                placeholder="Video URL (YouTube, etc.)"
                                value={section.videoUrl}
                                onChange={(e) =>
                                  updateSection(
                                    currentModuleIndex,
                                    sectionIndex,
                                    "videoUrl",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                              />
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      currentModuleIndex,
                                      sectionIndex,
                                      e
                                    )
                                  }
                                  className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-green-100 file:text-green-700
                                  hover:file:bg-green-200 file:transition-colors"
                                />
                                {section.videoFile && (
                                  <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                                    Selected: {section.videoFile.name} ({(section.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => addSection(currentModuleIndex)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Quizzes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      ❓ Quizzes
                    </h4>
                    <button
                      type="button"
                      onClick={() => addQuiz(currentModuleIndex)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Quiz
                    </button>
                  </div>

                  <div className="space-y-4">
                    {modules[currentModuleIndex].quizzes.map(
                      (quiz, quizIndex) => (
                        <div
                          key={quizIndex}
                          className="border border-gray-200 rounded-lg p-4 bg-green-50"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-gray-900">
                              Quiz {quizIndex + 1}
                            </h5>
                            {modules[currentModuleIndex].quizzes.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeQuiz(currentModuleIndex, quizIndex)
                                }
                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question
                              </label>
                              <input
                                type="text"
                                value={quiz.question}
                                onChange={(e) =>
                                  updateQuizQuestion(
                                    currentModuleIndex,
                                    quizIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                                placeholder="Enter quiz question"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Options
                              </label>
                              <div className="space-y-2">
                                {quiz.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="radio"
                                      name={`correct-answer-${currentModuleIndex}-${quizIndex}`}
                                      checked={
                                        quiz.correctAnswer === optionIndex
                                      }
                                      onChange={() =>
                                        updateCorrectAnswer(
                                          currentModuleIndex,
                                          quizIndex,
                                          optionIndex
                                        )
                                      }
                                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) =>
                                        updateQuizOption(
                                          currentModuleIndex,
                                          quizIndex,
                                          optionIndex,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end rounded-b-xl">
              <button
                onClick={() => setShowModulePopup(false)}
                className="bg-[#00491e] hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}