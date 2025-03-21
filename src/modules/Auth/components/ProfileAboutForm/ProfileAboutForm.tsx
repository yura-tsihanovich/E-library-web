import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import styles from "./ProfileAboutForm.module.scss";
import React from "react";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import { useHistory } from "react-router-dom";
import Button from "../../../../components/common/Buttons/Button";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

type RecoverProps = {
  onSubmit: (values: any) => void;
  aboutOptions: Array<{
    id: number;
    name: string;
    category: string;
    isFreeText: boolean;
  }>;
};

type SelectedOption = {
  surveyOption: { id: number };
  freeText?: string;
};

const ProfileAboutForm: React.FC<RecoverProps> = ({
  onSubmit,
  aboutOptions = [],
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { handleSubmit, control, register, watch } = useForm();

  const isFreeTextSelected = watch("option_15", false);

  const categories = (aboutOptions || []).reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, typeof aboutOptions>);

  const handleFormSubmit = (data: any) => {
    const selectedOptions: SelectedOption[] = aboutOptions
      .filter((item) => data[`option_${item.id}`]) // Используем новый name
      .map((item) => ({
        surveyOption: { id: item.id, isFreeText: false },
      }));

    if (data.freeText) {
      selectedOptions.push({
        surveyOption: { id: 15 },
        freeText: data.freeText,
      });
    }

    const formattedData = { data: selectedOptions };
    onSubmit(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      style={{ display: "flex", width: "100%", height: "100vh" }}
    >
      <div className={styles.centeredAboutWrapper}>
        <div className={commonStyles.navTop} style={{ padding: "30px 26px 0" }}>
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
        <div className={styles.centered}>
          <div className={styles.logo_name}>{t("howDidYouLearnAbout")}</div>
          <div className={styles.subtitle_name}>
            {t("selectMultipleOptions")}
          </div>
          <div className={styles.formBlock}>
            {Object.entries(categories).map(([category, items]) => (
              <div
                key={category}
                className={
                  category === "Social media"
                    ? styles.formSectionFirst
                    : category === "Internet and media"
                    ? styles.formSectionBorder
                    : styles.formSectionLast
                }
              >
                <div className={styles.subtitle}>{category}</div>
                <ul className={styles.itemsList}>
                  {items.map((item) => (
                    <li key={item.id}>
                      <Controller
                        name={`option_${item.id}`} // Используем уникальное имя
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            {...field}
                            checked={field.value}
                          />
                        )}
                      />
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={styles.submit}>
            {isFreeTextSelected && (
              <div className={commonStyles.inputWrapper}>
                <input
                  {...register("freeText")}
                  className={commonStyles.inputField}
                  type="text"
                  placeholder=""
                  autoComplete="off"
                />
                <label className={commonStyles.inputLabel}>Your variant</label>
              </div>
            )}
            <Button variant="White" type="submit">
              {t("continueBtn")}
            </Button>
          </div>
        </div>
        <div style={{ height: "58px", width: "100%" }} />
      </div>
    </form>
  );
};

export default ProfileAboutForm;
