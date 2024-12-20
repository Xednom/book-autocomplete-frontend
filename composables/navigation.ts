export function useNavigationMenu() {
    const navigationMenu = () => {
        return [
            {
                label: 'Home',
                items: [{ label: 'Library', icon: 'pi pi-fw pi-home', to: '/' }]
            },
            {
                label: 'Book Club',
                items: [{ label: 'Book Meeting', icon: 'pi pi-fw pi-building', to: '/meeting' }, { label: 'Book Notes', icon: 'pi pi-fw pi-file', to: '/book-notes' }]
            },
        ]
    };
    return { navigationMenu }
}