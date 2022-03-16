<template>
  <q-dialog v-model="togglePopup" @input="$emit('input', $event)"></q-dialog>
</template>

<script>
export default {
  props: {
    // showPopup заменить на value
    // В PopupCard заменить :showPopup="showPopup" на v-model="showPopup"
    value: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const togglePopup = ref(props.value);

    return {
      togglePopup
    }
  }
}
</script>