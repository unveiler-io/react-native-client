import React from 'react'

import { StyleSheet, View, Text, Button } from 'react-native'
import Config from 'react-native-config'

import { UnreachableCaseError } from 'ts-essentials'

import { useLazyVerifiedLocation, ClaimrClient, PointClaim } from '@claimr/react-native-client'

// Create our ClaimR Client
const apiKey = Config.CLAIMR_API_KEY
const client = new ClaimrClient({ apiKey })

// Render tokens received from the ClaimR API
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

// Create our app
const App = () => {
  // Register the lazy location verification hook.
  const { state, claim, jwt, message, submit, progress } = useLazyVerifiedLocation({ client })

  // Define how our send button looks depending on the verified location state
  const SendButton = () => {
    if (state === 'submitting') {
      return (
        <Button title={'Verifying Location Based on GNSS Data'} disabled={true} onPress={console.error} />
      )
    } else if (state === 'listening') {
      const title = progress
        ? `Collecting GNSS Data (${progress.current}/${progress.target})`
        : 'Collecting GNSS Data'
      return <Button title={title} disabled={true} onPress={console.error} />
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
      <Text>API Key: {apiKey.length > 20 ? apiKey.substr(0, 20) + '...' : apiKey}</Text>
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

export default App
