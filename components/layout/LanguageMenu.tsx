import React, { useState, useMemo } from "react";
import { Menu, Dropdown, Input } from "antd";
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

    const menu = (
        <Menu
        style={ {maxHeight:300}}
            selectedKeys={[locale]}
            onClick={({ key }) => changeLocale(key)}
        >
            <Menu.Item key="search" disabled style={{ cursor: "default", background: "transparent" }}>
                <Input
                    autoFocus
                    placeholder={t('mainLayout.searchLanguage')}
                    size="small"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </Menu.Item>
            {filteredLocales.map(l => (
                <Menu.Item key={l.key}>{l.label}</Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <span style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <GlobalOutlined />
                {supportedLocales.find(l => l.key === locale)?.label || locale}
            </span>
        </Dropdown>
    );
}
