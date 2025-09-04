"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2,X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Select , { components } from "react-select";
import { db } from "@/app/firebaseConfig";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { apiGet } from "@/utils/api";

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
          videoDownloadUrl: "", // Store Firebase Storage download URL
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
  const [storageWarning, setStorageWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [students, setStudents] = useState([]);

  // Initialize Firebase Storage
  const storage = getStorage();

  const fetchData = async () => {
  const data = await apiGet('students');
  const uniqueStudents = data.filter((student, index, self) => 
    index === self.findIndex(s => s.id === student.id)
  );
  setStudents(uniqueStudents);
};

  useEffect(() => {
    fetchData();
  }, []);

  const userOptions =
    students?.map((user) => ({
      value: user?.id,
      label: `${user.firstname} ${user.lastname}`,
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

  // Load saved courses from Firebase on mount
  useEffect(() => {
    const loadCoursesFromFirebase = async () => {
      try {
        const coursesCollection = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Loaded courses from Firebase:", coursesList);
      } catch (error) {
        console.error("Error loading courses from Firebase:", error);
        setStorageWarning("Failed to load courses from database.");
      }
    };

    loadCoursesFromFirebase();
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
            videoDownloadUrl: "",
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
      videoDownloadUrl: "",
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
      newModules[moduleIndex].sections[sectionIndex].videoDownloadUrl = "";
    } else {
      newModules[moduleIndex].sections[sectionIndex].videoUrl = "";
    }
    setModules(newModules);
  };

  // Upload video to Firebase Storage
  const uploadVideoToStorage = async (file, moduleIndex, sectionIndex) => {
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}_${moduleIndex}_${sectionIndex}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      // Set upload progress
      setUploadProgress(prev => ({
        ...prev,
        [`${moduleIndex}-${sectionIndex}`]: 0
      }));

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Clear upload progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`${moduleIndex}-${sectionIndex}`];
        return newProgress;
      });

      return downloadURL;
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`${moduleIndex}-${sectionIndex}`];
        return newProgress;
      });
      throw error;
    }
  };

  const handleFileUpload = async (moduleIndex, sectionIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (Firebase Storage can handle larger files, but let's keep a reasonable limit)
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setStorageWarning("Video file is too large. Please upload a file smaller than 100MB.");
        return;
      }

      try {
        setStorageWarning("Uploading video to Firebase Storage...");
        
        // Upload to Firebase Storage and get download URL
        const downloadURL = await uploadVideoToStorage(file, moduleIndex, sectionIndex);
        
        // Update the modules state with the download URL
        const newModules = [...modules];
        newModules[moduleIndex].sections[sectionIndex].videoFile = file;
        newModules[moduleIndex].sections[sectionIndex].videoDownloadUrl = downloadURL;
        setModules(newModules);
        
        setStorageWarning("Video uploaded successfully!");
        setTimeout(() => setStorageWarning(""), 3000);
      } catch (error) {
        console.error("Error uploading video:", error);
        setStorageWarning("Error uploading video. Please try again.");
      }
    }
  };

  const openModulePopup = (index) => {
    setCurrentModuleIndex(index);
    setShowModulePopup(true);
  };

  const saveCourseToFirebase = async (courseData) => {
    try {
      setIsLoading(true);
      
      // Process modules for Firebase storage
      const processedModules = courseData.modules.map((module) => ({
        ...module,
        sections: module.sections.map((section) => {
          if (section.videoType === "upload" && section.videoDownloadUrl) {
            return {
              title: section.title,
              videoUrl: section.videoDownloadUrl, // Use Firebase Storage URL
              videoFileName: section.videoFile?.name || "Uploaded Video",
              videoType: section.videoType,
              isUploadedVideo: true,
            };
          }
          return {
            title: section.title,
            videoUrl: section.videoUrl,
            videoType: section.videoType,
            isUploadedVideo: false,
          };
        }),
      }));

      const courseDataForFirebase = {
        title: courseData.title,
        modules: processedModules,
        assignedUsers: courseData.assignedUsers,
        createdAt: serverTimestamp(),
        createdBy: "current_user", // You can replace this with actual user ID from auth context
      };

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "courses"), courseDataForFirebase);
      
      setStorageWarning("Course saved to Firebase successfully!");
      console.log("Course saved with ID: ", docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error("Error saving course to Firebase:", error);
      setStorageWarning("Failed to save course to Firebase. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      courseTitle.trim() &&
      modules.some(
        (m) => m.title.trim() && m.sections.some((s) => s.title.trim())
      )
    ) {
      // Check if any videos are still uploading
      const hasUploadingVideos = Object.keys(uploadProgress).length > 0;
      if (hasUploadingVideos) {
        setStorageWarning("Please wait for all videos to finish uploading.");
        return;
      }

      const courseData = {
        title: courseTitle,
        modules: modules.filter((m) => m.title.trim()),
        assignedUsers: assignedUser.map((user) => user.value),
        createdAt: new Date().toISOString(),
        id: Date.now(),
      };

      try {
        // Save to Firebase
        await saveCourseToFirebase(courseData);

        // Call addCourse (assuming it handles other logic like context updates)
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
                videoDownloadUrl: "",
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
        
        // Clear warning after successful save
        setTimeout(() => {
          setStorageWarning("");
        }, 3000);
      } catch (error) {
        console.error("Submit error:", error);
      }
    } else {
      setStorageWarning("Please fill in the course title and at least one module with a section title.");
    }
  };

const SoftMenu = (props) => (
  <AnimatePresence>
    {props.selectProps.menuIsOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{
          duration: 0.45,
          ease: [0.52, 1, 0.76, 1], // a softer "ease-out" curve
        }}
        style={{ originX: 0.5, originY: 0 }}
      >
        <components.Menu {...props} />
      </motion.div>
    )}
  </AnimatePresence>
);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5 text-green-600" />
        Create New Training
      </h2>

      {storageWarning && (
        <div className={`mb-4 p-3 rounded-lg ${
          storageWarning.includes("successfully") 
            ? "bg-green-100 text-green-700" 
            : storageWarning.includes("Uploading") 
            ? "bg-blue-100 text-blue-700"
            : "bg-red-100 text-red-700"
        }`}>
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
            disabled={isLoading}
          />
        </div>

    <div className="space-y-2">
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
        isDisabled={!students || students.length === 0 || isLoading}
        placeholder="Select users..."
        components={{ Menu: SoftMenu }}
      />
    </div>

        {/* <div>
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
            isDisabled={!students || students.length === 0 || isLoading}
            placeholder="Select users..."
          />
        </div> */}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Training Modules
            </h3>
            <button
              type="button"
              onClick={addModule}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit Content
                    </button>
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={isLoading || Object.keys(uploadProgress).length > 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving to Firebase...
            </>
          ) : Object.keys(uploadProgress).length > 0 ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading Videos...
            </>
          ) : (
            "Create Training"
          )}
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
                disabled={isLoading}
                className="text-white hover:text-gray-200 p-1 rounded transition-colors disabled:opacity-50"
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
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:opacity-50"
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
                            {modules[currentModuleIndex].sections.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeSection(currentModuleIndex, sectionIndex)
                                }
                                disabled={isLoading}
                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
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
                              disabled={isLoading}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors disabled:opacity-50"
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
                                  disabled={isLoading}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                />
                                <label
                                  htmlFor={`video-link-${currentModuleIndex}-${sectionIndex}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Video Link
                                </label>
                              </div>
                              {/* <div className="flex items-center">
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
                                  disabled={isLoading}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 disabled:opacity-50"
                                />
                                <label
                                  htmlFor={`video-upload-${currentModuleIndex}-${sectionIndex}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Upload Video
                                </label>
                              </div> */}
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
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors disabled:opacity-50"
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
                                  disabled={isLoading || uploadProgress[`${currentModuleIndex}-${sectionIndex}`] !== undefined}
                                  className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-green-100 file:text-green-700
                                  hover:file:bg-green-200 file:transition-colors
                                  disabled:opacity-50"
                                />
                                
                                {uploadProgress[`${currentModuleIndex}-${sectionIndex}`] !== undefined && (
                                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                    Uploading video to Firebase Storage...
                                  </div>
                                )}
                                
                                {section.videoFile && section.videoDownloadUrl && (
                                  <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
                                    ✅ Uploaded: {section.videoFile.name} ({(section.videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                  </div>
                                )}
                                
                                {section.videoFile && !section.videoDownloadUrl && !uploadProgress[`${currentModuleIndex}-${sectionIndex}`] && (
                                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                    ❌ Upload failed. Please try again.
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
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={isLoading}
                                className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
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
                                disabled={isLoading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors disabled:opacity-50"
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
                                      disabled={isLoading}
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 disabled:opacity-50"
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
                                      disabled={isLoading}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors disabled:opacity-50"
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
                disabled={isLoading}
                className="bg-[#00491e] hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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