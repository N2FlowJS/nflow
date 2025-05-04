import React, { useState } from "react";
import { Menu, Layout, Drawer, Button, Flex, Card } from "antd";
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
  GithubOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useLocale } from "../../locale";
import { useTheme } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import LanguageMenu from "./LanguageMenu";
import { useGitHubStats } from '../../hooks/useGitHubStats';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const { Header, Content, Footer } = Layout;

export default function MainLayout({ children }: MainLayoutProps) {
  const { messages } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stars, loading } = useGitHubStats();

  const handleMenuClick = async (e: any) => {
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
      await router.push("/files");
    } else if (e.key === "github") {
      window.open("https://github.com/N2FlowJS/nflow", "_blank");
    } else if (e.key === "docs") {
      window.open("https://n2flowjs.github.io/nflow", "_blank");
    }

    // Close mobile menu if it's open
    setMobileMenuOpen(false);
  }

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
      label: messages.mainLayout.knowledge

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
    {
      key: "github",
      icon: <GithubOutlined />,
      label: "GitHub",
    },
    {
      key: "docs",
      icon: <FileOutlined />,
      label: "Docs",
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
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        padding: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        background: theme === 'dark' ? '#141414' : '#fff'
      }}>
        <Flex align="center">
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              padding: '0 24px',
              cursor: 'pointer'
            }}
            onClick={() => router.push("/")}
          >
            N-Flow
          </div>
          <Menu
            mode="horizontal"
            onClick={handleMenuClick}
            items={menuItems}
            selectedKeys={[router.pathname === "/" ? "home" : ""]}
            style={{ background: 'transparent', borderBottom: 'none' }}
          />
        </Flex>

        <Flex>
          <Menu
            mode="horizontal"
            onClick={handleMenuClick}
            items={rightMenuItems}
            selectedKeys={[]}
            style={{ background: 'transparent', borderBottom: 'none' }}
          />
        </Flex>

        <Button
          icon={<MenuOutlined />}
          type="text"
          onClick={() => setMobileMenuOpen(true)}

        />
      </Header>

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
          style={{ borderRight: 'none' }}
        />
      </Drawer>

      <Card style={{
        padding: '0 20px',
        overflow: 'auto',
        flex: 1,
      }}>

        {children}
      </Card>

      <Footer style={{
        background: theme === 'dark' ? '#141414' : '#f0f2f5'
      }}>
        <Flex justify="space-between" align="center">
          <span>{messages.mainLayout.footer} © {new Date().getFullYear()} - Knowledge Management Platform</span>
          <a
            href="https://github.com/N2FlowJS/nflow"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'inherit',
            }}
          >
            <GithubOutlined /> Stars {loading ? '...' : stars || 0}
          </a>
        </Flex>
      </Footer>
    </Layout>
  );
}
