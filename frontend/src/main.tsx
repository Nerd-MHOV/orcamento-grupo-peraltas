import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SidebarContextProvider } from './context/sidebarContext';
import { AuthContextProvider } from './context/authContext';
import { NotificationProvider } from './context/notification/notificationContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
        <AuthContextProvider>
          <SidebarContextProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SidebarContextProvider>
        </AuthContextProvider>
  </React.StrictMode>
)
