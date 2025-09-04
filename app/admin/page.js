'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import CourseForm from '../../components/admin/CourseForm';
import CourseList from '../../components/admin/CourseList';
import { useState } from 'react';
import { Play, Plus, User, BookOpen, LogOut, Upload, Trash2, ChevronRight, Home, Settings, BarChart3, Menu, X } from 'lucide-react';
import Image from 'next/image';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!user) {
    redirect('/');
  }

  if (user.role !== 'admin') {
    redirect('/user');
  }

  const sidebarItems = [
    { id: 'create', label: 'Create Training', icon: Plus },
    { id: 'courses', label: 'All Trainings', icon: BookOpen },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Close mobile sidebar when selecting a tab
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex relative">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
    <div
  className={`
    ${sidebarCollapsed ? 'w-20' : 'w-80'} 
    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    fixed lg:relative z-50 min-h-screen
    bg-white/90 backdrop-blur-xl shadow-xl border-r border-gray-200/50 flex flex-col
    transition-all duration-300 ease-in-out
  `}
>
        {/* Logo & User Info */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <Image
                src="/subway_navbar_logo.png"
                alt="Logo"
                width={sidebarCollapsed ? 40 : 60}
                height={sidebarCollapsed ? 24 : 36}
                className="rounded-lg transition-all duration-300"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00491e] rounded-full border-2 border-white"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-[#00491e] truncate">Admin Portal</h1>
                <p className="text-sm text-gray-600 truncate">Welcome, {user?.username}</p>
              </div>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-[#00491e]/10 hover:bg-[#00491e]/20 rounded-lg transition-all duration-300 hover:scale-105"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronRight className={`h-4 w-4 text-[#00491e] transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation Menu can add flex-1 in div so logout goes at bottom */}
        <div className=" p-4"> 
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${
                    isActive
                      ? 'bg-[#00491e] text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-[#f2b700]/10 hover:scale-105'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform flex-shrink-0`} />
                  {!sidebarCollapsed && <span className="font-medium truncate">{item.label}</span>}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats in Sidebar */}
          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-[#f2b700]/10 rounded-2xl border border-[#f2b700]/30">
              <h3 className="text-sm font-semibold text-[#00491e] mb-3">Admin Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Role</span>
                  <span className="font-bold text-[#00491e]">Administrator</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions</span>
                  <span className="font-bold text-[#f2b700]">Full Access</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105 group ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            {sidebarCollapsed && (
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-[#00491e]/10 hover:bg-[#00491e]/20 rounded-xl transition-all duration-300 hover:scale-105"
              >
                {mobileSidebarOpen ? (
                  <X className="h-5 w-5 text-[#00491e]" />
                ) : (
                  <Menu className="h-5 w-5 text-[#00491e]" />
                )}
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-[#00491e]">
                  {activeTab === 'create' && 'Create New Training'}
                  {activeTab === 'courses' && 'All Training Courses'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'create' && 'Design and build comprehensive training programs'}
                  {activeTab === 'courses' && 'Manage and monitor all training courses'}
                </p>
              </div>
            </div>
            
            {/* Header Action Button - Only show on desktop or when needed */}
            <div className="hidden sm:block">
              {activeTab === 'courses' && (
                <button 
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00491e] text-white rounded-xl hover:bg-[#00491e]/90 transition-all duration-300 font-medium hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  New Training
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'create' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#00491e] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#00491e]">Training Course Builder</h2>
                      <p className="text-gray-600 text-sm">Create engaging and comprehensive training programs for your team</p>
                    </div>
                  </div>
                  
                  {/* Quick Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#00491e]/5 rounded-xl p-4 border border-[#00491e]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-[#00491e] flex-shrink-0" />
                        <span className="text-sm font-semibold text-[#00491e]">Structure</span>
                      </div>
                      <p className="text-xs text-gray-600">Organize content into modules and sections for better learning flow</p>
                    </div>
                    
                    <div className="bg-[#f2b700]/5 rounded-xl p-4 border border-[#f2b700]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-[#f2b700] flex-shrink-0" />
                        <span className="text-sm font-semibold text-[#f2b700]">Assignment</span>
                      </div>
                      <p className="text-xs text-gray-600">Assign trainings to specific team members for targeted training</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-green-600">Interactive</span>
                      </div>
                      <p className="text-xs text-gray-600">Add videos, quizzes, and assessments to enhance engagement</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <CourseForm />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="max-w-8xl mx-auto">
              <div className="mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f2b700] rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#00491e]">Training Management</h2>
                        <p className="text-gray-600 text-sm">Monitor, edit, and manage all training courses</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleTabChange('create')}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#00491e] text-white rounded-xl hover:bg-[#00491e]/90 transition-all duration-300 font-medium hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      New Training
                    </button>

                    {/* Mobile Action Button */}
                    <button 
                      onClick={() => handleTabChange('create')}
                      className="sm:hidden flex items-center justify-center w-10 h-10 bg-[#00491e] text-white rounded-xl hover:bg-[#00491e]/90 transition-all duration-300 hover:scale-105"
                      title="New Training"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Management Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#00491e]/10 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 bg-[#00491e] rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg font-bold text-[#00491e]">5</div>
                      <div className="text-xs text-gray-600">Total Courses</div>
                    </div>
                    
                    <div className="bg-[#f2b700]/10 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 bg-[#f2b700] rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg font-bold text-[#f2b700]">12</div>
                      <div className="text-xs text-gray-600">Assigned Users</div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg font-bold text-blue-600">8</div>
                      <div className="text-xs text-gray-600">Active Sessions</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg font-bold text-green-600">78%</div>
                      <div className="text-xs text-gray-600">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CourseList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}