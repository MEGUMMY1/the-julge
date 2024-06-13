import React, { useState, useEffect } from "react";
import styles from "./Search.module.scss";
import { useRouter } from "next/router";
import { fetchNoticeList } from "@/api/NoticeList";
import { NoticeItem } from "@/types/types";
import classNames from "classnames/bind";
import DropdownSmall from "../DropdownSmall";
import Filter from "../Filter";
import { calculateIncreasePercent } from "@/utils/calculateIncreasePercent";
import Link from "next/link";
import Post from "../Post";
import Pagination from "../Pagination";
import Spinner from "../Spinner";

const cx = classNames.bind(styles);

const Search = () => {
    const router = useRouter();
    const [notices, setNotices] = useState<NoticeItem[]>([]);
    const [filteredAndSortedNotices, setFilteredAndSortedNotices] = useState<NoticeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState("time");
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [minPay, setMinPay] = useState<number | null>(null);

    const sortNotices = (notices: NoticeItem[], option: string): NoticeItem[] => {
        switch (option) {
            case "pay":
                return [...notices].sort((a, b) => b.hourlyPay - a.hourlyPay);
            case "hour":
                return [...notices].sort((a, b) => a.workhour - b.workhour);
            case "shop":
                return [...notices].sort((a, b) =>
                    a.shop.item.name.localeCompare(b.shop.item.name)
                );
            case "new":
                return [...notices].sort(
                    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
                );
            case "time":
            default:
                return [...notices].sort(
                    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
                );
        }
    };

    const filterAndSortNotices = () => {
        let filtered = [...notices];

        if (selectedLocations.length > 0) {
            filtered = filtered.filter((notice) =>
                selectedLocations.includes(notice.shop.item.address1)
            );
        }

        if (selectedDate) {
            filtered = filtered.filter(
                (notice) => new Date(notice.startsAt).getTime() >= selectedDate.getTime()
            );
        }

        if (minPay !== null) {
            filtered = filtered.filter((notice) => notice.hourlyPay >= minPay);
        }

        const sorted = sortNotices(filtered, sortOption);
        setFilteredAndSortedNotices(sorted);
    };

    const { page = 1, keyword } = router.query;
    const currentPage = parseInt(page as string, 10);
    const postsPerPage = 6;

    const handleOpenFilter = () => {
        setIsFilterOpen(true);
    };

    const handleCloseFilter = () => {
        setIsFilterOpen(false);
    };

    const handleApplyFilter = (locations: string[], date: Date | null, pay: number | null) => {
        setSelectedLocations(locations);
        setSelectedDate(date);
        setMinPay(pay);
        setIsFilterOpen(false);
    };

    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = filteredAndSortedNotices.slice(startIndex, endIndex);

    useEffect(() => {
        filterAndSortNotices();
    }, [notices, selectedLocations, selectedDate, minPay, sortOption]);

    useEffect(() => {
        const fetchResultNotices = async (keyword: string) => {
            try {
                const allNotices = await fetchNoticeList();

                setNotices(allNotices);
                setLoading(false);
                const filtered = allNotices.filter(
                    (notice) =>
                        notice.shop.item.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        notice.shop.item.description
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        notice.description.toLowerCase().includes(keyword.toLowerCase())
                );
                setNotices(filtered);
            } catch (error) {
                setError("Failed to fetch data");
                setLoading(false);
            }
        };
        if (keyword) {
            fetchResultNotices(keyword as string);
        }
    }, [keyword]);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={cx("notice__wrapper")}>
            <div className={cx("notice__container")}>
                <div className={cx("noticeTitle__container")}>
                    <h2 className={cx("title")}>
                        <span className={cx("title_keyword")}>{keyword}</span>에 대한 공고 목록
                    </h2>
                    <div className={cx("noticeTitle__options")}>
                        <DropdownSmall onOptionSelect={setSortOption} />
                        <div className={cx("filter__wrapper")}>
                            <button className={cx("filter__btn")} onClick={handleOpenFilter}>
                                상세 필터
                            </button>
                            {isFilterOpen && (
                                <Filter
                                    onClose={handleCloseFilter}
                                    onApplyFilter={handleApplyFilter}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {notices.length > 0 ? (
                    <div className={cx("post__grid")}>
                        {currentPosts.map((notice, index) => {
                            const increasePercent = calculateIncreasePercent(
                                notice.shop.item.originalHourlyPay,
                                notice.hourlyPay
                            );

                            return (
                                <Link
                                    key={notice.id}
                                    href={`/notices/${notice.shop.item.id}/${notice.id}`}
                                >
                                    <Post
                                        key={notice.id}
                                        startsAt={notice.startsAt}
                                        workhour={notice.workhour}
                                        increasePercent={increasePercent}
                                        shopName={notice.shop.item.name}
                                        shopAddress1={notice.shop.item.address1}
                                        shopImageUrl={notice.shop.item.imageUrl}
                                        hourlyPay={notice.hourlyPay}
                                    />
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p>검색 결과가 없습니다.</p>
                )}
                <Pagination
                    currentPage={currentPage}
                    totalPosts={filteredAndSortedNotices.length}
                    postsPerPage={postsPerPage}
                    type='notice'
                />
            </div>
        </div>
    );
};

export default Search;