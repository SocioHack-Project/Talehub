// frontend/src/components/AppContent.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import ReaderPanel from './ReaderPanel';
import ReviewerPanel from './ReviewPanel';
import AuthorPanel from './AuthorPanel';
import EditorPanel from './EditorPanel';
import { useAuth } from './authentication/Auth';

const AppContent = () => {
    const { auth } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            {auth?.role === 'reader' && (
                <Route path="/reader/:storyId" element={<ReaderPanel />} />
            )}
            {auth?.role === 'reviewer' && (
                <Route path="/reviewer/:storyId" element={<ReviewerPanel />} />
            )}
            {auth?.role === 'author' && (
                <Route path="/author/:storyId" element={<AuthorPanel />} />
            )}
            {auth?.role === 'editor' && (
                <Route path="/editor/:storyId" element={<EditorPanel />} />
            )}
            {/* Redirects to login if route is not authenticated */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
export default AppContent;