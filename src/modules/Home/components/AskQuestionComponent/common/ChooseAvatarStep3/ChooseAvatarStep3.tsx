import styles from "./ChooseAvatarStep3.module.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "../../../../../../components/common/Buttons/Button";
import { FC } from "react";
import { useTranslation } from "react-i18next";

interface ChooseAvatarStep2Props {
  setCurrentStep: (value: number) => void;
  selectedAvatar: string;
}
const ChooseAvatarStep3: FC<ChooseAvatarStep2Props> = ({
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
          // style={{ backgroundImage: `url(${currentImage.avatar})` }}
          style={{ backgroundImage: `url(${selectedAvatar})` }}
        ></div>
        <div className={styles.messageSystemContent}>
          <ul>
            <li>{t("avatarListItem1")}</li>
            <li>{t("avatarListItem2")}</li>
            <li>{t("avatarListItem3")}</li>
          </ul>
        </div>
        <Button
          onClick={() => {
            setCurrentStep(4);
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

export default ChooseAvatarStep3;
