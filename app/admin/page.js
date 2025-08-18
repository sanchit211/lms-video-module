'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CourseForm from '../../components/admin/CourseForm';
import CourseList from '../../components/admin/CourseList';
import { Play, Plus, User, BookOpen, LogOut, Upload, Trash2, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const { user, logout } = useAuth();


  if (!user) {
    redirect('/');
  }

  if (user.role !== 'admin') {
    redirect('/user');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
             <Image
                   src="/subway_navbar_logo.png"   // place image in public/my-logo.png
                   alt="Logo"
                   width={102}
                   height={62}
                   className="rounded-lg"
                 />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CourseForm />
          <CourseList />
        </div>
      </div>
    </div>
  );
}