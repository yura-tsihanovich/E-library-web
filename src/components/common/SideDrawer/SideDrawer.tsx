import { Drawer } from "antd";
import styles from "./SideDrawer.module.scss";
import Close from "../../../assets/images/icons/Close.svg";
import { useDispatch } from "react-redux";
import { useLazySelector } from "../../../hooks";
import {
  getAllNotifications,
  markAsRead,
  setDrawerOpen,
} from "../../../modules/Home/slices/home";
import { useEffect, useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import ChatSpinner from "../ChatSpinner";
import { useTranslation } from "react-i18next";

interface NotificationTimeProps {
  sentAt: string | Date;
}

interface Notification {
  id: string;
  imageUrl: string;
  title: string;
  notificationType: string;
  sentAt: string;
  content: string;
  isRead: boolean;
}

const NotificationTime = ({ sentAt }: NotificationTimeProps) => (
  <div className={styles.timeSent}>
    {formatDistanceToNow(new Date(sentAt), { addSuffix: true })}
  </div>
);

const SideDrawer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isDrawerOpen, notifications, isLoading } = useLazySelector(
    ({ home }) => {
      const { isDrawerOpen, notifications } = home;
      const { isLoading } = notifications;
      return {
        isDrawerOpen,
        notifications,
        isLoading,
      };
    }
  );

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const notificationListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Закрытие боковой панели
  const onClose = () => {
    if (readNotificationIds.length > 0) {
      dispatch(markAsRead({ ids: readNotificationIds }));
    }
    dispatch(setDrawerOpen(false));
    setReadNotificationIds([]);
  };

  // Загрузка уведомлений при открытии панели
  useEffect(() => {
    if (isDrawerOpen) {
      setPage(1);
      dispatch(
        getAllNotifications({ limit: "10", page: "1", order: "", filter: "" })
      );
    }
  }, [dispatch, isDrawerOpen]);

  // Загрузка следующих 10 уведомлений при прокрутке вниз
  const handleScroll = () => {
    const list = notificationListRef.current;
    if (
      list &&
      list.scrollHeight - list.scrollTop <= list.clientHeight + 50 &&
      !isLoading
    ) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        dispatch(
          getAllNotifications({
            limit: "10",
            page: String(nextPage),
            order: "",
            filter: "",
          })
        );
        return nextPage;
      });
    }
  };

  // Callback для IntersectionObserver
  const markAsReadIfVisible = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-id");
          if (id && !readNotificationIds.includes(id)) {
            setReadNotificationIds((prev) => [...prev, id]);
          }
        }
      });
    },
    [readNotificationIds]
  );

  // Инициализация IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(markAsReadIfVisible, {
      root: notificationListRef.current,
      threshold: 0.5, // Считать элемент видимым, если он наполовину в зоне видимости
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [markAsReadIfVisible]);

  // Подключение наблюдателя к уведомлениям
  useEffect(() => {
    if (notificationListRef.current) {
      const items = notificationListRef.current.querySelectorAll(
        `.${styles.notificationWrap}`
      );
      items.forEach((item) => observerRef.current?.observe(item));
    }
  }, [notifications]);

  return (
    <div className="site-drawer-render-in-current-wrapper">
      <Drawer
        title={
          <div className={styles.header}>
            <span className={styles.notificationsTitle}>
              {t("notifications")}
              <span style={{ color: "#996C42", paddingLeft: 5 }}>
                ({notifications?.result?.total || 0})
              </span>
            </span>
            <span style={{ cursor: "pointer" }} onClick={onClose}>
              <img src={Close} alt="Close" />
            </span>
          </div>
        }
        placement="right"
        closable={false}
        onClose={onClose}
        visible={isDrawerOpen}
        getContainer={false}
        style={{ position: "absolute" }}
        width={486}
      >
        {isLoading && page === 1 ? (
          <ChatSpinner />
        ) : (
          <div
            className={styles.notificationList}
            onScroll={handleScroll}
            ref={notificationListRef}
          >
            {notifications?.result?.data?.length > 0 ? (
              notifications.result.data.map((notification: Notification) => (
                <div
                  key={notification.id}
                  data-id={notification.id}
                  className={styles.notificationWrap}
                >
                  <div className={styles.notificationImage}>
                    {!notification.isRead && (
                      <div className={styles.readMarker} />
                    )}
                    <img src={notification.imageUrl} alt={notification.title} />
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.infoTitle}>
                      {notification.content}
                    </div>
                    <div className={styles.notificationsBottom}>
                      <div className={styles.notificationLink}>
                        {notification.content.includes("Continue Reading")
                          ? "Continue Reading"
                          : "Start Reading"}
                      </div>
                      <NotificationTime sentAt={notification.sentAt} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No notifications available.</div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SideDrawer;
