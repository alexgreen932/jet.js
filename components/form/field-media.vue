<template>
  <div class="f-media">
    <div class="d-select" @click="show = !show">
      <span v-if="!modelValue">Select</span>
      <span v-else>Change</span>
    </div>
    <div class="d-del" @click="$emit('update:modelValue', '')">
      <i class="fa-solid fa-xmark"></i>
    </div>
  </div>

  <transition name="pop">
    <media-manager v-if="show"
                   :modelValue="internalValue"
                   @update:modelValue="updateValue"
                   src="media"
                   cls="main-frame"
                   layout="grid"
                   @close="show=false" />
  </transition>
</template>

<script>
import mediaManager from '../MediaManager.vue';
export default {
  name: 'field-input',
  components: { mediaManager },
  props: ['modelValue', 'f'],
  data() {
    return {
      show: false,
      internalValue: this.modelValue || ''
    };
  },
  watch: {
    modelValue(val) {
      this.internalValue = val;
    }
  },
  methods: {
    updateValue(val) {
      this.internalValue = val;
      this.$emit('update:modelValue', val);
    }
  }
};
</script>
