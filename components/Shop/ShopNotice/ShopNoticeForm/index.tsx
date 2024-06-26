import classNames from "classnames/bind";
import { useForm } from "react-hook-form";
import styles from "./ShopNoticeForm.module.scss";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useState } from "react";
import Image from "next/image";
import { NoticeData, NoticeFormData, NoticeFormProps } from "../ShopNotice.types";
import { useRecoilValue } from "recoil";
import { employerAtom } from "@/atoms/employerAtom";
import { instance } from "@/utils/instance";
import { IModalProps } from "@/components/Modal/Modal.types";
import ConfirmModal from "@/components/Modal/ModalContent/AlertModal";
import { MIN_WAGE } from "@/constants/constants";

const cx = classNames.bind(styles);

const ShopNoticeForm = ({ onClose, onSubmit }: NoticeFormProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<IModalProps>({
    modalType: "",
    content: "",
    btnName: [""],
  });
  const { register, handleSubmit } = useForm<NoticeFormData>();

  const shopValue = useRecoilValue(employerAtom);
  const shopId = shopValue.shopId;

  const handleCloseAlert = () => {
    setShowAlert(false);
    if (modalType === "confirm") {
      onClose();
    }
  };

  const handleSubmitForm = async (data: NoticeFormData) => {
    const startsAtDate = new Date(data.startsAt);
    const formattedStartsAt = startsAtDate.toISOString();

    const body: NoticeData = {
      hourlyPay: parseInt(data.hourlyPay),
      startsAt: formattedStartsAt,
      workhour: parseInt(data.workhour),
      description: data.description,
    };

    if (body.hourlyPay < MIN_WAGE) {
      setModalData({
        modalType: "alert",
        content: `기본 시급은 최저 시급인 ${MIN_WAGE}원 이상이어야 합니다.`,
        btnName: ["확인"],
      });
      setModalType("alert");
      setShowAlert(true);
      return;
    }

    try {
      const response = await instance.post(`/shops/${shopId}/notices`, body);
      if (response.status === 200) {
        setModalData({
          modalType: "alert",
          content: "등록이 완료되었습니다.",
          btnName: ["확인"],
        });
        setShowAlert(true);
        onSubmit();
        setModalType("confirm");
      } else {
        setModalData({
          modalType: "alert",
          content: "프로필 정보를 제대로 입력해주세요.",
          btnName: ["확인"],
        });
        setModalType("alert");
        setShowAlert(true);
      }
    } catch (error) {
      alert("공고등록 error");
    }
  };

  return (
    <main className={cx(["notice"], ["main"])}>
      <div className={cx("header")}>
        <h1 className={cx("title")}>공고 등록</h1>
        <Image
          src="/image/icon/shop_close.svg"
          width={32}
          height={32}
          alt="close button"
          onClick={onClose}
          className={cx("close-button")}
        />
      </div>
      <form className={cx("form")} onSubmit={handleSubmit(handleSubmitForm)}>
        <div className={cx("input-wrapper")}>
          <section className={cx("input__section")}>
            <Input
              label="시급"
              type="number"
              id="hourlyPay"
              register={register("hourlyPay", { required: true })}
              suffix="원"
            />
          </section>
          <section className={cx("input__section")}>
            <Input
              label="시작 일시"
              type="datetime-local"
              id="startsAt"
              register={register("startsAt", {
                required: true,
              })}
            />
          </section>
          <section className={cx("input-section")}>
            <Input
              label="업무 시간"
              type="number"
              id="workhour"
              register={register("workhour", {
                required: true,
              })}
              suffix="시간"
            />
          </section>
        </div>
        <section className={cx("textarea-section")}>
          <Input
            label="공고 설명"
            type="text"
            id="description"
            register={register("description", { required: true })}
            isTextArea={true}
          />
        </section>
        <div className={cx("button-section")}>
          <div className={cx("button-wrapper")}>
            <Button btnColorType="orange">등록하기</Button>
          </div>
        </div>
      </form>
      {showAlert && (
        <div className={cx("overlay")}>
          <ConfirmModal modalData={modalData} closeFunction={handleCloseAlert} />
        </div>
      )}
    </main>
  );
};

export default ShopNoticeForm;
