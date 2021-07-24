<h2 align="center">@unveiler.io/react-native-client</h2>

<p align="center">
  <a href="https://img.shields.io/npm/dt/@unveiler.io/react-native-client?style=flat-square"><img src="https://img.shields.io/npm/dt/@unveiler.io/react-native-client?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@unveiler.io/react-native-client"><img src="https://img.shields.io/npm/v/@unveiler.io/react-native-client?style=flat-square" /></a>
  <a href="https://bundlephobia.com/result?p=@unveiler.io/react-native-client"><img src="https://img.shields.io/bundlephobia/min/@unveiler.io/react-native-client?style=flat-square" /></a>
  <a href="https://lgtm.com/projects/g/ClaimR/react-native-client/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/ClaimR/react-native-client.svg?logo=lgtm&logoWidth=18&style=flat-square"/></a>
</p>

<p align="center">A simple, developer friendly library to verify your user's location using the Unveiler verified location API.</p>

## Installation

Using NPM:

```sh
npm install @unveiler.io/react-native-client
```

Or Yarn:

```bash
yarn add @unveiler.io/react-native-client
```

## Usage

```jsx
import { UnveilerClient, useLazyVerifiedLocation } from '@unveiler.io/react-native-client'
import { Text, Button } from 'react-native'

const client = new UnveilerClient({ apiKey: 'YOUR_API_KEY' })

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

API documentation can be found [here](https://docs.unveiler.io/docs/react-native/api).

## Example

See an example on how to use this module in [`examples`](//github.com/unveiler-io/react-native-client/tree/master/example).

To run it, first create a `.env` file in the `example` folder where you add your ClaimR API Key. You can get a key at https://dashboard.unveiler.io.

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
