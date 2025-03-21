import { useHistory } from "react-router-dom";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import Button from "../../../../components/common/Buttons/Button";
import logo from "../../../../assets/images/ConfirmIcon.svg";
import React from "react";
import { useTranslation } from "react-i18next";

type VerifyEmailSuccessProps = {
  recoveryEmail: string | null;
};

const VerifyEmailSuccess: React.FC<VerifyEmailSuccessProps> = ({
  recoveryEmail,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <div className={commonStyles.centeredWrapper}>
        <div className={commonStyles.navTop}>
          <div
            onClick={() => history.goBack()}
            className={commonStyles.backBtnRelative}
          >
            <img style={{ marginRight: 9 }} src={BackIcon} alt="Back arrow" />
            {t("backBtn")}
          </div>
          <div />
        </div>
        <div className={commonStyles.centered}>
          <div className={commonStyles.login_logo}>
            <img src={logo} alt="logo" />
          </div>
          <div className={commonStyles.recover_name}>Email sent</div>
          <div className={commonStyles.success_subtitle}>
            Email on how to reset your password has been sent to {recoveryEmail}
            . Please follow instructions.
          </div>
          <Button variant="Transparent" to="/onboarding">
            Back to Home
          </Button>
        </div>
        <div style={{ height: "58px", width: "100%" }} />
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;
