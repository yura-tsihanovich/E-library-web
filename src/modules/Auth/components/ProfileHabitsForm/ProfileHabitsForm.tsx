import React from "react";
import styles from "./ProfileHabitsForm.module.scss";
import { useForm, Controller } from "react-hook-form";
import Button from "../../../../components/common/Buttons/Button";
import { useTranslation } from "react-i18next";

type FormValues = {
  categories: {
    [key: string]: boolean;
  };
};

type CategoryData = {
  id: number;
  name: string;
  color: string;
  picture: {
    link: string;
  };
};

type RecoverProps = {
  onSubmit: (value: any) => void;
  categoriesData?: CategoryData[];
  habits: any;
};

const ProfileHabitsForm: React.FC<RecoverProps> = ({
  onSubmit,
  categoriesData = [],
  habits,
}) => {
  const { t } = useTranslation();
  const habitIds = new Set(habits?.map((habit: any) => habit.id));

  const { handleSubmit, control, watch } = useForm<FormValues>({
    defaultValues: {
      categories: categoriesData.reduce((acc, category) => {
        acc[category.name] = habitIds.has(category.id);
        return acc;
      }, {} as FormValues["categories"]),
    },
  });

  const onSubmitForm = (data: FormValues) => {
    const selectedCategories = categoriesData
      .filter((category) => data.categories[category.name])
      .map((category) => ({ id: category.id }));

    onSubmit({ readingHabits: selectedCategories });
  };

  const selectedCategories = watch("categories");
  const selectedCount =
    Object.values(selectedCategories).filter(Boolean).length;

  return (
    <div className={styles.habitPageContainer}>
      <div />
      <div className={styles.habit_title}>{t("chooseYourReadingHabits")}</div>
      <div className={styles.habit_wrap}>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className={styles.grid_container}>
            {categoriesData.map((category) => (
              <label
                key={category.id}
                className={styles.grid_item}
                style={{
                  position: "relative",
                  backgroundColor: category.color,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "32px",
                    right: 0,
                    width: "74px",
                    height: "112px",
                    backgroundImage: `url(${category.picture.link})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    transform: "rotate(15deg)",
                    transformOrigin: "center",
                    borderRadius: 6,
                    overflow: "hidden",
                    boxShadow: "3px 5px 15px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <div className={styles.controllerWrap}>
                  {category.name}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <Controller
                      name={`categories.${category.name}`}
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={({ target }) => onChange(target.checked)}
                          ref={ref}
                          style={{
                            marginRight: "8px",
                            accentColor: value ? "#fff" : "transparent",
                            width: "27px",
                            height: "27px",
                            backgroundColor: value ? "#fff" : "transparent",
                            border: value
                              ? "2px solid #333"
                              : "2px solid transparent",
                            borderRadius: "10px",
                            appearance: value ? "auto" : "none",
                            outline: "none",
                            boxShadow: "none",
                            padding: 0,
                            margin: 0,
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className={styles.btnWrap}>
            <Button variant="Brown" type="submit">
              {t("continueBtn")} ({selectedCount})
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileHabitsForm;
