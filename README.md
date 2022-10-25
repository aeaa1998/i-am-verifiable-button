# I Am Verifiable

SDK to allow users to validate NFT credentials on solana network.


## Installation

```
npm i i-am-verifiable-button
yarn add i-am-verifiable-button

```

### Vue3 

#### Component usage

##### App.vue
You must init the package on the App.vue or similar for correct use.
``` vue
<template>
.....
</template>
<script setup>
import { initWallet } from "solana-wallets-vue";
import { initIamVerifiable } from "i-am-verifiable-button/src/useIAmVerifiable";
const walletOptions = {
  wallets: [new PhantomWalletAdapter()],
  autoConnect: true,
};

initWallet(walletOptions);
initIamVerifiable();
</script>
```



##### Verify.vue
``` vue
<template>
<div>Verifica</div>
<i-am-verifiable-button
:requisites=requisites
v-model:isVerifying="isVerifying"
>Verificar</i-am-verifiable-button>
<div>{{ isVerifying ? 'verificando' : 'terminado'}}</div>
</template>
<script setup>
import IAmVerifiableButton from "i-am-verifiable-button"
const isVerifying = ref(false)
const requisites = ["list of addresses"] 
</script>
```

#### Component props

| Prop name  | Type | Description | Default |
| ------------- |:-------------:| ------------- |:-------------:|
| requisites      | Array     | List of requisites to verify.  | [] |
| isVerifying      | Bool     | Sync prop to check if it is verifying.  | false |
| log      | Bool     | Print bool options.  | false |

### Js usage

```js
import { useIamVerification } from "i-am-verifiable-button/useIAmVerifiable.js";

const value = await useIamVerification(requisites);

return value ? 'Success' : 'failed'
```