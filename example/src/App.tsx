import * as React from 'react'
import { StyleSheet, View, Text, Button } from 'react-native'

import { UnreachableCaseError } from 'ts-essentials'

import { useLazyVerifiedLocation, PointClaim } from '@claimr/react-native-client'

const VerifiedLocationTokenAsText = ({ claim, jwt }: { claim: PointClaim; jwt: string }) => (
  <>
    <Text style={styles.header}>Verified Location Token Granted</Text>
    <Text>
      <Text style={styles.label}>Location</Text>
      <Text> within {claim.radius}m of </Text>
      <Text selectable>
        {claim.location.latitude}, {claim.location.longitude}
      </Text>
    </Text>
    <Text>
      <Text style={styles.label}>JWT</Text> <Text selectable>{jwt}</Text>
    </Text>
  </>
)

export default function App() {
  const { state, claim, jwt, message, submit } = useLazyVerifiedLocation()

  const SendButton = () => {
    if (state === 'submitting') {
      return (
        <Button title={'Verifying Location Based on GNSS Data'} disabled={true} onPress={console.error} />
      )
    } else if (state === 'listening') {
      return <Button title={'Collecting GNSS Data'} disabled={true} onPress={console.error} />
    } else if (state === 'registeringListener') {
      return <Button title={'Registering GNSS Listener'} disabled={true} onPress={console.error} />
    } else if (state === 'ready' || state === 'success' || state === 'failed' || state === 'revoked') {
      return <Button title={'Get Location Verified'} onPress={submit ?? console.error} />
    } else {
      // We should have covered all states previously
      throw new UnreachableCaseError(state)
    }
  }

  return (
    <View style={styles.container}>
      <SendButton />
      {claim && jwt && state === 'success' && <VerifiedLocationTokenAsText claim={claim} jwt={jwt} />}
      {state === 'failed' && <Text style={styles.header}>Location Verification Failed</Text>}
      {message && (
        <Text>
          <Text style={styles.label}>Message</Text> {message}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  button: {
    minHeight: 30,
  },
  header: {
    fontSize: 20,
    marginTop: 30,
  },
  label: {
    fontWeight: 'bold',
  },
})
