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
});

const emit = defineEmits(["verification:started", "verification:ended", "verification:succeded", "verification:failed", "update:isVerifying"]);

const isVerifyingComputed = computed({
  get: () => props.isVerifying,
  set: (value) => emit("update:isVerifying", value),
});

//Action of verification
const verifyButton = async () => {
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
  return value;
};
</script>
