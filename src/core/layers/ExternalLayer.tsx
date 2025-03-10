import { Spinner } from "components/common";

// External layer
// Setup public Application part
const ExternalLayer: React.FC = ({ children }) => {
  // Show SpinnerBrown during External part loading
  if (false) return <Spinner />;

  return <>{children}</>;
};

export default ExternalLayer;
