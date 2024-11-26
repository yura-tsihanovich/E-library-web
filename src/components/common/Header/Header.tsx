import styles from "./Header.module.scss";
import logo from "../../../assets/images/icons/appLogoBrown.svg";
import logoWhite from "../../../assets/images/icons/appLogoWhite.svg";
import bell from "../../../assets/images/icons/bellIcon.svg";
import noAvatar from "../../../assets/images/icons/noUserAvatar.png";
import { Link, useLocation } from "react-router-dom";
import React, { useContext, useState } from "react";
import { UserContext } from "../../../core/contexts";
import userRoutes from "../../../modules/UserManagement/routing/routes";
import homeRoutes from "../../../modules/Home/routing/routes";

const Header: React.FC = () => {
  const [hasNotifications] = useState(true);
  const value = useContext(UserContext);
  const location = useLocation(); // Получаем текущий путь

  const difStyles =
    location.pathname === userRoutes.profile ||
    /^\/search_genre_books\/\d+$/.test(location.pathname);

  console.log("difStyles ", difStyles);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div className={styles.headerDesktop}>
        <div className={styles.headerLogo}>
          <Link to="/">
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                height="41px"
                width="73px"
                src={!difStyles ? logo : logoWhite}
                alt="logo"
              />
            </div>
          </Link>
        </div>
        <nav className={styles.headerNav}>
          <Link
            to={homeRoutes.root}
            style={{ color: difStyles ? "white" : "#7C8482" }}
            className={`${styles.headerNavItem} ${
              isActive(homeRoutes.root) ? styles.active : ""
            }`}
          >
            <span className={styles.headerIcon}>
              <svg
                className={styles.headerIcon}
                style={{ color: difStyles ? "white" : "#7C8482" }}
                width="17"
                height="18"
                viewBox="0 0 17 18"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1.76655 8.23838C0.594531 8.23838 0.00390625 7.64775 0.00390625 6.42959V2.30444C0.00390625 1.08628 0.594531 0.504883 1.76655 0.504883H5.97476C7.14678 0.504883 7.7374 1.08628 7.7374 2.30444V6.42959C7.7374 7.64775 7.14678 8.23838 5.97476 8.23838H1.76655ZM11.032 8.23838C9.85073 8.23838 9.26011 7.64775 9.26011 6.42959V2.30444C9.26011 1.08628 9.85073 0.504883 11.032 0.504883H15.231C16.403 0.504883 16.9936 1.08628 16.9936 2.30444V6.42959C16.9936 7.64775 16.403 8.23838 15.231 8.23838H11.032ZM1.76655 17.4946C0.594531 17.4946 0.00390625 16.9132 0.00390625 15.695V11.5606C0.00390625 10.3517 0.594531 9.76108 1.76655 9.76108H5.97476C7.14678 9.76108 7.7374 10.3517 7.7374 11.5606V15.695C7.7374 16.9132 7.14678 17.4946 5.97476 17.4946H1.76655ZM11.032 17.4946C9.85073 17.4946 9.26011 16.9132 9.26011 15.695V11.5606C9.26011 10.3517 9.85073 9.76108 11.032 9.76108H15.231C16.403 9.76108 16.9936 10.3517 16.9936 11.5606V15.695C16.9936 16.9132 16.403 17.4946 15.231 17.4946H11.032Z" />
              </svg>
            </span>
            <span style={{ paddingLeft: 6 }}>Home</span>
          </Link>
          <Link
            to={homeRoutes.booksShelf}
            style={{ color: difStyles ? "white" : "#7C8482" }}
            className={`${styles.headerNavItem} ${
              isActive(homeRoutes.booksShelf) ? styles.active : ""
            }`}
          >
            <svg
              className={styles.headerIcon}
              style={{ color: difStyles ? "white" : "#7C8482" }}
              width="19"
              height="22"
              viewBox="0 0 19 22"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1.42169 17.0696C0.852776 17.0696 0.476562 16.5283 0.476562 15.7391V6.95775C0.476562 5.91169 0.577498 5.74652 1.47674 5.2235L9.17536 0.800688C9.45064 0.635521 9.70757 0.571289 9.94614 0.571289C10.46 0.571289 10.8546 0.947503 10.8179 1.55312L2.31175 6.45307C2.0273 6.60906 1.96307 6.73753 1.96307 7.06786V16.8861C1.77955 17.0146 1.58685 17.0696 1.42169 17.0696ZM5.08289 19.1893C4.53233 19.1893 4.12859 18.6479 4.12859 17.8588V9.06822C4.12859 8.04051 4.2387 7.84782 5.13794 7.33396L12.8366 2.90198C13.1118 2.75517 13.3688 2.68176 13.5982 2.68176C14.1396 2.68176 14.5158 3.06715 14.4882 3.66358L5.98213 8.57272C5.67933 8.73788 5.62427 8.82964 5.62427 9.18751V19.0058C5.44075 19.1342 5.25723 19.1893 5.08289 19.1893ZM9.01937 21.4282C8.322 21.4282 7.95496 20.841 7.95496 19.7766V11.4631C7.95496 10.463 8.25777 9.94911 9.12031 9.44443L16.3326 5.28773C16.7639 5.03998 17.1401 4.92069 17.4521 4.92069C18.1403 4.92069 18.5257 5.48042 18.5257 6.58154V14.8949C18.5257 15.9227 18.2228 16.4273 17.3787 16.9137L10.1847 21.0428C9.72592 21.2998 9.34053 21.4282 9.01937 21.4282Z" />
            </svg>
            <span style={{ paddingLeft: 6 }}>My Bookshelf</span>
          </Link>
          <Link
            to="#"
            style={{ color: difStyles ? "white" : "#7C8482" }}
            className={`${styles.headerNavItem} ${
              isActive("#") ? styles.active : ""
            }`}
          >
            <svg
              className={styles.headerIcon}
              style={{ color: difStyles ? "white" : "#7C8482" }}
              width="19"
              height="22"
              viewBox="0 0 19 22"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.24264 21.3635L9.1114 18.0972L8.8312 18.0837C6.50993 17.9303 4.5613 17.0159 2.98531 15.3404C1.40917 13.6651 0.621094 11.6623 0.621094 9.33192C0.621094 6.8933 1.47231 4.82733 3.17475 3.13399C4.87718 1.4405 6.94771 0.59375 9.38633 0.59375C10.6012 0.59375 11.7379 0.823339 12.7964 1.28252C13.8551 1.74169 14.7827 2.36955 15.5792 3.16608C16.3758 3.96262 17.0036 4.89023 17.4628 5.94893C17.922 7.00746 18.1516 8.14415 18.1516 9.35898C18.1516 10.6918 17.9177 11.9565 17.4499 13.1529C16.9819 14.3493 16.3455 15.4567 15.5407 16.4753C14.7358 17.4941 13.7919 18.4138 12.709 19.2342C11.626 20.0547 10.4706 20.7645 9.24264 21.3635ZM9.37603 14.7391C9.70157 14.7391 9.97595 14.6275 10.1991 14.4045C10.4222 14.1813 10.5337 13.9069 10.5337 13.5814C10.5337 13.2557 10.4222 12.9813 10.1991 12.7583C9.97595 12.5351 9.70157 12.4235 9.37603 12.4235C9.05033 12.4235 8.77596 12.5351 8.55291 12.7583C8.32971 12.9813 8.21811 13.2557 8.21811 13.5814C8.21811 13.9069 8.32971 14.1813 8.55291 14.4045C8.77596 14.6275 9.05033 14.7391 9.37603 14.7391ZM8.50549 11.5759H10.2672C10.2672 11.0878 10.3218 10.7345 10.4312 10.5159C10.5406 10.2972 10.8237 9.95946 11.2804 9.50268C11.5859 9.19725 11.8366 8.8769 12.0327 8.54161C12.2287 8.20633 12.3268 7.82906 12.3268 7.4098C12.3268 6.54142 12.0469 5.88786 11.4871 5.44912C10.9272 5.01037 10.2359 4.791 9.41339 4.791C8.67481 4.791 8.04121 5.01365 7.51258 5.45893C6.98395 5.90422 6.61482 6.44243 6.40519 7.07356L8.05765 7.72209C8.14658 7.44173 8.29602 7.16305 8.50597 6.88604C8.71592 6.60903 9.00938 6.47053 9.38633 6.47053C9.76328 6.47053 10.046 6.57223 10.2344 6.77564C10.4229 6.97904 10.5172 7.20639 10.5172 7.4577C10.5172 7.69303 10.435 7.91623 10.2708 8.1273C10.1066 8.33821 9.93539 8.53291 9.75706 8.71141C9.18915 9.20843 8.83854 9.61468 8.70523 9.93016C8.57207 10.2456 8.50549 10.7942 8.50549 11.5759Z" />
            </svg>
            <span style={{ paddingLeft: 6 }}>Ask a Question</span>
          </Link>
          <Link
            to={homeRoutes.search}
            style={{ color: difStyles ? "white" : "#7C8482" }}
            className={`${styles.headerNavItem} ${
              isActive(homeRoutes.search) ? styles.active : ""
            }`}
          >
            <span className={styles.headerIcon}>
              <svg
                className={styles.headerIcon}
                style={{ color: difStyles ? "white" : "#7C8482" }}
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.66555 14.3311C3.72105 14.3311 0.5 11.0928 0.5 7.16555C0.5 3.23828 3.72105 0 7.66555 0C11.61 0 14.8311 3.22105 14.8311 7.16555C14.8311 8.64689 14.366 10.0249 13.5909 11.1617L18.0349 15.623C18.3105 15.9158 18.5 16.2775 18.5 16.6737C18.5 17.5349 17.9316 18.1378 17.1048 18.1378C16.6053 18.1378 16.2263 17.9828 15.8818 17.6211L11.4722 13.2287C10.3699 13.9177 9.06077 14.3311 7.66555 14.3311ZM7.66555 11.9885C10.301 11.9885 12.4713 9.80096 12.4713 7.16555C12.4713 4.51292 10.301 2.34258 7.66555 2.34258C5.03014 2.34258 2.84258 4.53014 2.84258 7.16555C2.84258 9.80096 5.03014 11.9885 7.66555 11.9885Z" />
              </svg>
            </span>
            <span style={{ paddingLeft: 6 }}>Search</span>
          </Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className={styles.headerNotifications}>
            {hasNotifications && <div className={styles.dot} />}
            <img src={bell} alt="bell" />
          </div>
          <Link
            to={userRoutes.profile}
            className={styles.dropdown}
            style={{ color: difStyles ? "#D9A678" : "#996C42" }}
          >
            <div className={styles.headerAvatar}>
              <img
                src={value?.photo?.link ? value?.photo?.link : noAvatar}
                alt=""
              />
            </div>
            {value?.userName ? value?.userName : value?.email}
          </Link>
        </div>
      </div>
      <div className={styles.headerMobile}>
        <div className={styles.headerAvatar}>
          <img
            src={value?.photo?.link ? value?.photo?.link : noAvatar}
            alt=""
          />
        </div>
        <div className={styles.pageTitle}>Home</div>
        <div className={styles.headerNotifications}>
          {hasNotifications && <div className={styles.dot} />}
          <img src={bell} alt="bell" />
        </div>
      </div>
    </>
  );
};

export default Header;
