import { gql, useLazyQuery } from '@apollo/client'

import { useMachine } from '@xstate/react'
import { Machine } from 'xstate'

import { useRawGnssMeasurements, RawMeasurementsHeader } from './useRawGnssMeasurements'
import type { ClaimrClient } from './ClaimrClient'

const GET_VERIFIED_LOCATION = gql`
  query VerifyLocation($claim: ClaimInput!, $context: ContextInput!) {
    verifyLocation(tokenRequest: { claim: $claim }, context: $context) {
      status
      message
      tokenResponse {
        token {
          claim {
            point {
              location {
                latitude
                longitude
              }
              radius
            }
          }
        }
        jwt
      }
    }
  }
`

type VerifiedLocationResponse = {
  verifyLocation: {
    status: 'GRANTED' | 'REVOKED' | 'ERROR'
    message?: string
    tokenResponse?: TokenResponse
  }
}

type TokenResponse = {
  token: {
    iat: number
    claim: {
      point?: PointClaim
    }
  }
  jwt: string
}

export type PointClaim = {
  location: {
    latitude: number
    longitude: number
  }
  radius: number
}

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
  client: ClaimrClient
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
}

export const useLazyVerifiedLocation = ({
  client,
  claim,
  minEpochs = 4,
  maxEpochs = 10,
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
  const { ready, isListening, rawMeasurements, location, epochs } = useRawGnssMeasurements({
    minEpochs,
    maxEpochs,
  })

  // Prepare the query against the ClaimR API
  const [getVerifiedLocation, { data, error }] = useLazyQuery<VerifiedLocationResponse>(
    GET_VERIFIED_LOCATION,
    {
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
      fetchPolicy: 'network-only',
    }
  )

  // Track the state in a finite state machine
  const [state, send] = useMachine(verifiedLocationMachine, {
    actions: {
      submit: () => {
        console.debug('Submitting')
        getVerifiedLocation({
          variables: {
            claim: claim ?? { point: { location, radius: 100 } },
            context: { gnssLog: RawMeasurementsHeader + rawMeasurements },
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
    state.matches('ready') || state.matches('success') || state.matches('failed') || state.matches('revoked')
  const submit = canSubmit ? () => send('SUBMIT') : undefined

  return {
    claim: data?.verifyLocation?.tokenResponse?.token.claim.point,
    jwt: data?.verifyLocation?.tokenResponse?.jwt,
    message: data?.verifyLocation?.message ?? error?.message,
    submit,
    state: state.value as States,
    progress: state.matches('listening')
      ? {
          current: epochs.length,
          target: minEpochs,
        }
      : undefined,
  }
}
