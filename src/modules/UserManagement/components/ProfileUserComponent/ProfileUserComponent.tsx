import { FC, useContext, useState } from "react";
import styles from "./ProfileUserComponent.module.scss";
import { UserContext } from "../../../../core/contexts";
import ProfileUserForm from "../ProfileUserForm";
import { LanguageType } from "../ProfileUserForm/ProfileUserForm";
import Edit from "../../../../assets/images/icons/editProfileIcon.svg";
import Calendar from "../../../../assets/images/icons/calendarIcon.svg";
import SmallBook from "../../../../assets/images/icons/smallBookIcon.svg";
import LogOut from "../../../../assets/images/icons/logOutIcon.svg";
import { logoutUser } from "../../../../core/session/slices/session";
import { useDispatch } from "react-redux";
import EditProfileModal from "../EditProfileModal";
import noAvatar from "../../../../assets/images/icons/noUserAvatar.png";
import { useTranslation } from "react-i18next";

interface ProfileUserComponentProps {
  languages: LanguageType[];
  onSubmit: (values: any) => void;
  handleUpload: (params: any) => void;
  photoId: string | null;
  deleteAccount: () => void;
  handleKidsMode: (value: any) => void;
  setUserAvatar: any;
  handleAppLanguage: any;
  handleBookLanguage: any;
}

const ProfileUserComponent: FC<ProfileUserComponentProps> = ({
  languages,
  onSubmit,
  handleUpload,
  photoId,
  deleteAccount,
  handleKidsMode,
  setUserAvatar,
  handleAppLanguage,
  handleBookLanguage,
}) => {
  const { t } = useTranslation();

  const value = useContext(UserContext);
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const onLogout = () => {
    dispatch(logoutUser());
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  };

  const isChangeKidsMode = value?.dateBirth
    ? calculateAge(value.dateBirth) <= 16
    : false;
  return (
    <div className={styles.profile_page_wrap}>
      <div className={styles.profile_page}>
        <div className={styles.profile_logo}>
          <img
            src={value?.photo?.link ? value?.photo?.link : noAvatar}
            alt=""
          />
        </div>
        <div className={styles.profile_page_content}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              <span>{value?.userName}</span>
              <div
                className={styles.editButton}
                onClick={() => {
                  setIsEditModalOpen(true);
                }}
              >
                <img src={Edit} alt="edit" />
              </div>
            </div>
          </div>
          <div className={styles.userBirth}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img style={{ marginRight: 4 }} src={Calendar} alt="calendar" />
              {value?.dateBirth}
            </div>
            <div
              style={{ marginLeft: 14, display: "flex", alignItems: "center" }}
            >
              <img style={{ marginRight: 4 }} src={SmallBook} alt="book" />
              {value?.completedBooks} {t("completedBooks")}
            </div>
          </div>
          <ProfileUserForm
            languages={languages}
            onSubmit={onSubmit}
            handleKidsMode={handleKidsMode}
            kidsMode={value?.kidsMode}
            handleAppLanguage={handleAppLanguage}
            handleBookLanguage={handleBookLanguage}
            bookLanguage={value?.bookLanguage}
            setUserAvatar={setUserAvatar}
            language={value?.language}
            isChangeKidsMode={isChangeKidsMode}
          />
        </div>
        <div onClick={onLogout} className={styles.logOutBtn}>
          <img src={LogOut} alt="icon" />
          {t("logOut")}
        </div>
      </div>
      <EditProfileModal
        onSubmit={onSubmit}
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        dateBirth={value?.dateBirth}
        userName={value?.userName}
        gender={value?.gender}
        userPhoto={value?.photo?.link}
        bookLanguage={value?.bookLanguage}
        handleUpload={handleUpload}
        photoId={photoId}
        deleteAccount={deleteAccount}
      />
    </div>
  );
};

export default ProfileUserComponent;
