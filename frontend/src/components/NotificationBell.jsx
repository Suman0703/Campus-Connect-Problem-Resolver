import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function NotificationBell() {
  const { notifications, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        aria-label="View notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Alerts</h4>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">No new alerts</p>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}