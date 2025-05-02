import React, { useState, useMemo } from "react";
import {  Dropdown, Input } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useLocale } from "../../locale";
import { supportedLocales } from "../../locale/supportedLocales";

export default function LanguageMenu() {
    const { locale, changeLocale, t } = useLocale();
    const [search, setSearch] = useState("");

    const filteredLocales = useMemo(
        () =>
            supportedLocales.filter(l =>
                l.label.toLowerCase().includes(search.toLowerCase())
            ),
        [search]
    );

    const menuItems = [
        {
            key: "search",
            disabled: true,
            style: { cursor: "default", background: "transparent" },
            label: (
                <Input
                    autoFocus
                    placeholder={t('mainLayout.searchLanguage')}
                    size="small"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onClick={e => e.stopPropagation()} // Prevent dropdown close on click
                />
            ),
        },
        ...filteredLocales.map(l => ({
            key: l.key,
            label: l.label,
        })),
    ];

    return (
        <Dropdown
            menu={{
                items: menuItems,
                style: { maxHeight: 300, overflowY: 'auto' },
                selectedKeys: [locale],
                onClick: ({ key }) => {
                    if (key !== 'search') {
                        changeLocale(key);
                    }
                },
            }}
            trigger={['click']}
            placement="bottomRight"
        >
            <span style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <GlobalOutlined />
                {supportedLocales.find(l => l.key === locale)?.label || locale}
            </span>
        </Dropdown>
    );
}
