import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handlePressKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (searchTerm) {
                router.push(`/search?keyword=${searchTerm}`);
                setSearchTerm("");
            }
        }
        if (event.key === "Escape") {
            setSearchTerm("");
        }
    };

    return (
        <input
            className={styles.searchInput}
            value={searchTerm}
            placeholder='가게 이름으로 찾아보세요'
            onChange={handleChangeInput}
            onKeyDown={handlePressKey}
        />
    );
}
