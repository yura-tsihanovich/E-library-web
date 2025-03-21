import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Upload, DatePicker } from "antd";
import moment from "moment";
import NoAvatar from "../../../../assets/images/icons/uploadBg.png";
import Button from "../../../../components/common/Buttons/Button";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import { useHistory } from "react-router-dom";
import LanguageModal from "../LanguageModal";
import { useTranslation } from "react-i18next";

type LanguageType = {
  id: number;
  name: string;
  isoCode2char: string;
  flag: {
    link: string;
  };
};

type RecoverProps = {
  onSubmit: (values: any) => void;
  languages: LanguageType[];
  handleUpload: (params: any) => void;
  photoId: string | null;
};

type FormValues = {
  userName: string;
  dateBirth: string;
  language: string;
  gender: string;
  photo: any;
};

const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const ProfileForm: React.FC<RecoverProps> = ({
  onSubmit,
  languages = [],
  handleUpload,
  photoId,
}) => {
  const { t } = useTranslation();
  const defaultLanguage = languages.find((lang) => lang.name === "English") || {
    id: 0,
    name: "Select Language",
    flag: { link: NoAvatar },
  };

  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const defaultGender = genders[0].value;
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      userName: "",
      dateBirth: "",
      language: defaultLanguage.name,
      gender: defaultGender,
      photo: null,
    },
  });

  const history = useHistory();
  const profilePicture = watch("photo");

  useEffect(() => {
    if (languages.length > 0) {
      const englishLanguage = languages.find((lang) => lang.name === "English");
      if (englishLanguage) {
        setSelectedLanguage(englishLanguage);
        setValue("language", englishLanguage.name);
      }
    }
  }, [languages, setValue]);

  const onLanguageSelect = (language: LanguageType) => {
    setSelectedLanguage(language);
    sessionStorage.setItem("appLanguage", JSON.stringify(language));
    setValue("language", language.name);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const onSubmitForm = (data: FormValues) => {
    const formattedData = {
      photo: {
        id: photoId,
      },
      userName: data.userName,
      dateBirth: data.dateBirth,
      language: {
        id: selectedLanguage.id,
      },
      gender: data.gender,
    };
    onSubmit(formattedData);
  };

  const uploadPhoto = (file: any) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("prefix", "prefix");
    formData.append("postfix", "postfix");
    formData.append("tag", "AVATAR");

    handleUpload(formData);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <div className={commonStyles.centeredWrapper}>
        <div className={commonStyles.navTop}>
          <div
            onClick={() => history.goBack()}
            className={commonStyles.backBtnRelative}
          >
            <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
            {t("backBtn")}
          </div>
          {/*<div*/}
          {/*  onClick={() => history.push(homeRoutes.root)}*/}
          {/*  className={commonStyles.backBtnRelative}*/}
          {/*>*/}
          {/*  Skip*/}
          {/*  <img*/}
          {/*    style={{ marginLeft: 9, transform: "rotate(180deg)" }}*/}
          {/*    src={BackIcon}*/}
          {/*    alt="Back arrow"*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
        <div className={commonStyles.centered}>
          <div className={commonStyles.logo_name}>{t("profileDetails")}</div>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className="form-group">
              <div className="authUploadWrap">
                <Controller
                  name="photo"
                  control={control}
                  render={({ field }) => (
                    <Upload
                      beforeUpload={(file) => {
                        setValue("photo", file);
                        uploadPhoto(file);
                        return false; // Prevent automatic upload
                      }}
                      showUploadList={false}
                      fileList={profilePicture ? [profilePicture] : []}
                      accept="image/*"
                      listType="picture-card"
                    >
                      {profilePicture ? (
                        <img
                          src={URL.createObjectURL(profilePicture)}
                          alt="avatar"
                          className={commonStyles.uploadedImage}
                        />
                      ) : (
                        <img src={NoAvatar} alt="avatar" />
                      )}
                    </Upload>
                  )}
                />
              </div>
            </div>
            <span className={commonStyles.uploadSubtitle}>
              {t("profileDetails")}
            </span>
            <div style={{ marginTop: 15 }}>
              <div className={commonStyles.inputWrapper}>
                <Controller
                  name="userName"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        id="name"
                        autoComplete="off"
                        className={`${commonStyles.inputField} ${
                          errors.userName ? commonStyles.errorInput : ""
                        }`}
                        type="text"
                      />
                      <label
                        className={`${commonStyles.inputLabel} ${
                          errors.userName ? commonStyles.errorLabel : ""
                        }`}
                      >
                        {t("name")}
                      </label>
                      {errors.userName && (
                        <p className={commonStyles.errorController}>
                          {errors.userName.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div className={commonStyles.inputWrapper}>
                <Controller
                  name="dateBirth"
                  control={control}
                  render={({ field }) => (
                    <div className="inputWrapper">
                      <DatePicker
                        className={`${commonStyles.inputField} ${
                          errors.dateBirth ? commonStyles.errorInput : ""
                        }`}
                        onChange={(date) =>
                          field.onChange(date ? date.format("YYYY-MM-DD") : "")
                        }
                        value={field.value ? moment(field.value) : undefined}
                        placeholder=""
                        placement="topRight"
                        format="DD MMM, YYYY"
                        suffixIcon={null}
                        allowClear={false}
                        disabledDate={(currentDate) =>
                          currentDate && currentDate > moment().endOf("day")
                        }
                      />
                      <label
                        className={`${commonStyles.inputLabel} ${
                          errors.dateBirth ? commonStyles.errorLabel : ""
                        } ${field.value ? "has-value" : ""}`}
                      >
                        {t("dateOfBirth")}
                      </label>
                    </div>
                  )}
                />
              </div>

              <div className={commonStyles.inputWrapperLang}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div className={commonStyles.dropdown}>
                      <select
                        {...field}
                        className={`${commonStyles.inputField} ${
                          commonStyles.inputFieldSelect
                        } ${errors.gender ? commonStyles.errorInput : ""}`}
                      >
                        {genders.map((gender) => (
                          <option key={gender.value} value={gender.value}>
                            {gender.label}
                          </option>
                        ))}
                      </select>
                      <label className={commonStyles.inputLabel}>
                        {t("gender")}
                      </label>
                      {errors.gender && (
                        <p className={commonStyles.errorController}>
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
              {languages.length > 0 && (
                <div className={commonStyles.inputWrapperLang}>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          showModal();
                        }}
                        className={commonStyles.languageSelectWrapper}
                      >
                        <div
                          className={commonStyles.languageSelect}
                          style={{
                            backgroundImage: `url(${selectedLanguage.flag.link})`,
                          }}
                        ></div>
                        <span>{selectedLanguage.name}</span>
                      </div>
                    )}
                  />
                  <label className={commonStyles.inputLabel}>
                    {t("appLanguage")}
                  </label>
                </div>
              )}
            </div>
            <Button variant="White" type="submit">
              {t("continueBtn")}
            </Button>
          </form>
        </div>
        <div style={{ height: "58px", width: "100%" }} />
        <LanguageModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          languages={languages}
          defaultLanguage={defaultLanguage}
          onLanguageSelect={onLanguageSelect}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
