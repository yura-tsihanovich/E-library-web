import { useForm } from "react-hook-form";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import logo from "../../../../assets/images/icons/logo.svg";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import { useLocation, useHistory } from "react-router-dom";
import Button from "../../../../components/common/Buttons/Button";
import React from "react";
import { useTranslation } from "react-i18next";

type LoginFormProps = {
  onSubmit: (values: any) => void;
};

const ChangePasswordForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const location = useLocation();
  const history = useHistory();
  const hash = new URLSearchParams(location.search).get("hash") || "";
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmitForm = ({ confirmPassword, ...values }: any) => {
    onSubmit({ ...values, hash });
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
          <div className={commonStyles.logo_name}>
            {t("enterYourNewPassword")}
          </div>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div>
              <div className={commonStyles.inputWrapper}>
                <input
                  className={`${commonStyles.inputField} ${
                    errors.password ? commonStyles.errorInput : ""
                  }`}
                  type="password"
                  placeholder=""
                  autoComplete="off"
                  {...register("password", {
                    required: "Password must be at least 8 characters long!",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long!",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z]).+$/,
                      message:
                        "Password must contain at least one uppercase letter!",
                    },
                  })}
                />
                <label
                  className={`${commonStyles.inputLabel} ${
                    errors.password ? commonStyles.errorLabel : ""
                  }`}
                >
                  {t("password")}
                </label>
              </div>
              {errors.password && (
                <p className={commonStyles.error}>{errors.password.message}</p>
              )}
            </div>
            <div>
              <div className={commonStyles.inputWrapper}>
                <input
                  className={`${commonStyles.inputField} ${
                    errors.confirmPassword ? commonStyles.errorInput : ""
                  }`}
                  type="password"
                  placeholder=""
                  autoComplete="off"
                  {...register("confirmPassword", {
                    required: "Please confirm your password!",
                    validate: (value) =>
                      value === password || "Passwords do not match!",
                  })}
                />
                <label
                  className={`${commonStyles.inputLabel} ${
                    errors.confirmPassword ? commonStyles.errorLabel : ""
                  }`}
                >
                  {t("confirmPassword")}
                </label>
              </div>
              {errors.confirmPassword && (
                <p className={commonStyles.error}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button variant="White" type="submit">
              {t("changePassword")}
            </Button>
          </form>
        </div>
        <div style={{ height: "58px", width: "100%" }} />
      </div>
    </div>
  );
};

export default ChangePasswordForm;
