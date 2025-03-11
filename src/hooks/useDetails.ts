import { useContext } from "react";
import { DetailsContext } from "../contexts/detailsContext";

export const useDetails = () => {
  const context = useContext(DetailsContext);
  if (!context) {
    throw new Error("useDetails must be used within a DetailsProvider");
  }
  return context;
};
