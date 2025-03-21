import styles from "./ChooseAvatarStep2.module.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "../../../../../../components/common/Buttons/Button";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface ChooseAvatarStep2Props {
  setCurrentStep: (value: number) => void;
  selectedAvatar: string;
}
const ChooseAvatarStep2: FC<ChooseAvatarStep2Props> = ({
  setCurrentStep,
  selectedAvatar,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.askQuestionAvatar}>
      {/*<div className={styles.avatarSettings}>*/}
      {/*  Umar*/}
      {/*  <div className={styles.settingsIcon}>*/}
      {/*    <img src={Settings} alt="icon" />*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div className={styles.avatarSliderWrap}>
        <div
          className={styles.sliderBackground}
          style={{ backgroundImage: `url(${selectedAvatar})` }}
        ></div>
        <div className={styles.messageSystemContent}>
          {t("avatarDescription1")}
          <br />
          {t("avatarDescription2")}
          <br />
          {t("avatarDescription3")}
        </div>
        <Button
          onClick={() => {
            setCurrentStep(3);
          }}
          style={{ width: "341px", margin: "30px auto 20px" }}
          variant="Brown"
        >
          {t("continueBtn")}
        </Button>
      </div>
    </div>
  );
};

export default ChooseAvatarStep2;
