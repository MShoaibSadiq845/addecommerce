'use client';

import React, { useState, useEffect } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetContactMessagesQuery,
  useMarkContactAsReadMutation,
} from '@/store/services/notificationsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { CheckCheck, Flame, ShoppingCart, Info, Loader2, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLoading } from '@/context/LoadingContext';
import Pagination from '@/components/ui/Pagination';

export default function AdminNotificationsPage() {
  const { setLoading } = useLoading();

  const {
    data: notifications = [],
    isLoading,
    isFetching: isFetchingNotifs,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: contactMessages = [],
    isLoading: isLoadingContacts,
    isFetching: isFetchingContacts,
  } = useGetContactMessagesQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [markContactAsRead] = useMarkContactAsReadMutation();

  // Track which single notification id is being marked read
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingContactId, setMarkingContactId] = useState<string | null>(null);

  // Pagination states (10 per page)
  const [notifPage, setNotifPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);

  useEffect(() => {
    setLoading(isLoading || isLoadingContacts || isFetchingNotifs || isFetchingContacts);
    return () => setLoading(false);
  }, [isLoading, isLoadingContacts, isFetchingNotifs, isFetchingContacts, setLoading]);

  const handleMarkOne = async (id: string) => {
    setMarkingId(id);
    try {
      await markAsRead(id).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mark notification as read.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(undefined).unwrap();
      toast.success('All notifications marked as read.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mark all as read.');
    }
  };

  const handleMarkContact = async (id: string) => {
    setMarkingContactId(id);
    try {
      await markContactAsRead(id).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mark contact message as read.');
    } finally {
      setMarkingContactId(null);
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const unreadContactCount = contactMessages.filter((c: any) => !c.isRead).length;

  const itemsPerPage = 10;

  // Paginated notifications
  const notifTotalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (notifPage - 1) * itemsPerPage,
    notifPage * itemsPerPage
  );

  // Paginated contact messages
  const contactTotalPages = Math.ceil(contactMessages.length / itemsPerPage);
  const paginatedContactMessages = contactMessages.slice(
    (contactPage - 1) * itemsPerPage,
    contactPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-8 font-['Rubik'] max-w-5xl mx-auto">
      {/* System & Sales Notifications Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System &amp; Sales Notifications</h1>
            <p className="text-xs text-gray-400 font-['Open_Sans']">
              Real-time Socket.IO sales alerts and customer order dispatches
            </p>
          </div>

          <button
            onClick={handleMarkAll}
            disabled={isMarkingAll || unreadCount === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                Marking all…
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4 text-green-600" />
                Mark All as Read
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-xs font-semibold">
            No notifications dispatched yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedNotifications.map((n: any) => {
              let icon = <Info className="w-5 h-5 text-blue-500" />;
              if (n.type === 'sale') icon = <Flame className="w-5 h-5 text-red-500" />;
              if (n.type === 'order') icon = <ShoppingCart className="w-5 h-5 text-green-600" />;

              const isThisMarking = markingId === n._id;

              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && !isThisMarking && handleMarkOne(n._id)}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.isRead
                      ? 'bg-white border-gray-100 cursor-default'
                      : 'bg-blue-50/50 border-blue-200 shadow-sm font-semibold cursor-pointer hover:bg-blue-50'
                  } ${isThisMarking ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                      {icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-sm text-gray-900">{n.title}</h3>
                      <p className="text-xs text-gray-600">{n.message}</p>
                      <span className="text-[10px] text-gray-400 font-['Open_Sans'] mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 mt-1.5">
                    {isThisMarking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : !n.isRead ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                    ) : null}
                  </div>
                </div>
              );
            })}

            <Pagination
              currentPage={notifPage}
              totalPages={notifTotalPages}
              onPageChange={setNotifPage}
              totalItems={notifications.length}
              itemsPerPage={itemsPerPage}
              className="mt-2"
            />
          </div>
        )}
      </div>

      {/* Customer Contact Messages Section */}
      <div className="flex flex-col gap-6 border-t-2 border-gray-100 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Contact Messages</h2>
            <p className="text-xs text-gray-400 font-['Open_Sans']">
              Messages submitted via Customer Support contact form
            </p>
          </div>

          {unreadContactCount > 0 && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold">
              <Mail className="w-4 h-4" />
              {unreadContactCount} Unread Message{unreadContactCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {isLoadingContacts ? (
          <TableSkeleton rows={4} />
        ) : contactMessages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-xs font-semibold">
            No customer messages yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedContactMessages.map((msg: any) => {
              const isThisMarking = markingContactId === msg._id;

              return (
                <div
                  key={msg._id}
                  onClick={() => !msg.isRead && !isThisMarking && handleMarkContact(msg._id)}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    msg.isRead
                      ? 'bg-white border-gray-100 cursor-default'
                      : 'bg-purple-50/50 border-purple-200 shadow-sm font-semibold cursor-pointer hover:bg-purple-50'
                  } ${isThisMarking ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-gray-900">{msg.name}</h3>
                          <p className="text-xs text-gray-500">{msg.email}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-['Open_Sans'] whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 mb-1">Subject: {msg.subject}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 mt-1.5">
                    {isThisMarking ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    ) : !msg.isRead ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 block" />
                    ) : null}
                  </div>
                </div>
              );
            })}

            <Pagination
              currentPage={contactPage}
              totalPages={contactTotalPages}
              onPageChange={setContactPage}
              totalItems={contactMessages.length}
              itemsPerPage={itemsPerPage}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
