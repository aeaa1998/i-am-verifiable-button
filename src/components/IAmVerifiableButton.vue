<template>
  <button @click="verifyButton" class="i-am-verifiable-button"><slot v-bind:isVerifying="isVerifyingComputed" /></button>
</template>
<script setup>
import { ref } from "@vue/reactivity";
import { computed } from "@vue/runtime-core";
import { useIamVerification } from "../useIAmVerifiable";
const props = defineProps({
  requisites: {
    type: Array,
    required: true,
  },
  isVerifying: {
    type: Boolean,
    default: false,
  },
  log: {
    type: Boolean,
    default: false,
  },
});
const { log } = props;
const emit = defineEmits(["verification:started", "verification:ended", "verification:succeded", "verification:failed", "update:isVerifying"]);

const isVerifyingComputed = computed({
  get: () => props.isVerifying,
  set: (value) => emit("update:isVerifying", value),
});

//Action of verification
const verifyButton = async () => {
  const startTime = new Date();
  emit("verification:started");
  isVerifyingComputed.value = true;
  const value = await useIamVerification(props.requisites ?? []);
  isVerifyingComputed.value = false;
  if (value) {
    emit("verification:succeded");
  } else {
    emit("verification:failed");
  }
  emit("verification:ended");
  const endTime = new Date();
  const timeDifference = (endTime - startTime) / 1000;
  if (log) {
    console.log("Verification duration was ", Math.round(timeDifference));
  }
  return value;
};
</script>
