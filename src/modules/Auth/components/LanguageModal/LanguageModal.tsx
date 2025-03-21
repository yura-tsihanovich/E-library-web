import commonStyles from "../../../../assets/css/commonStyles/CommonStyles.module.scss";
import Close from "../../../../assets/images/icons/Close.svg";
import { Input, Modal } from "antd";
import Search from "../../../../assets/images/icons/SearchIcon.svg";
import Button from "../../../../components/common/Buttons/Button";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface LanguageModalProps {
  isModalOpen: any;
  setIsModalOpen: any;
  languages: any;
  defaultLanguage: any;
  onLanguageSelect: any;
  currentSelectedLanguage?: {
    id: number;
    name: string;
    isoCode: string;
    isoCode2char: string;
    flag: {
      id: string;
      prefix: string;
      postfix: string;
      name: string;
    };
    translationType: string;
  };
}

type LanguageType = {
  id: number;
  name: string;
  isoCode2char: string;
  flag: {
    link: string;
  };
};

const LanguageModal: FC<LanguageModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  languages,
  currentSelectedLanguage,
  defaultLanguage,
  onLanguageSelect,
}) => {
  const { t } = useTranslation();
  const initialLanguage = currentSelectedLanguage
    ? currentSelectedLanguage
    : defaultLanguage;

  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [searchTerm, setSearchTerm] = useState("");
  const hideModal = () => {
    setIsModalOpen(false); // исправлено: закрытие окна
    setSearchTerm("");
  };

  useEffect(() => {
    setSelectedLanguage(currentSelectedLanguage || defaultLanguage);
  }, [currentSelectedLanguage, defaultLanguage]);

  const handleLanguageSelect = async (lang: LanguageType) => {
    setSelectedLanguage(lang);
    onLanguageSelect(lang);
    hideModal();
  };

  const handleChangeAppLang = async (lang: LanguageType) => {
    try {
      await i18next.changeLanguage(lang.isoCode2char);
    } catch (err) {
      console.log(err);
    } finally {
      setSelectedLanguage(lang);
      onLanguageSelect(lang);
      hideModal();
    }
  };

  const filteredLanguages = languages?.filter((lang: LanguageType) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      title={
        <div className={commonStyles.selectLangModalHeader}>
          <div className="custom-modal-title">{t("selectLanguage")}</div>
          <img src={Close} alt="close" />
        </div>
      }
      visible={isModalOpen}
      onOk={hideModal}
      onCancel={hideModal}
      className="custom-modal"
      footer={null}
      closable={false}
    >
      <Input
        placeholder="Search"
        prefix={<img src={Search} alt="search" />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={commonStyles.searchInput}
      />

      <div className={commonStyles.languageList}>
        {/* Official Translations */}
        {filteredLanguages.some((lang: any) => lang.translationType) ? (
          <>
            <span style={{ fontWeight: 600, fontSize: "22px" }}>
              Official Translations
            </span>
            <div>
              {filteredLanguages
                .filter((lang: any) => lang.translationType === "official")
                .map((lang: LanguageType) => (
                  <div
                    key={lang.id}
                    className={`${commonStyles.languageItem} ${
                      lang.name === selectedLanguage.name
                        ? commonStyles.active
                        : ""
                    }`}
                    onClick={() => handleLanguageSelect(lang)}
                  >
                    <div
                      className={commonStyles.flagIcon}
                      style={{
                        backgroundImage: `url(${lang.flag.link})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "140%",
                      }}
                    ></div>
                    <span style={{ paddingLeft: 22 }}>{lang.name}</span>
                  </div>
                ))}
            </div>
            <div className={commonStyles.divider}></div>

            {/* AI-Generated Translations */}
            <span style={{ fontWeight: 600, fontSize: "22px" }}>
              AI-Generated Translations
            </span>
            <div>
              {filteredLanguages
                .filter((lang: any) => lang.translationType === "ai")
                .map((lang: LanguageType) => (
                  <div
                    key={lang.id}
                    className={`${commonStyles.languageItem} ${
                      lang.name === selectedLanguage.name
                        ? commonStyles.active
                        : ""
                    }`}
                    onClick={() => handleLanguageSelect(lang)}
                  >
                    <div
                      className={commonStyles.flagIcon}
                      style={{
                        backgroundImage: `url(${lang.flag.link})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "140%",
                      }}
                    ></div>
                    <span style={{ paddingLeft: 22 }}>{lang.name}</span>
                  </div>
                ))}
            </div>
          </>
        ) : (
          // If there's no translationType field, render languages without filtering
          <div>
            {filteredLanguages.map((lang: LanguageType) => (
              <div
                key={lang.id}
                className={`${commonStyles.languageItem} ${
                  lang.name === selectedLanguage.name ? commonStyles.active : ""
                }`}
                onClick={() => handleChangeAppLang(lang)}
              >
                <div
                  className={commonStyles.flagIcon}
                  style={{
                    backgroundImage: `url(${lang.flag.link})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "140%",
                  }}
                />
                <span style={{ paddingLeft: 22 }}>{lang.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right" }}>
        <Button variant="Brown" onClick={hideModal}>
          {t("backBtn")}
        </Button>
      </div>
    </Modal>
  );
};

export default LanguageModal;
