import { Spinner } from 'components/common'

// Initialization layer
// common setup for whole Application
const InitializationLayer: React.FC = ({ children }) => {
  // Show Spinner during Application loading
  if (false) return <Spinner />

  return <>{children}</>
}

export default InitializationLayer
