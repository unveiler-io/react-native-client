import React, { createContext } from 'react'

import type { UseRawGnssMeasurementsResult } from './useRawGnssMeasurements'
import { useRawGnssMeasurements } from './useRawGnssMeasurements'

interface VerifiedLocationContextType {
  RawGnssMeasurements: UseRawGnssMeasurementsResult
}

interface VerifiedLocationParams {
  minEpochs?: number
  maxEpochs?: number
}

const VerifiedLocationContext = createContext<VerifiedLocationContextType | undefined>(undefined)

export const VerifiedLocationProvider = ({
  children,
  minEpochs,
  maxEpochs,
}: { children: React.ReactNode | React.ReactNode[] } & VerifiedLocationParams) => {
  const useRawGnssMeasurementsResults = useRawGnssMeasurements({ minEpochs, maxEpochs })

  return (
    <VerifiedLocationContext.Provider value={{ RawGnssMeasurements: useRawGnssMeasurementsResults }}>
      {children}
    </VerifiedLocationContext.Provider>
  )
}

/**
 * Exposes the value of the VerifiedLocation details from a VerifiedLocationProvider, or creates a new one
 * if this hook is not called as a nested child of a VerifiedLocationProvider.
 *
 * @param params Optional parameters used when this hook is not called nested within a VerifiedLocationProvider.
 */
export const useVerifiedLocation = ({
  ...params
}: VerifiedLocationParams | undefined): VerifiedLocationContextType => {
  // Load the old context
  const context = React.useContext<VerifiedLocationContextType | undefined>(VerifiedLocationContext)

  // Register the raw gnss measurements hook, mark it as inactive if we
  // can supply it from context.
  const newRawGnssMeasurements = useRawGnssMeasurements({ ...params, active: context === undefined })

  // First, attempt to return our existing context.
  // Otherwise fall back to making a new one.
  return (
    context ?? {
      RawGnssMeasurements: newRawGnssMeasurements,
    }
  )
}

export default VerifiedLocationProvider
