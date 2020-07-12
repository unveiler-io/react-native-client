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
import { ClaimrClient, useLazyVerifiedLocation } from '@claimr/react-native-client'

const client = new ClaimrClient({ apiKey: 'YOUR_API_KEY' })

const MyModule = () => {
  const { claim, jwt, submit } = useLazyVerifiedLocation({ client })

  return (
    <>
      {submit && <Button onPress={submit} title={'Submit'} />}
      {claim && (
        <Text>
          {claim.location.latitude}, {claim.location.longitude}
        </Text>
      )}
    </>
  )
}
```

## Example

See an example on how to use this module in [`examples`](//github.com/ClaimR/react-native-client/tree/master/example).

To run it, first create a `.env` file in the `example` folder where you add your ClaimR API Key. You can get a key at https://dashboard.claimr.tools.

```bash
# Copy the template
cp example/.env.template example/.env

# Open the .env file using your favorite editor
vim example/.env
```

Then you can start the example app by running:

```bash
yarn example android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
