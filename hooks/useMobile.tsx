import { Grid, theme } from "antd";

const { useBreakpoint } = Grid;

export function useMobile() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    return {
        isMobile
    };
}
export function useToken() {
    const { token } = theme.useToken();

    return { token }

}
