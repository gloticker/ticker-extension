import { useEffect, useState, useCallback } from "react";
import { storage } from "../utils/storage";
import { DetailsContext } from "./detailsContext";

export const DetailsProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<{
        isDetailsVisible: boolean;
        isLoading: boolean;
    }>({
        isDetailsVisible: true,
        isLoading: true
    });

    const loadDetails = useCallback(async () => {
        try {
            const savedDetails = await storage.get<boolean>("isDetailsVisible");
            if (savedDetails === null || savedDetails === undefined) {
                await storage.set("isDetailsVisible", true);
                setState({ isDetailsVisible: true, isLoading: false });
            } else {
                setState({ isDetailsVisible: savedDetails, isLoading: false });
            }
        } catch (error) {
            console.error("[DetailsProvider] Failed to load details:", error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    const toggleDetails = async () => {
        try {
            const newState = !state.isDetailsVisible;
            setState(prev => ({ ...prev, isDetailsVisible: newState }));
            await storage.set("isDetailsVisible", newState);
        } catch (error) {
            console.error("[DetailsProvider] Failed to toggle details:", error);
            setState(prev => ({ ...prev, isDetailsVisible: !prev.isDetailsVisible }));
        }
    };

    if (state.isLoading) {
        return null;
    }

    return (
        <DetailsContext.Provider value={{
            isDetailsVisible: state.isDetailsVisible,
            toggleDetails
        }}>
            {children}
        </DetailsContext.Provider>
    );
};
