import styles from "./ProfileUserForm.module.scss";
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import NoAvatar from "../../../../assets/images/icons/uploadBg.png";
import tempAi from "../../../../assets/images/testAiImg.png";
import LanguageModal from "../../../Auth/components/LanguageModal";
import { Switch } from "antd";
import NotificationsModal from "../common/NotificationModal/NotificationsModal";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../../../core/contexts";

export type LanguageType = {
  id: number;
  name: string;
  flag: {
    link: string;
  };
  isoCode2char: string;
};

type RecoverProps = {
  onSubmit: (values: any) => void;
  languages: LanguageType[];
  handleKidsMode: (value: boolean) => void;
  kidsMode: boolean | undefined;
  bookLanguage?: LanguageType;
  setUserAvatar: any;
  language?: LanguageType;
  handleAppLanguage: any;
  handleBookLanguage: any;
};

type FormValues = {
  userName: string;
  dateBirth: string;
  language: string;
  bookLanguage: string;
  gender: string;
  photo: any;
};

const ProfileUserForm: React.FC<RecoverProps> = ({
  onSubmit,
  languages = [],
  handleKidsMode,
  kidsMode = true,
  bookLanguage,
  setUserAvatar,
  language,
  handleAppLanguage,
  handleBookLanguage,
}) => {
  const { t, i18n } = useTranslation();
  const defaultLanguage = languages.find((lang) => lang.name === "English") || {
    id: 0,
    name: "English",
    flag: { link: NoAvatar },
    isoCode2char: "en",
  };
  const value = useContext(UserContext);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [selectedBookLanguage, setSelectedBookLanguage] = useState(
    bookLanguage || defaultLanguage
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState(false);
  const [modalType, setModalType] = useState<"language" | "bookLanguage">(
    "language"
  );
  const [userKidsMode, setUserKidsMode] = useState(kidsMode);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      language: language?.name || defaultLanguage.name,
      bookLanguage: bookLanguage?.name || defaultLanguage.name,
    },
  });

  useEffect(() => {
    if (languages.length > 0 && modalType === "language") {
      const currentLang = i18n.language.toLowerCase();
      const matchedLanguage =
        languages.find(
          (lang) => lang.isoCode2char.toLowerCase() === currentLang
        ) || defaultLanguage;
      setSelectedLanguage(matchedLanguage);
      setValue("language", matchedLanguage.name);
    }
  }, [i18n.language, languages, modalType, setValue]);

  useEffect(() => {
    if (languages.length > 0) {
      const initialBookLanguage = bookLanguage || defaultLanguage;
      setSelectedBookLanguage(initialBookLanguage);
      setValue("bookLanguage", initialBookLanguage.name);
    }
  }, [languages, setValue, bookLanguage]);

  useEffect(() => {
    setUserKidsMode(kidsMode);
  }, [kidsMode]);

  const handleLanguageChange = (language: LanguageType) => {
    if (modalType === "language") {
      setSelectedLanguage(language);
      handleAppLanguage(language);
      setValue("language", language.name);
      i18n.changeLanguage(language.isoCode2char.toLowerCase()); // Меняем язык приложения
    } else if (modalType === "bookLanguage") {
      setSelectedBookLanguage(language);
      handleBookLanguage(language);
      setValue("bookLanguage", language.name);
    }
  };

  const showModal = (type: "language" | "bookLanguage") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const onSubmitForm = (data: FormValues) => {
    const formattedData = {
      userName: data.userName,
      dateBirth: data.dateBirth,
      language: {
        id: selectedLanguage.id,
      },
      bookLanguage: {
        id: selectedBookLanguage.id,
      },
      gender: data.gender,
    };
    console.log("profileFormattedData", formattedData);
    onSubmit(formattedData);
  };

  const kidsModeChange = (checked: boolean) => {
    setUserKidsMode(checked);
    handleKidsMode(checked);
  };
  console.log("languages", languages);

  return (
    <div>
      <form style={{ marginBottom: 40 }} onSubmit={handleSubmit(onSubmitForm)}>
        {/* App Language */}
        <div style={{ marginTop: 15 }}>
          {languages.length > 0 && (
            <div className={styles.inputWrapperLang}>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      showModal("language");
                    }}
                    className={styles.languageSelectWrapper}
                  >
                    <div
                      className={styles.languageSelect}
                      style={{
                        backgroundImage: `url(${selectedLanguage.flag.link})`,
                      }}
                    ></div>
                    <span>{selectedLanguage.name}</span>
                  </div>
                )}
              />
              <label className={styles.inputLabel}>{t("appLanguage")}</label>
            </div>
          )}
        </div>

        {/* Book Language */}
        <div style={{ marginTop: 15 }}>
          {languages.length > 0 && (
            <div className={styles.inputWrapperLang}>
              <Controller
                name="bookLanguage"
                control={control}
                render={({ field }) => (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      showModal("bookLanguage");
                    }}
                    className={styles.languageSelectWrapper}
                  >
                    <div
                      className={styles.languageSelect}
                      style={{
                        backgroundImage: `url(${selectedBookLanguage.flag.link})`,
                      }}
                    ></div>
                    <span>{selectedBookLanguage.name}</span>
                  </div>
                )}
              />
              <label className={styles.inputLabel}>{t("bookLanguage")}</label>
            </div>
          )}
        </div>

        {/* Kids Mode */}
        <div className={styles.kidsSelectWrapper}>
          <span>{t("kidsMode")}</span>
          <Switch checked={userKidsMode} onChange={kidsModeChange} />
        </div>

        {/* Notification Settings */}
        <div
          style={{ marginBottom: "16px" }}
          className={styles.aiWrapper}
          onClick={() => {
            setIsNotificationsModalOpen(true);
          }}
        >
          <span>{t("notificationSettings")}</span>
        </div>

        {/* AI Librarian */}
        <div
          className={styles.aiWrapper}
          onClick={() => {
            setUserAvatar(0);
          }}
        >
          <div className={styles.aiAvatar}>
            <img
              src={
                value?.avatarSettings?.avatarMiniature?.link
                  ? value?.avatarSettings?.avatarMiniature?.link
                  : tempAi
              }
              alt="avatar"
            />
          </div>
          <span>{t("aILibrarian")}</span>
        </div>
      </form>

      <LanguageModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        languages={languages}
        defaultLanguage={
          modalType === "language" ? selectedLanguage : selectedBookLanguage
        }
        onLanguageSelect={(language: LanguageType) =>
          handleLanguageChange(language)
        }
      />

      <NotificationsModal
        isModalOpen={isNotificationsModalOpen}
        setIsModalOpen={setIsNotificationsModalOpen}
      />
    </div>
  );
};

export default ProfileUserForm;
