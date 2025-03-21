import styles from "./ChooseAvatar.module.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";
import Button from "../../../../../../components/common/Buttons/Button";
import Spinner from "../../../../../../components/common/Spinner";
import { routes as profileRoutes } from "../../../../../UserManagement/routing";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface AvatarData {
  id: number;
  name: string;
  avatarMiniature: {
    link: string;
  };
  avatarPicture: {
    link: string;
  };
}

interface ChooseAvatarProps {
  setCurrentStep: (value: number) => void;
  avatars: { data: AvatarData[] };
  setSelectedAvatar: (link: string) => void;
  setUserAvatar: (id: number) => void;
  initialSlide: any;
  setInitialSlide: any;
  defaultAvatarId: any;
  currentImage: any;
  setCurrentImage: any;
  isChooseAvatarPage?: boolean;
}

const ChooseAvatar: FC<ChooseAvatarProps> = ({
  setCurrentStep,
  avatars = { data: [] },
  setSelectedAvatar,
  setUserAvatar,
  initialSlide,
  setInitialSlide,
  defaultAvatarId,
  currentImage,
  setCurrentImage,
  isChooseAvatarPage,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <button className="slick-next">Next</button>,
    prevArrow: <button className="slick-prev">Previous</button>,
    centerMode: true,
    focusOnSelect: true,
    centerPadding: "0",
    initialSlide: initialSlide,
    afterChange: (current: number) => {
      if (avatars?.data?.length) {
        const selected = avatars.data[current % avatars.data.length];
        setCurrentImage(selected);
        setSelectedAvatar(selected.avatarPicture.link);
      }
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  if (!currentImage) return <Spinner />;

  const handleNextStep = () => {
    if (isChooseAvatarPage) {
      setUserAvatar(currentImage.id);
      history.push(profileRoutes.profile);
    } else {
      setCurrentStep(2);
      setUserAvatar(currentImage.id);
    }
  };

  return (
    <div className={styles.askQuestionAvatar}>
      <div className={styles.avatarSliderWrap}>
        <div
          className={styles.sliderBackground}
          style={{ backgroundImage: `url(${currentImage.avatarPicture.link})` }}
        ></div>
        <Slider {...settings} className="avatarCarousel">
          {avatars.data.map((avatar) => (
            <div className="slideItem" key={avatar.id}>
              <div>
                <img src={avatar.avatarMiniature.link} alt={avatar.name} />
                <div className="avatarName">{avatar.name}</div>
              </div>
            </div>
          ))}
        </Slider>
        <div className={styles.gratisBlock}>
          {t("helloAvatar1")}
          <br /> {t("helloAvatar2")}
        </div>
        <div className={styles.subTitle}>{t("avatarLook")}</div>
        <Button
          onClick={handleNextStep}
          style={{ width: "341px", margin: "20px auto 20px" }}
          variant="Brown"
        >
          {t("chooseBtn")} {currentImage.name}
        </Button>
      </div>
    </div>
  );
};

export default ChooseAvatar;
