import { useMachine } from '@xstate/react'
import { Point, useVerifyLocationLazyQuery, VerifyLocationQueryVariables } from 'apollo/generated/graphql'
import { Machine } from 'xstate'

import type { UnveilerClient } from './UnveilerClient'
import { RawMeasurementsHeader } from './useRawGnssMeasurements'
import { useVerifiedLocation } from './VerifiedLocationProvider'

export type PointClaim = Point

const verifiedLocationMachineConfiguration = {
  id: 'verifiedLocation',
  initial: 'registeringListener',
  states: {
    registeringListener: {
      on: { LISTENING: 'listening' },
    },
    listening: {
      on: { READY: 'ready' },
    },
    ready: {
      on: { SUBMIT: 'submitting' },
    },
    submitting: {
      on: { GRANTED: 'success', REVOKED: 'revoked', FAILED: 'failed' },
      entry: 'submit',
    },
    success: {
      on: { SUBMIT: 'submitting' },
    },
    revoked: {
      on: { SUBMIT: 'submitting' },
    },
    failed: {
      on: { SUBMIT: 'submitting' },
    },
  },
}

const verifiedLocationMachine = Machine(verifiedLocationMachineConfiguration)

export type States = keyof typeof verifiedLocationMachineConfiguration.states

type LazyVerifiedLocationOptions = {
  client: UnveilerClient
  claim?: {
    point: PointClaim
    // @todo: add area claim support, probably best to use
    // graphql-codegen to directly generate these types
  }
  /**
   * The minimum amount of epochs of GNSS data which should be collected before
   * submit becomes available.
   */
  minEpochs?: number
  maxEpochs?: number
  /**
   * Whether the Unveiler API should retain details from the location verification attempts.
   * Can be useful for purposes where you want to get insight into why requests are failing
   * or from where requests are being made.
   *
   * Make sure that recording and retaining detailed user data is covered in your Terms of
   * Service and Privacy Policy, and that the end-user has accepted these.
   */
  logRequestDetails?: boolean
}

export const useLazyVerifiedLocation = ({
  client,
  claim,
  minEpochs,
  maxEpochs,
  logRequestDetails,
}: LazyVerifiedLocationOptions): {
  state: States
  claim?: PointClaim
  jwt?: string
  message?: string
  submit?: () => void
  // The amount of progress made in the current state
  progress?: {
    current: number
    target: number
  }
} => {
  // Listen for RAW GNSS measurements
  const { RawGnssMeasurements } = useVerifiedLocation({ minEpochs, maxEpochs })
  const { ready, isListening, rawMeasurements, location, progress } = RawGnssMeasurements

  // Prepare the query against the ClaimR API
  const [getVerifiedLocation, { data, error }] = useVerifyLocationLazyQuery({
    client: client.apolloClient,
    onCompleted: ({ verifyLocation }) => {
      console.log('completed')
      const { status } = verifyLocation
      if (status === 'GRANTED') {
        send('GRANTED')
      } else if (status === 'REVOKED') {
        send('REVOKED')
      } else {
        send('FAILED')
      }
    },
    onError: (err) => {
      console.error(err)
      send('FAILED')
    },
    errorPolicy: 'all',
  })

  // Track the state in a finite state machine
  const [state, send] = useMachine(verifiedLocationMachine, {
    actions: {
      submit: () => {
        let claimData: VerifyLocationQueryVariables['claim'] | undefined
        if (claim !== undefined) {
          claimData = claim
        } else if (location !== undefined) {
          claimData = { point: { location, radius: 100 } }
        } else {
          throw new Error('Tried submitting without claim being supplied nor location being available')
        }

        console.debug('Submitting')
        getVerifiedLocation({
          variables: {
            claim: claimData,
            context: { gnssLog: RawMeasurementsHeader + rawMeasurements },
            logRequestDetails,
          },
        })
      },
    },
  })

  // Detect if the listener is successfully attached
  if (state.matches('registeringListener') && isListening) {
    send('LISTENING')
  }

  if (state.matches('listening') && ready && rawMeasurements) {
    send('READY')
  }

  // Define the submit callback
  const canSubmit =
    (state.matches('ready') ||
      state.matches('success') ||
      state.matches('failed') ||
      state.matches('revoked')) &&
    (claim || location)
  const submit = canSubmit ? () => send('SUBMIT') : undefined

  const returnedClaim = data?.verifyLocation?.tokenResponse?.token?.claim?.point
  return {
    claim: returnedClaim === null ? undefined : returnedClaim, // Replace null with undefined
    jwt: data?.verifyLocation?.tokenResponse?.jwt,
    message: data?.verifyLocation?.message ?? error?.message,
    submit,
    state: state.value as States,
    progress: state.matches('listening') ? progress : undefined,
  }
}
