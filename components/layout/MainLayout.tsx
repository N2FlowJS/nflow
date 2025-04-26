import React, { useState } from "react";
import { Menu, ConfigProvider, Layout, Drawer, Button } from "antd";
import {
  SunOutlined,
  MoonOutlined,
  DatabaseOutlined,
  RobotOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  FileOutlined,
  DashboardOutlined,
  MenuOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useLocale } from "../../locale";
import { useTheme } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import styles from '../../styles/MainLayout.module.css';
import LanguageMenu from "./LanguageMenu";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const { Header, Content, Footer } = Layout;

export default function MainLayout({ children }: MainLayoutProps) {
  const { antdLocale, messages } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const handleMenuClick = (e: any) => {
    if (e.key === "knowledge") {
      router.push("/knowledge");
    } else if (e.key === "agent") {
      router.push("/agent");
    } else if (e.key === "login") {
      router.push("/auth/login");
    } else if (e.key === "register") {
      router.push("/auth/register");
    } else if (e.key === "logout") {
      logout();
    } else if (e.key === "profile") {
      router.push(`/user/${user?.id}`);
    } else if (e.key === "home") {
      router.push("/");
    } else if (e.key === "files") {
      router.push("/files");
    }

    // Close mobile menu if it's open
    setMobileMenuOpen(false);
  };

  // Check if user has admin permissions (owner or maintainer)
  const hasAdminPermissions =
    isAuthenticated &&
    user?.permission &&
    (user.permission === "owner" || user.permission === "maintainer" || user.permission === "admin");

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: messages.mainLayout.home,
    },
    {
      key: "knowledge",
      icon: <DatabaseOutlined />,
      label: messages.mainLayout.knowledge,
    },
    {
      key: "files",
      icon: <FileOutlined />,
      label: messages.mainLayout.files,
    },
    {
      key: "agent",
      icon: <RobotOutlined />,
      label: messages.mainLayout.aiAgent,
    },
    // Admin section - only visible to users with admin permissions
    ...(hasAdminPermissions
      ? [
        {
          key: "admin",
          icon: <DashboardOutlined />,
          label: messages.mainLayout.monitoring,
          onClick: () => router.push("/admin/tasks"),
        },
      ]
      : []),
  ];

  const rightMenuItems = [
    {
      key: "theme",
      icon: theme === "light" ? <SunOutlined /> : <MoonOutlined />,
      label: messages.mainLayout.theme,
      onClick: toggleTheme,
    },
    {
      key: "locale-menu",
      label: <LanguageMenu />,
      // Remove icon and children, handled inside LanguageMenu
    },
    // Auth menu items are conditionally displayed
    ...(isAuthenticated
      ? [
        {
          key: "profile",
          icon: <UserOutlined />,
          label: user?.name || messages.mainLayout.profile,
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: messages.mainLayout.logout,
        },
      ]
      : [
        {
          key: "login",
          icon: <LoginOutlined />,
          label: messages.mainLayout.login,
        },
        {
          key: "register",
          icon: <UserAddOutlined />,
          label: messages.mainLayout.register,
        },
      ]),
  ];

  // Combine all menu items for mobile view
  const allMenuItems = [...menuItems, ...rightMenuItems];

  return (
    <ConfigProvider locale={antdLocale}>
      <Layout className={styles.layoutContainer}>
        {/* Desktop Menu */}
        <Header className={`${styles.header} ${theme === "dark" ? styles.headerDark : styles.headerLight}`}>
          {/* Logo and Left Menu Items */}
          <div className={styles.logoContainer}>
            <div
              className={styles.logo}
              onClick={() => router.push("/")}
            >
              N-Flow
            </div>
            <div className={styles.desktopMenu}>
              <Menu
                mode="horizontal"
                onClick={handleMenuClick}
                items={menuItems}
                selectedKeys={[router.pathname === "/" ? "home" : ""]}
                className={styles.menuTransparent}
              />
            </div>
          </div>

          {/* Right Menu Items (Desktop) */}
          <div className={styles.desktopMenu}>
            <Menu
              mode="horizontal"
              onClick={handleMenuClick}
              items={rightMenuItems}
              selectedKeys={[]}
              className={styles.menuTransparent}
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            className={styles.mobileMenuButton}
            icon={<MenuOutlined />}
            type="text"
            onClick={() => setMobileMenuOpen(true)}
          />
        </Header>

        {/* Mobile Menu Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
        >
          <Menu
            mode="vertical"
            items={allMenuItems}
            onClick={handleMenuClick}
            style={{ borderRight: "none" }}
          />
        </Drawer>

        {/* Page Content */}
        <Content className={`${styles.content} ${theme === "dark" ? styles.contentDark : styles.contentLight}`}>
          {/* Main Content */}
          <div className={`${styles.mainContent} ${theme === "dark" ? styles.mainContentDark : styles.mainContentLight}`}>
            {children}
          </div>
        </Content>

        {/* Footer */}
        <Footer className={`${styles.footer} ${theme === "dark" ? styles.footerDark : styles.footerLight}`}>
          {messages.mainLayout.footer} © {new Date().getFullYear()} - Knowledge Management Platform
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
