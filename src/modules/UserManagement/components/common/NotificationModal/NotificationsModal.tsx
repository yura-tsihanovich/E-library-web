import { FC, useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal, Switch } from "antd";
import { useDispatch } from "react-redux";
import {
  getNotificationsSettings,
  setNotificationsSettings,
} from "../../../../Home/slices/home";

import Button from "../../../../../components/common/Buttons/Button";
import commonStyles from "./NotificationsModal.module.scss";
import styles from "../../ProfileUserForm/ProfileUserForm.module.scss";
import Close from "../../../../../assets/images/icons/Close.svg";
import { useLazySelector } from "../../../../../hooks";
import SpinnerBrown from "../../../../../components/common/SpinnerBrown";
import { UserContext } from "../../../../../core/contexts";
import { getLocalization } from "../../../../Auth/slices/auth";
import { useTranslation } from "react-i18next";

interface NotificationsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

interface NotificationFormData {
  startReading: boolean;
  continueReading: boolean;
  newBooks: boolean;
}

const NotificationsModal: FC<NotificationsModalProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const { notificationsSettings } = useLazySelector(({ home }) => ({
    notificationsSettings: home.notificationsSettings,
  }));

  const { handleSubmit, control, reset } = useForm<NotificationFormData>({
    defaultValues: {
      startReading: false,
      continueReading: false,
      newBooks: false,
    },
  });
  const value = useContext(UserContext);

  // console.log(localization);

  useEffect(() => {
    if (value?.language?.isoCode2char) {
      dispatch(getLocalization(value?.language?.isoCode2char));
    }
  }, [dispatch, value?.language?.isoCode2char]);

  console.log("notificationsSettings", notificationsSettings?.result);

  useEffect(() => {
    if (isModalOpen) {
      setLoading(true);
      dispatch(getNotificationsSettings());
    }
  }, [isModalOpen, dispatch]);

  useEffect(() => {
    if (notificationsSettings?.result) {
      reset({
        startReading: notificationsSettings.result.startReading ?? false,
        continueReading: notificationsSettings.result.continueReading ?? false,
        newBooks: notificationsSettings.result.newBooks ?? false,
      });
      setLoading(false);
    }
  }, [notificationsSettings, reset]);

  const hideModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = (data: NotificationFormData) => {
    console.log("data", data);
    dispatch(setNotificationsSettings(data));
    hideModal();
  };

  return (
    <Modal
      title={<div className="custom-modal-title">{t("notifications")}</div>}
      visible={isModalOpen}
      onCancel={hideModal}
      className="custom-modal-settings"
      footer={null}
      closeIcon={
        <img
          className={commonStyles.modalCloseIcon}
          src={Close}
          alt="close-icon"
        />
      }
    >
      {loading ? (
        <div className={styles.spinnerWrapper}>
          <SpinnerBrown />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.kidsSelectWrapper}>
            <span>{t("notificationSettings")}</span>
            <Controller
              name="startReading"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className={styles.kidsSelectWrapper}>
            <span>{t("yourBookshelf")}</span>
            <Controller
              name="continueReading"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className={styles.kidsSelectWrapper}>
            <span>{t("yourFavoriteCategory")}</span>
            <Controller
              name="newBooks"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "30px" }}>
            <Button variant="Brown" type="submit">
              {t("saveBtn")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default NotificationsModal;
