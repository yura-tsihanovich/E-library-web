import ProfileUserComponent from "../components/ProfileUserComponent";
import { useLazySelector } from "../../../hooks";
import { useCallback, useEffect } from "react";
import {
  deleteUserAccount,
  getLanguages,
  getMe,
  setAvatar,
  setKidsMode,
  setProfile,
  uploadUserPhotoId,
} from "../../Auth/slices/auth";
import { useDispatch } from "react-redux";
import { routes } from "../../Home/routing";
import { useHistory } from "react-router-dom";

const ProfileUserContainer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { languages, photoId } = useLazySelector(({ auth }) => {
    const { languages, photoId } = auth;
    return {
      languages,
      photoId,
    };
  });

  const setUserAvatar = async (avatarId: number) => {
    try {
      // Ensure dispatch is completed before proceeding
      await dispatch(
        setAvatar({
          avatarSettings: null,
        })
      );
      dispatch(getMe());
      // Navigate after the delay
      await history.push(routes.askQuestionAll);
    } catch (error) {
      console.error("Error setting user avatar:", error);
    }
  };

  useEffect(() => {
    dispatch(getLanguages());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (values) => {
      dispatch(setProfile(values));
    },
    [dispatch]
  );

  const handleUpload = (values: any) => {
    dispatch(uploadUserPhotoId(values));
  };
  const handleKidsMode = (value: any) => {
    dispatch(setKidsMode({ kidsMode: value }));
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
    />
  );
};
export default ProfileUserContainer;
