import React, { useEffect, useState } from "react";
import styles from "./ShopView.module.scss";
import classNames from "classnames/bind";
import Button from "@/components/Button";
import Image from "next/image";
import { FormData, ShopViewProps } from "../Shop.types";
import { fetchShopData } from "@/api/myShop";
import { useRecoilValue } from "recoil";
import Spinner from "@/components/Spinner";
import { employerAtom } from "@/atoms/employerAtom";
import ShopNotice from "../ShopNotice";
import ShopNoticeForm from "../ShopNotice/ShopNoticeForm";

const cx = classNames.bind(styles);

const ShopView: React.FC<ShopViewProps> = ({ onEdit }) => {
  const [shopData, setShopData] = useState<FormData | null>(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  const shopValue = useRecoilValue(employerAtom);
  useEffect(() => {
    const fetchAndSetShopData = async () => {
      if (shopValue) {
        try {
          const response = await fetchShopData(shopValue.shopId);
          setShopData(response.data.item);
        } catch (error) {
          console.error("Fetching shop data failed:", error);
        }
      }
    };

    fetchAndSetShopData();
  }, [shopValue]);

  const handleOpenNoticeForm = () => {
    setShowNoticeForm(true);
  };
  const handleCloseNoticeForm = () => {
    setShowNoticeForm(false);
  };

  if (!shopData) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={cx("profile")}>
      {showNoticeForm ? (
        <ShopNoticeForm
          onClose={handleCloseNoticeForm}
          onSubmit={handleCloseNoticeForm}
        />
      ) : (
        <>
          <div className={cx("container")}>
            <div className={cx("header")}>
              <h1 className={cx("title")}>내 가게</h1>
            </div>
            <div className={cx("info-wrapper")}>
              <div className={cx("notice-info__img")}>
                <Image
                  style={{
                    objectFit: "cover",
                  }}
                  fill
                  src={shopData.imageUrl}
                  alt="가게 이미지"
                />
              </div>
              <div className={cx("info")}>
                <div className={cx("details")}>
                  <div className={cx("detail-name")}>
                    <p className={cx("name")}>식당</p>
                    <h2 className={cx("my-name")}>{shopData.name}</h2>
                  </div>
                  <div className={cx("detail")}>
                    <Image
                      width={20}
                      height={20}
                      src="/image/icon/location.svg"
                      alt="위치 아이콘"
                    />
                    <p>{shopData.address1}</p>
                  </div>
                  <p className={cx("bio")}>{shopData.description}</p>
                </div>
                <div className={cx("button-wrapper")}>
                  <Button
                    btnColorType="white"
                    btnCustom="userNoticeDetailed"
                    onClick={onEdit}
                  >
                    편집하기
                  </Button>
                  <Button
                    btnColorType="orange"
                    btnCustom="userNoticeDetailed"
                    onClick={handleOpenNoticeForm}
                  >
                    공고 등록하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <ShopNotice onClick={handleOpenNoticeForm} />
        </>
      )}
    </div>
  );
};

export default ShopView;
