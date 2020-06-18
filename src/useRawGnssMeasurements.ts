import { useEffect, useState } from 'react'
import { NativeEventEmitter } from 'react-native'

import GnssLogger from './modules/GnssLogger'

interface LatLon {
  latitude: number
  longitude: number
}

const GnssLoggerEventEmitter = new NativeEventEmitter(GnssLogger)

export const RawMeasurementsHeader = GnssLogger.RAW_GNSS_FILE_HEADER

const useRawGnssMeasurements = ({ bufferSize = 150 }: { bufferSize?: number } = {}) => {
  const [error, setError] = useState<string>('No errors seen yet')
  const [isListening, setIsListening] = useState<boolean>(false)
  const [rawMeasurements, setRawMeasurements] = useState<string[]>([])
  const [location, setLocation] = useState<LatLon | undefined>()

  useEffect(() => {
    GnssLogger.registerGnssMeasurementsCallback(setError, () => setIsListening(true))

    let recentMeasurementsBuffer: string[] = []

    const eventListeners = [
      GnssLoggerEventEmitter.addListener('rawGnssMeasurementLine', ({ message }) => {
        // Add the new measurement
        recentMeasurementsBuffer.push(message)

        // Cap the size of the buffer
        recentMeasurementsBuffer = recentMeasurementsBuffer.slice(-bufferSize)

        setRawMeasurements(recentMeasurementsBuffer)
      }),
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
  }, [bufferSize])

  return {
    error,
    isListening,
    rawMeasurements: rawMeasurements.join('\n'),
    location,
    ready: rawMeasurements.length >= bufferSize,
  }
}

export default useRawGnssMeasurements
