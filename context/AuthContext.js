  'use client';

  import { createContext, useContext, useState, useEffect } from 'react';

  const AuthContext = createContext();

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };

  const users = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    alice: { username: 'alice', password: 'alice123', role: 'user' },
    bob: { username: 'bob', password: 'bob123', role: 'user' },
    charlie: { username: 'charlie', password: 'charlie123', role: 'user' }
  };

  const userList = ['alice', 'bob', 'charlie'];

  // Helper functions for localStorage
  const getLocalStorageItem = (key, defaultValue) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  };

  const setLocalStorageItem = (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage if available
    const [user, setUser] = useState(() => getLocalStorageItem('user', null));
    const [courses, setCourses] = useState(() => {
   const storedCourses = getLocalStorageItem('courses', [
      {
        id: 1,
        title: "Introduction to React",
        assignedUsers: ["alice"],
        modules: [
          {
            title: "What is React?",
            sections: [
              {
                title: "Intro to React",
                videoUrl: "https://www.youtube.com/watch?v=N3AkSS5hXMA",
                videoType: "link",
                videoFile: null
              }
            ],
            quizzes: [
              {
                question: "What is React primarily used for?",
                options: ["Building user interfaces", "Server-side rendering", "Database management", "Mobile app development"],
                correctAnswer: 0
              }
            ]
          }
        ]
      }
    ])
      
      // Migrate old single-assigned-user courses to multi-user format
      return storedCourses.map(course => {
        if (course.assignedUser && !course.assignedUsers) {
          return {
            ...course,
            assignedUsers: [course.assignedUser]
          };
        }
        return course;
      });
    });

    // Persist user to localStorage whenever it changes
    useEffect(() => {
      setLocalStorageItem('user', user);
    }, [user]);

    // Persist courses to localStorage whenever they change
    useEffect(() => {
      setLocalStorageItem('courses', courses);
    }, [courses]);

    const login = (username, password) => {
      const foundUser = users[username.toLowerCase()];
      if (foundUser && foundUser.password === password) {
        setUser(foundUser);
        return true;
      }
      return false;
    };

    const logout = () => {
      setUser(null);
    };

    console.log("couress----", courses)

    const addCourse = (course) => {
      const newCourse = { 
        ...course, 
        id: Date.now(),
        assignedUsers: course.assignedUsers || [course.assignedUser].filter(Boolean)
      };
      setCourses(prev => [...prev, newCourse]);
    };

    const getUserCourses = (username) => {
      return courses.filter(course => 
        course.assignedUsers?.includes(username)
      );
    };

    const deleteCourse = (courseId) => {
      setCourses(prev => prev.filter(course => course.id !== courseId));
    };

    return (
      <AuthContext.Provider value={{ 
        user, 
        login, 
        logout, 
        courses, 
        addCourse, 
        getUserCourses,
        userList,
        deleteCourse
      }}>
        {children}
      </AuthContext.Provider>
    );
  };