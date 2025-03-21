import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userLoggedOut } from "core/session/slices/session";
import { AuthState } from "./types";
import {
  addUserHabits,
  authConfirm,
  authEdit,
  authLogin,
  authMe,
  authPasswordRecover,
  authRecover,
  authUpdatePhoto,
  authVerifyEmail,
  getAllLanguages,
  getHabitsCategory,
  setUserProfile,
  uploadUserAvatar,
  authRegister,
  resetUserPassword,
  deleteAccount,
  setUserAvatar,
  getSurveyOptions,
  setRegistrationOptionsAbout,
  // getAppLocalization,
  resendConfirmation,
} from "../../api/authService";
import {
  EditUserParams,
  LoginUserParams,
  RecoverData,
  RegisterUserParams,
  TokenData,
} from "../../types";
import { history } from "store";
import { SessionUtils } from "utils";
import homeRoutes from "modules/Home/routing/routes";
import { notification } from "antd";
import routes from "../../routing/routes";
import Alert from "../../../../assets/images/icons/notificationIcon.svg";
import { t } from "i18next";

const initialState: AuthState = {
  loginRequest: {},
  userLoginRequest: {},
  confirmEmailRequest: null,
  userData: {},
  categories: {},
  habits: {},
  recoverData: {},
  changePasswordData: {},
  verifyToken: {},
  languages: {},
  profileInfo: {},
  photoId: {},
  currentEmail: null,
  googleTokenId: {},
  kidsMode: {},
  avatarSettings: {},
  aboutOptions: {},
  appLocalization: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateCurrentEmail(state, action: PayloadAction<any>) {
      state.currentEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoginUser.pending, (state) => {
        state.loginRequest = { isLoading: true };
      })
      .addCase(LoginUser.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.userData = action.payload;
        state.loginRequest = { isLoading: false, result: content, error };
      })
      .addCase(registerUser.pending, (state) => {
        state.userLoginRequest = { isLoading: true };
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.userLoginRequest = { isLoading: false, result: content, error };
      })
      .addCase(addHabits.pending, (state) => {
        state.habits = { isLoading: true };
      })
      .addCase(addHabits.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.habits = { isLoading: false, result: content, error };
      })
      .addCase(uploadUserPhotoId.pending, (state) => {
        state.photoId = { isLoading: true };
      })
      .addCase(uploadUserPhotoId.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.photoId = { isLoading: false, result: content, error };
      })
      .addCase(setProfile.pending, (state) => {
        state.profileInfo = { isLoading: true };
      })
      .addCase(setProfile.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.profileInfo = { isLoading: false, result: content, error };
      })
      .addCase(setKidsMode.pending, (state) => {
        state.kidsMode = { isLoading: true };
      })
      .addCase(setKidsMode.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.kidsMode = { isLoading: false, result: content, error };
      })

      .addCase(emailConfirm.pending, (state) => {
        state.confirmEmailRequest = { isLoading: true };
      })
      .addCase(emailConfirm.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.confirmEmailRequest = {
          isLoading: false,
          result: content,
          error,
        };
      })
      .addCase(getMe.pending, (state) => {
        state.userData = { isLoading: true };
      })
      .addCase(getMe.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.userData = { isLoading: false, result: content, error };
      })
      .addCase(getCategories.pending, (state) => {
        state.categories = { isLoading: true };
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.categories = { isLoading: false, result: content, error };
      })
      .addCase(getLanguages.pending, (state) => {
        state.languages = { isLoading: true };
      })
      .addCase(getLanguages.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.languages = { isLoading: false, result: content, error };
      })
      .addCase(editUser.pending, (state) => {
        state.userData = { isLoading: true };
      })
      .addCase(editUser.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.userData = { isLoading: false, result: content, error };
      })
      .addCase(recoverPassword.pending, (state) => {
        state.recoverData = { isLoading: true };
      })
      .addCase(recoverPassword.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.recoverData = { isLoading: false, result: content, error };
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordData = { isLoading: true };
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.changePasswordData = { isLoading: false, result: content, error };
      })
      .addCase(verifyEmail.pending, (state) => {
        state.verifyToken = { isLoading: true };
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.verifyToken = { isLoading: false, result: content, error };
      })

      .addCase(setAvatar.pending, (state) => {
        state.avatarSettings = { isLoading: true };
      })
      .addCase(setAvatar.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.avatarSettings = { isLoading: false, result: content, error };
      })

      .addCase(getOptionsAbout.pending, (state) => {
        state.aboutOptions = { isLoading: true };
      })
      .addCase(getOptionsAbout.fulfilled, (state, action) => {
        const { content, error } = action.payload;
        state.aboutOptions = { isLoading: false, result: content, error };
      })
      .addCase(getLocalization.pending, (state) => {
        state.appLocalization = { isLoading: true };
      })
      .addCase(getLocalization.fulfilled, (state, action) => {
        // const { content, error } = action.payload;
        // state.appLocalization = { isLoading: false, result: content, error };
      })

      .addCase(userLoggedOut, () => initialState);
  },
});

const {} = authSlice.actions;
export default authSlice.reducer;

export const LoginUser = createAsyncThunk(
  "api/v1/auth/email/login",
  async (formParams: LoginUserParams) => {
    const response = await authLogin(formParams);
    const { success, status, error, content } = response;

    if (!success) {
      if (status === 401) {
        notification.error({
          message: "Login Error",
          description: "Invalid email or password.",
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      } else if (status === 422) {
        notification.error({
          message: t("errors.loginError"),
          description: t("errors.incorrectEmailOrPassword"),
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      } else {
        const errorMessage =
          error?.detail || "An error occurred, please try again later.";
        notification.error({
          message: t("errors.loginError"),
          description: errorMessage,
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      }
    } else if (content && content.token) {
      SessionUtils.storeSession(content.token);
      history.push(homeRoutes.root);
    }
    return response;
  }
);

export const registerUser = createAsyncThunk(
  "api/v1/auth/email/register",
  async (userParams: RegisterUserParams) => {
    const response = await authRegister(userParams);
    console.log("response", response);
    const { success, status, error } = response;
    const errors = error?.errors;

    if (!success) {
      if (status === 422 && errors?.email === "emailAlreadyExists") {
        notification.error({
          message: "Registration Error",
          description: "The email address already exists.",
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      } else if (error?.status === 204) {
        history.push(routes.enterCode);
      } else if (status === 422 && errors) {
        notification.error({
          message: "Registration Error",
          description: `Validation error: ${JSON.stringify(errors)}`,
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      } else if (error?.status !== 204) {
        const errorMessage =
          error?.detail || "An error occurred, please try again later.";
        notification.error({
          message: "Registration Error",
          description: errorMessage,
          duration: 4,
          placement: "top",
          icon: <img src={Alert} alt="icon" />,
        });
      }
    }
    return response;
  }
);

export const codeResend = createAsyncThunk(
  "/api/v1/auth/email/resendConfirmation",
  async (confirmationParams: { email: string }) => {
    const response = await resendConfirmation(confirmationParams);
    return response;
  }
);

export const emailConfirm = createAsyncThunk(
  "api/v1/auth/email/confirm",
  async (confirmParams: { codeOrHash: string }) => {
    const response = await authConfirm(confirmParams);
    const { success, content, error } = response;

    if (!success) {
      notification.error({
        message: "Confirmation Error",
        description: error?.error,
        duration: 4,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    } else {
      SessionUtils.storeSession(content.token);
      history.push(routes.ProfileHabits);
    }
    return response;
  }
);

export const getCategories = createAsyncThunk("api/v1/category", async () => {
  const response = await getHabitsCategory();
  return response;
});

export const getLanguages = createAsyncThunk(
  "api/v1/auth/languageOptions",
  async () => {
    const response = await getAllLanguages();
    return response;
  }
);

export const addHabits = createAsyncThunk(
  "habits/api/v1/auth/me",
  async (userParams: any) => {
    const response = await addUserHabits(userParams);
    const { success, error } = response;

    if (!success) {
      notification.error({
        message: "Add Habits Error",
        description: error?.error,
        duration: 4,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    } else {
      history.push(routes.Profile);
    }
    return response;
  }
);

export const getMe = createAsyncThunk("api/v1/auth/me", async () => {
  const response = await authMe();
  return response;
});

export const getLocalization = createAsyncThunk(
  "/api/v1/localization/web/",
  async (lang: string) => {
    // const response = await getAppLocalization(lang);

    localStorage.setItem("i18nextLng", lang);

    return {};
  }
);

export const setProfile = createAsyncThunk(
  "profile/api/v1/auth/me",
  async (userParams: any, { dispatch }) => {
    const response = await setUserProfile(userParams);
    const { success, error } = response;

    if (!success) {
      notification.error({
        message: "Profile Error",
        description: error?.error,
        duration: 4,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    } else {
      dispatch(getMe());
      history.push(routes.profileAbout);
    }
    return response;
  }
);

export const getOptionsAbout = createAsyncThunk(
  "/api/v1/survey/options",
  async () => {
    const response = await getSurveyOptions();
    return response;
  }
);

export const setOptionsAbout = createAsyncThunk(
  "/api/v1/survey",
  async (userParams: any, { dispatch }) => {
    const response = await setRegistrationOptionsAbout(userParams);
    const { success, error } = response;

    if (!success) {
      notification.error({
        message: "Profile Error",
        description: error?.error,
        duration: 4,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    } else {
      dispatch(getMe());
      history.push(homeRoutes.root);
      // history.push(routes.profileAbout);
    }
    return response;
  }
);

export const setKidsMode = createAsyncThunk(
  "kidsMode/api/v1/auth/me",
  async (userParams: any, { dispatch }) => {
    const response = await setUserProfile(userParams);
    return response;
  }
);

export const setAppLanguage = createAsyncThunk(
  "appLang/api/v1/auth/me",
  async (userParams: any, { dispatch }) => {
    const response = await setUserProfile(userParams);
    const { success } = response;
    if (success) {
      dispatch(getMe());
    }
    return response;
  }
);
export const setBookLanguage = createAsyncThunk(
  "bookLang/api/v1/auth/me",
  async (userParams: any, { dispatch }) => {
    const response = await setUserProfile(userParams);
    return response;
  }
);

export const uploadUserPhotoId = createAsyncThunk(
  "/api/v1/media/upload",
  async (userParams: {
    files: File;
    prefix: string;
    postfix: string;
    tag: string;
  }) => {
    const response = await uploadUserAvatar(userParams);
    const { success, error } = response;

    if (!success) {
      notification.error({
        message: "Upload Error",
        description: error?.error,
        duration: 4,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    }
    return response;
  }
);

export const setAvatar = createAsyncThunk(
  "avatar/api/v1/auth/me",
  async (userParams: any, { dispatch }) => {
    const response = await setUserAvatar(userParams);
    return response;
  }
);

export const recoverPassword = createAsyncThunk(
  "api/v1/auth/forgot/password",
  async (email: string) => {
    const response = await authRecover(email);
    const { error } = response;

    if (error?.status === 204) {
      history.push(routes.verifyEmailSuccess);
    }
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  "api/v1/auth/reset/password",
  async (formParams: any) => {
    const response = await resetUserPassword(formParams);
    const { error } = response;
    if (error?.status === 204) {
      history.push(routes.onboarding);
    }

    return response;
  }
);

export const editUser = createAsyncThunk(
  "auth/editUser",
  async (newUserData: EditUserParams) => {
    const response = await authEdit(newUserData);
    const { content, error } = response;

    if (content) {
      notification.success({
        message: "Success",
        description: "Your data is saved",
        duration: 2,
        placement: "top",
      });
    } else if (error) {
      notification.error({
        message: "Edit User Error",
        description: error?.detail,
        duration: 3,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    }
    return response;
  }
);

export const updatePhoto = createAsyncThunk(
  "auth/updatePhoto",
  async (originObj: any) => {
    const response = await authUpdatePhoto(originObj);
    return response;
  }
);

export const deleteUserAccount = createAsyncThunk(
  "delete/api/v1/auth/me",
  async () => {
    const response = await deleteAccount();
    const { success } = response;
    if (success) {
      history.push(routes.onboarding);
    }
    return response;
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: RecoverData) => {
    const response = await authPasswordRecover(data);
    const { content, error } = response;

    if (content) {
      notification.success({
        message: "Password Changed",
        description: content?.msg,
        duration: 3,
        placement: "top",
      });
    } else if (error) {
      notification.error({
        message: "Change Password Error",
        description: error?.detail,
        duration: 3,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    }
    return response;
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (data: TokenData) => {
    const response = await authVerifyEmail(data);
    const { content, error } = response;

    if (content) {
      history.push(routes.onboarding);
      notification.success({
        message: "Email Verified",
        description: content?.msg,
        duration: 3,
        placement: "top",
      });
    } else if (error) {
      notification.error({
        message: "Verification Error",
        description: error?.detail,
        duration: 3,
        placement: "top",
        icon: <img src={Alert} alt="icon" />,
      });
    }
    return response;
  }
);

export const { updateCurrentEmail } = authSlice.actions;
// export default authSlice.reducer
