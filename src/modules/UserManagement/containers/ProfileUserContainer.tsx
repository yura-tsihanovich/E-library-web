import ProfileUserComponent from "../components/ProfileUserComponent";
import { useLazySelector } from "../../../hooks";
import { useCallback, useContext, useEffect, useRef } from "react";
import {
  deleteUserAccount,
  getLanguages,
  getLocalization,
  getMe,
  setAppLanguage,
  setBookLanguage,
  // getMe,
  // setAvatar,
  setKidsMode,
  setProfileApp,
  uploadUserPhotoId,
} from "../../Auth/slices/auth";
import { useDispatch } from "react-redux";
import { routes } from "../../Home/routing";
import { routes as userManagementRoutes } from "../../UserManagement/routing";
import { useHistory } from "react-router-dom";
import { UserContext } from "../../../core/contexts";

const ProfileUserContainer: React.FC = () => {
  const dispatch = useDispatch();
  const value = useContext(UserContext);
  const history = useHistory();
  const prevPath = useRef(history.location.pathname);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      if (
        prevPath.current === userManagementRoutes.profile &&
        location.pathname !== userManagementRoutes.profile
      ) {
        console.log("User left profile, fetching new data...");
        dispatch(getMe());
      }
      prevPath.current = location.pathname;
    });

    return () => {
      unlisten();
    };
  }, [history, dispatch]);

  const { languages, photoId } = useLazySelector(({ auth }) => {
    const { languages, photoId } = auth;
    return {
      languages,
      photoId,
    };
  });

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  const setUserAvatar = async (avatarId: number) => {
    try {
      // Ensure dispatch is completed before proceeding
      // await dispatch(
      //   setAvatar({
      //     avatarSettings: null,
      //   })
      // );
      // dispatch(getMe());
      // Navigate after the delay
      await history.push(routes.chooseAvatar);
    } catch (error) {
      console.error("Error setting user avatar:", error);
    }
  };

  useEffect(() => {
    dispatch(getLanguages());
    // dispatch(getMe());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (values) => {
      console.log("SUBMIT_VALUES", values);
      dispatch(setProfileApp(values));
    },
    [dispatch]
  );

  const handleUpload = (values: any) => {
    dispatch(uploadUserPhotoId(values));
  };
  const handleKidsMode = (value: any) => {
    dispatch(setKidsMode({ kidsMode: value }));
  };

  const handleAppLanguage = (value: any) => {
    console.log("APP_LANGUAGE", value);
    dispatch(
      setAppLanguage({
        language: {
          id: value.id,
        },
      })
    );
  };
  const handleBookLanguage = (value: any) => {
    console.log("BOOK_LANGUAGE", value);
    dispatch(
      setBookLanguage({
        bookLanguage: {
          id: value.id,
        },
      })
    );
    // dispatch(setAppLanguage({ kidsMode: value }));
  };

  const deleteAccount = () => {
    dispatch(deleteUserAccount());
  };

  return (
    <ProfileUserComponent
      languages={languages?.result?.data}
      onSubmit={handleSubmit}
      handleUpload={handleUpload}
      photoId={photoId?.result?.[0]?.id || null}
      deleteAccount={deleteAccount}
      handleKidsMode={handleKidsMode}
      setUserAvatar={setUserAvatar}
      handleAppLanguage={handleAppLanguage}
      handleBookLanguage={handleBookLanguage}
    />
  );
};
export default ProfileUserContainer;
