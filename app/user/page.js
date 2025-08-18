'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/user/CourseCard';
import ModuleViewer from '../../components/user/ModuleViewer';
import { BookOpen, LogOut } from 'lucide-react';
import { db } from '@/app/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function UserPage() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Listen to Firestore in real-time
    const q = query(collection(db, 'courses'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter only the courses assigned to the logged-in user
      const userCourses = courseData.filter((course) =>
        course.assignedUsers?.includes(user.username)
      );

      setCourses(userCourses);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
    redirect('/admin');
  }

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Trainings</h1>
                  <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Trainings Assigned</h2>
              <p className="text-gray-600">Contact your administrator to get courses assigned to you.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Trainings ({courses.length})</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => {
                  // Calculate total sections across all modules
                  const totalSections = course.modules?.reduce(
                    (sum, module) => sum + (module.sections?.length || 0), 
                    0
                  ) || 0;

                  return (
                    <CourseCard 
                      key={course.id} 
                      course={{
                        ...course,
                        totalSections
                      }} 
                      onClick={() => setSelectedCourse(course)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <ModuleViewer course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
}
