import { Suspense, lazy } from "react";
import { Switch, Redirect } from "react-router-dom";
import { PublicRoute } from "routing/components";
import routes from "./routes";
// import { Loading } from "../components";
import { Spinner } from "../../../components/common";
import Deeplink from "../components/Deeplink/Deeplink";

export { routes };

export const OnboardingRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "OnboardingRoute" */ "modules/Auth/pages/Onboarding"
    )
);
export const LoginRoute = lazy(
  () => import(/* webpackChunkName: "LoginRoute" */ "modules/Auth/pages/Login")
);
export const RegistrationRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "RegistrationRoute" */ "modules/Auth/pages/Registration"
    )
);
export const ForgotRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "ForgotRoute" */ "modules/Auth/pages/ForgotPage"
    )
);
export const RecoverPasswordRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "RecoverPasswordRoute" */ "modules/Auth/pages/RecoverPassword"
    )
);
export const ChangePasswordRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "ChangePasswordRoute" */ "modules/Auth/pages/ChangePasswordPage"
    )
);
export const VerifyEmailSuccessRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "VerifyEmailSuccessRoute" */ "modules/Auth/pages/VerifyEmailSuccessPage"
    )
);
export const EnterCodeRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "EnterCodeRoute" */ "modules/Auth/pages/EnterCodePage"
    )
);
export const ProfileHabitsRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfileHabitsRoute" */ "modules/Auth/pages/ProfileHabitsPage"
    )
);
export const ProfileAuthRoute = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfileAuthRoute" */ "modules/Auth/pages/ProfilePage"
    )
);
export const ProfileAbout = lazy(
  () =>
    import(
      /* webpackChunkName: "ProfileAuthRoute" */ "modules/Auth/pages/ProfileAboutPage"
    )
);
export const TermsAndConditions = lazy(
  () =>
    import(
      /* webpackChunkName: "AskQuestion" */ "modules/Auth/pages/TermsAndConditionsPage"
    )
);
export const PrivacyPolicy = lazy(
  () =>
    import(
      /* webpackChunkName: "AskQuestion" */ "modules/Auth/pages/PrivacyPolicyPage"
    )
);

const AuthRouting = () => (
  <Suspense fallback={<Spinner />}>
    <Switch>
      <PublicRoute
        exact
        path={routes.onboarding}
        component={OnboardingRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.login}
        component={LoginRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.registration}
        component={RegistrationRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.forgot}
        component={ForgotRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.recoverPassword}
        component={RecoverPasswordRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.changePassword}
        component={ChangePasswordRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.verifyEmailSuccess}
        component={VerifyEmailSuccessRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.enterCode}
        component={EnterCodeRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.ProfileHabits}
        component={ProfileHabitsRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.Profile}
        component={ProfileAuthRoute}
        restricted
      />
      <PublicRoute
        exact
        path={routes.profileAbout}
        component={ProfileAbout}
        restricted
      />
      <PublicRoute
        exact
        path={routes.termsAndConditions}
        component={TermsAndConditions}
      />
      <PublicRoute
        exact
        path={routes.privacyPolicy}
        component={PrivacyPolicy}
      />

      <PublicRoute
        exact
        path={routes.deeplink}
        component={Deeplink}
        restricted
      />

      <Redirect path="*" to={routes.onboarding} />
    </Switch>
  </Suspense>
);

export default AuthRouting;
