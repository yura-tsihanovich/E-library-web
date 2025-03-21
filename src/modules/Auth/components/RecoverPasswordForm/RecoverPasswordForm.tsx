import { VerifyData } from "../../slices/auth/types";
import Button from "../../../../components/common/Buttons/Button";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import logo from "../../../../assets/images/icons/logo.svg";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import React from "react";
import { useTranslation } from "react-i18next";

type RecoverProps = {
  onSubmit: (email: VerifyData) => void;
};

const RecoverPasswordForm: React.FC<RecoverProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmitForm = (values: any) => {
    onSubmit(values);
  };

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
          <div className={commonStyles.recover_name}>
            {t("recoverYourPassword")}
          </div>
          <div className={commonStyles.recover_subtitle}>
            {t("emailYouInstructionsToResetYourPassword.")}
          </div>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div>
              <div className={commonStyles.inputWrapper}>
                <input
                  className={`${commonStyles.inputField} ${
                    errors.email ? commonStyles.errorInput : ""
                  }`}
                  type="email"
                  placeholder=""
                  autoComplete="off"
                  {...register("email", {
                    required: "Please input your Email!",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "The input is not valid E-mail!",
                    },
                  })}
                />
                <label
                  className={`${commonStyles.inputLabel} ${
                    errors.email ? commonStyles.errorLabel : ""
                  }`}
                >
                  {t("email")}
                </label>
              </div>
              {errors.email && (
                <p className={commonStyles.error}>{errors.email.message}</p>
              )}
            </div>
            <Button variant="White" type="submit">
              {t("continueBtn")}
            </Button>
          </form>
        </div>
        <div style={{ height: "58px", width: "100%" }} />
      </div>
    </div>
  );
};

export default RecoverPasswordForm;
