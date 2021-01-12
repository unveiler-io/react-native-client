import { useEffect, useState } from 'react'
import { NativeEventEmitter } from 'react-native'

import GnssLogger from './modules/GnssLogger'

interface Epoch {
  measurementsCount: number
}

interface LatLon {
  latitude: number
  longitude: number
}

export interface UseRawGnssMeasurementsResult {
  error?: string
  isListening: boolean
  rawMeasurements: string
  location?: LatLon
  ready: boolean
  epochs: Epoch[]
  progress?: {
    current: number
    target: number
  }
}

const GnssLoggerEventEmitter = new NativeEventEmitter(GnssLogger)

export const RawMeasurementsHeader = GnssLogger.RAW_GNSS_FILE_HEADER

export const useRawGnssMeasurements = ({
  minEpochs = 4,
  maxEpochs,
  active = true,
}: {
  minEpochs?: number
  maxEpochs?: number
  active?: boolean
}): UseRawGnssMeasurementsResult => {
  // Compute the max amount of epochs to be collected,
  // it should be atleast minEpochs, otherwise it inherits
  // maxEpochs or if omited it's default on 10.
  const adjustedMaxEpochs = Math.max(minEpochs, maxEpochs ?? 10)

  const [error, setError] = useState<string>()
  const [isListening, setIsListening] = useState<boolean>(false)
  const [epochs, setEpochData] = useState<string[][]>([])
  const [location, setLocation] = useState<LatLon | undefined>()

  const collectedEpochCount = epochs.length

  useEffect(() => {
    // Do not register the hook while not active
    if (!active) {
      return
    }

    GnssLogger.registerGnssMeasurementsCallback(setError, () => setIsListening(true))

    const eventListeners = [
      GnssLoggerEventEmitter.addListener('rawGnssMeasurementLines', ({ message }) => {
        // Validate input
        if (typeof message !== 'string') {
          console.error(
            `Received unexpected message from native Android, expected string, found ${typeof message}`
          )
          return
        }

        // The message consists of one or more measurements, separated by line endings
        const newLines = message.split('\n')

        // Store our new measurement in the current state
        setEpochData((previousMeasurementsBuffer) => {
          // Add the new measurement
          const recentMeasurementsBuffer = [...previousMeasurementsBuffer, newLines]

          // Cap the size of the buffer
          return recentMeasurementsBuffer.slice(-adjustedMaxEpochs)
        })
      }),

      // Register an event listener to track the location of the device
      GnssLoggerEventEmitter.addListener('locationChange', ({ message }) => {
        const [latitude, longitude] = message.split(',').map((v: string) => Number.parseFloat(v))
        setLocation({ latitude, longitude })
      }),
    ]

    // Unregister the GNSS Logger and our event listeners
    return () => {
      GnssLogger.unregisterGnssMeasurementsCallback()
      eventListeners.forEach((eventListener) => eventListener?.remove())
      setIsListening(false)
    }
  }, [active, adjustedMaxEpochs])

  return {
    error,
    isListening,
    rawMeasurements: epochs.reduce((a1, a2) => [...a1, ...a2], []).join('\n'),
    epochs: epochs.map((epoch) => ({ measurementsCount: epoch.length })),
    location,
    ready: collectedEpochCount >= minEpochs,
    progress: {
      current: collectedEpochCount,
      target: minEpochs,
    },
  }
}
