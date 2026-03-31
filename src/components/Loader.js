import React from "react";
import { useSelector } from "react-redux";
import { selectIsLoading } from "../slices/loading";

const Loader = () => {
  const isLoading = useSelector(selectIsLoading);

  if (!isLoading) return null;

  return (
    <div className="global-loader-overlay">
      <div className="global-loader">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="global-loader-text">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
