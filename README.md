# @claimr/react-native-client

A React Native module to verify a users' location using the ClaimR API.

## Installation

Using NPM:

```sh
npm install @claimr/react-native-client
```

Or Yarn:

```bash
yarn add @claimr/react-native-client
```

## Usage

```js
import { useLazyVerifiedLocation } from '@claimr/react-native-client'

const MyModule = () => {
  const { claim, jwt, submit } = useLazyVerifiedLocation()
  
  return <>
    { submit && <Button onPress={submit} title={"Submit"} /> }
    { claim && <Text>{ claim.location.latitude }, { claim.location.longitude }</Text>}
  </>
}
```

## Example

See an example on how to use this module in [`examples`](//github.com/ClaimR/react-native-client/tree/master/example).  You can start the example app by running:

```bash
yarn example android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

