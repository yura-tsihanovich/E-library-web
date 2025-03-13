import styles from "./OnboardingForm.module.scss";
import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import logo from "../../../../assets/images/icons/logo.svg";
import Button from "../../../../components/common/Buttons/Button";
import Social_1 from "../../../../assets/images/icons/facebook.svg";
import Social_2 from "../../../../assets/images/icons/twitter.svg";
import Onboarding from "../../../../assets/images/Onboarding-img.png";
// import GoogleIcon from "../../../../assets/images/icons/google.png";
import { Link } from "react-router-dom";
// import { GoogleLogin } from "@react-oauth/google";
import { useLazySelector } from "../../../../hooks";
import useAuthSocial from "../../../../hooks/useAuthSocial";
import { AppleOutlined } from "@ant-design/icons";

type LoginFormProps = {
  onSubmit: (values: any) => void;
};

const OnboardingForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  // const handleGoogleSuccess = (credentialResponse: any) => {
  //   console.log("Google User Token:", credentialResponse.credential);
  //   onSubmit({ idToken: credentialResponse.credential });
  // };

  const { loginViaSocial } = useAuthSocial();

  const { result: localization } = useLazySelector(
    ({ auth }) => auth.appLocalization || {}
  );

  // const handleGoogleFailure = () => {
  //   console.error("Google login failed");
  // };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <div className={commonStyles.centeredWrapper}>
        <div style={{ height: "58px", width: "100%" }} />
        <div className={commonStyles.centered}>
          <div className={commonStyles.login_logo}>
            <img src={logo} alt="logo" />
          </div>
          <Button variant="White" to="/auth/registration">
            {localization?.signUpWithEmail}
          </Button>
          <Button variant="Blue" onClick={() => loginViaSocial("google")}>
            Continue with Google test
          </Button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "30px 0",
            }}
          >
            <div className={styles.subtitle_line}></div>
            <div className={commonStyles.login_subtitle}>
              {localization?.orContinueWith}
            </div>
            <div className={styles.subtitle_line}></div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Link
              to="#"
              className={styles.soc_fb}
              onClick={() => loginViaSocial("facebook")}
            >
              <img src={Social_1} alt="Facebook logo" />
            </Link>
            <Link
              to="#"
              className={styles.soc_tw}
              onClick={() => loginViaSocial("twitter")}
            >
              <img src={Social_2} alt="Twitter logo" />
            </Link>
            <Link
              to="#"
              className={styles.soc_ap}
              onClick={() => loginViaSocial("apple")}
            >
              <AppleOutlined style={{ fontSize: "29px", color: "black" }} />
            </Link>
          </div>
        </div>
        <div className={commonStyles.footerCentered}>
          <div className={commonStyles.login_subtitle}>
            {localization?.alreadyHaveAnAccount}
          </div>
          <Button variant="Transparent" to="/auth/login">
            {localization?.logInWithEmail}
          </Button>
        </div>
      </div>
      <div className={commonStyles.sideOnboardingImg}>
        <img style={{ height: "100%" }} src={Onboarding} alt="Onboarding" />
      </div>
    </div>
  );
};

export default OnboardingForm;
