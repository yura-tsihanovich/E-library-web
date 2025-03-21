import { useForm } from "react-hook-form";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import logo from "../../../../assets/images/icons/logo.svg";
import Onboarding from "../../../../assets/images/Onboarding-img.png";
import { Link, useHistory } from "react-router-dom";
import BackIcon from "../../../../assets/images/icons/goBackIcon.svg";
import Button from "../../../../components/common/Buttons/Button";
import React from "react";
import routes from "../../routing/routes";
import { useTranslation } from "react-i18next";

type LoginFormProps = {
  onSubmit: (values: any) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmitForm = (values: any) => {
    console.log("values", values);
    onSubmit(values);
  };

  // Watching the password field to validate confirm password
  const password = watch("password");

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
          <div className={commonStyles.logo_name}>{t("createAccount")}</div>
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
                    required: t("pleaseInputYourEmail"),
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: t("errors.pleaseInputYourEmail"),
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
            <div>
              <div className={commonStyles.inputWrapper}>
                <input
                  className={`${commonStyles.inputField} ${
                    errors.password ? commonStyles.errorInput : ""
                  }`}
                  type="password"
                  inputMode="text"
                  placeholder=""
                  {...register("password", {
                    required: t("passwordMustBeAtLeast8CharactersLongl"),
                    minLength: {
                      value: 8,
                      message: t("passwordMustBeAtLeast8CharactersLong"),
                    },
                    pattern: {
                      value: /^(?=.*[A-Z]).+$/,
                      message: t(
                        "errors.passwordMustContainAtLeastOneUppercaseLetter"
                      ),
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
                  inputMode="text"
                  placeholder=""
                  {...register("confirmPassword", {
                    required: t("errors.pleaseConfirmYourPasswordl"),
                    validate: (value) =>
                      value === password || t("errors.passwordsDoNotMatch"),
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
              {t("createAccount")}
            </Button>
          </form>
        </div>
        <div className={commonStyles.footerCentered}>
          <div>
            <div
              className={commonStyles.login_subtitle}
              style={{ marginBottom: "15px" }}
            >
              <div style={{ textAlign: "center" }}>
                {t("byCreatingAnAccountYouAgreeToOur")}
                <Link
                  to={routes.termsAndConditions}
                  style={{ color: "#FFEA84", marginLeft: 8 }}
                >
                  {t("termsAndConditions")}
                </Link>
                <br />
                {t("and")}
                <Link
                  to={routes.privacyPolicy}
                  style={{ color: "#FFEA84", marginLeft: 8 }}
                >
                  {t("privacyPolicy")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={commonStyles.sideOnboardingImg}>
        <img style={{ height: "100%" }} src={Onboarding} alt="Onboarding" />
      </div>
    </div>
  );
};

export default LoginForm;
