export function useNavigationMenu() {
    const navigationMenu = () => {
        return [
            {
                label: 'Home',
                items: [{ label: 'Library', icon: 'pi pi-fw pi-home', to: '/' }]
            },
        ]
    };
    return { navigationMenu }
}