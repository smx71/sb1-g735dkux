import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/components/auth/auth-provider';
import { Layout } from '@/components/layout';
import { HomePage } from '@/pages/home';
import { DashboardPage } from '@/pages/dashboard';
import { ProfilePage } from '@/pages/profile';
import { MeetingsPage } from '@/pages/meetings';
import { NewsPage } from '@/pages/news';
import { ContactList } from '@/components/contacts/contact-list';
import { MemberList } from '@/components/members/member-list';
import { AuthTestPage } from '@/pages/auth-test';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect authenticated users to their profile page if they try to access the root
  if (user && window.location.pathname === '/') {
    return <Navigate to="/dashboard/profile" />;
  }

  return user ? <Outlet /> : <Navigate to="/" />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth-test',
        element: <AuthTestPage />,
      },
      {
        path: 'news',
        element: <NewsPage />,
      },
      {
        path: 'about',
        element: <div>About Page</div>,
      },
      {
        path: 'work',
        element: <div>Our Work Page</div>,
      },
      {
        path: 'get-involved',
        element: <div>Get Involved Page</div>,
      },
      {
        path: 'contact',
        element: <div>Contact Page</div>,
      },
      {
        path: 'join',
        element: <div>Join WILPF Page</div>,
      },
      {
        path: 'donate',
        element: <div>Donations Page</div>,
      },
      {
        path: 'volunteer',
        element: <div>Volunteer Page</div>,
      },
      {
        path: 'sections',
        element: <div>Sections Page</div>,
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard/profile" />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'meetings',
            element: <MeetingsPage />,
          },
          {
            path: 'contacts',
            element: <ContactList />,
          },
          {
            path: 'members',
            element: <MemberList />,
          },
        ],
      },
    ],
  },
]);