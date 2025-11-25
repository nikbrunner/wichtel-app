import { Store, useStore } from "@tanstack/react-store";

type AuthModalState = {
  isOpen: boolean;
  activeTab: "login" | "signup";
};

const authModalStore = new Store<AuthModalState>({
  isOpen: false,
  activeTab: "login"
});

export function useAuthModal() {
  const state = useStore(authModalStore);

  return {
    isOpen: state.isOpen,
    activeTab: state.activeTab,
    open: (tab: "login" | "signup" = "login") => {
      authModalStore.setState(s => ({ ...s, isOpen: true, activeTab: tab }));
    },
    close: () => {
      authModalStore.setState(s => ({ ...s, isOpen: false }));
    },
    setTab: (tab: "login" | "signup") => {
      authModalStore.setState(s => ({ ...s, activeTab: tab }));
    }
  };
}
