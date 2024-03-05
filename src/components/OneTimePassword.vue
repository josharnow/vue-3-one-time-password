<template>
  <div class="otp-app">
    <div
        class="otp-wrapper"
        :class="isInputFocused ? activeWrapperClassHandler() : wrapperClassHandler()"
        :style="wrapperStyle()"
    >
      <input
          v-for="(digitInput, index) in digitsCount"
          ref="digitInput"
          :key="index + digitInput"
          v-model="inputValue[index]"
          autocomplete="one-time-code"
          class="otp-input"
          :class="[inputClassHandler(), activeInput === index ? activeInputClassHandler() : '']"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :style="inputStyle()"
          @focus="onFocus(index)"
          @blur="onBlur"
          @paste="onPaste"
          @input="onInput(index)"
          @keydown="keydownHandler(index, $event)"
      >
    </div>
    <span
        v-if="!isValid"
        :class="errorClassHandler"
    >
      <slot name="errorMessage"/>
    </span>
  </div>
</template>

<script lang="ts" setup>
import {computed, defineProps, onMounted, defineEmits, ref} from "vue";

const emit = defineEmits(['value', 'completed', 'changed', 'paste'])
const INPUT_PASSWORD = 'password';
const INPUT_TEXT = 'text';
const INPUT_NUMBER = 'number';
const allowedInputTypes = [INPUT_PASSWORD, INPUT_TEXT, INPUT_NUMBER];

const {
  borderRadius,
  digitsCount,
  mode,
  inputType,
  placeholder,
  layoutGap,
  isDisabled,
  isValid,
  autoFocus,
  errorClass,
  separateInputClass,
  separateWrapperClass,
  groupInputClass,
  groupWrapperClass,
  activeInputClass,
  activeWrapperClass
} = defineProps({
  digitsCount: {
    type: Number,
    default: 6,
  },
  mode: {
    type: String,
    default: 'separate',
  },
  inputType: {
    type: String,
    default: 'number',
  },
  placeholder: {
    type: String,
    default: '-',
  },
  borderRadius: {
    type: Number,
    default: 5,
  },
  layoutGap: {
    type: Number,
    default: 10,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  autoFocus: {
    type: Boolean,
    default: true,
  },
  errorClass: {
    type: String,
    default: '',
  },
  separateInputClass: {
    type: String,
    default: '',
  },
  separateWrapperClass: {
    type: String,
    default: '',
  },
  groupInputClass: {
    type: String,
    default: '',
  },
  groupWrapperClass: {
    type: String,
    default: '',
  },
  activeInputClass: {
    type: String,
    default: '',
  },
  activeWrapperClass: {
    type: String,
    default: '',
  },
  allowOnlyNumbers: {
    type: Boolean,
    default: true
  }
});

const inputValue = ref([]);
const joinedValue = ref('');
const isInputFocused = ref(false);
const activeInput = ref(-1);
const digitInput = ref(null);

const wrapperStyle = () => {
  return {
    direction: 'ltr',
    gap: `${layoutGap}px`,
    'border-radius': `${borderRadius}px`,
  };
}

const inputStyle = (): {"--border-radius": string} => {
  return {
    '--border-radius': `${borderRadius}px`
  }
}

const inputClassHandler = (): string => {
  if (mode === 'separate') {
    if (isValid) {
      return separateInputClass ? separateInputClass : 'default-input-separate';
    } else {
      return separateInputClass ? separateInputClass : 'default-error-input-separate';
    }
  }
  if (mode === 'group') {
    return groupInputClass ? groupInputClass : 'default-input-group';
  }
}

const activeInputClassHandler = (): string => {
  if (mode === 'separate') {
    return activeInputClass ? activeInputClass : 'default-active-input';
  }
  return '';
}

const activeWrapperClassHandler = (): string => {
  if (mode === 'group') {
    if (isValid) {
      return activeWrapperClass ? activeWrapperClass : 'default-active-wrapper';
    } else {
      return activeWrapperClass ? activeWrapperClass : 'default-error-wrapper-group';
    }
  }
  return '';
}

const wrapperClassHandler = (): string => {
  if (mode === 'separate') {
    return separateWrapperClass ? separateWrapperClass : 'default-wrapper-separate';
  }
  if (mode === 'group') {
    if (isValid) {
      return groupWrapperClass ? groupWrapperClass : 'default-wrapper-group';
    } else {
      return groupWrapperClass ? groupWrapperClass : 'default-error-wrapper-group';
    }
  }
  return '';
}

const errorClassHandler = computed((): string => {
  return errorClass ? errorClass : 'default-error-class';
})

const init = (): void => {
  onFocus(0);
  digitInput.value[0].focus();
  if (allowedInputTypes.indexOf(inputType) !== -1) {
    digitInput.value.forEach((input) => {
      input.type = inputType;

      if (inputType === 'number') {
        input.addEventListener('input', () => {
          input.value = input.value.replace(/\D/g, '');
        });
      }
    });
  }
}

onMounted(() => {
  if (autoFocus && !isDisabled) {
    init()
  }
})

const reset = (): void => {
  inputValue.value = [];
  joinedValue.value = '';
}

const BACKSPACE_KEY_NUMBER = 8;
const keydownHandler = (index, e): void => {
  if (e.keyCode === BACKSPACE_KEY_NUMBER && e.target.value === '') {
    digitInput.value[Math.max(0, index - 1)].focus();
  }
}

const onInput = (index): void => {
  const [first, ...rest] = inputType === INPUT_NUMBER
      ? inputValue.value[index].replace(/[^0-9]/g, '')
      : inputValue.value[index];
  inputValue.value[index] = first === null || first === undefined ? '' : first;
  const lastInputBox = index === digitsCount - 1;
  const insertedContent = first !== undefined;
  if (insertedContent && !lastInputBox) {
    digitInput.value[index + 1].focus();
    digitInput.value[index + 1].value = rest.join('');
    digitInput.value[index + 1].dispatchEvent(new Event('input'));
  }
  joinedValue.value = inputValue.value.map((value) => value).join('');
  emit('value', joinedValue.value);
  if (joinedValue.value.length === digitsCount) {
    onComplete(joinedValue.value);
  }
  onChanged();
}

const onFocus = (index): void => {
  activeInput.value = index;
  isInputFocused.value = true;
}

const onBlur = (): void => {
  activeInput.value = -1;
  isInputFocused.value = false;
}

const onComplete = (value): void => {
  onBlur();
  digitInput.value[digitsCount - 1].blur();
  if (inputType === INPUT_PASSWORD) {
    emit('complete', value);
  } else {
    emit('complete', value)
  }
}

const onChanged = (): void => {
  emit('changed', inputValue.value.map((value) => value).join(''));
}

const onPaste = (event): void => {
  emit('paste', event);
}
</script>

<style scoped>
div.otp-app {
  width: max-content;
}

div.otp-app div.otp-wrapper {
  direction: ltr;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
}

div.otp-app div.otp-wrapper input.otp-input {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
  border-radius: 5px;
}

div.otp-app div.otp-wrapper input.otp-input:disabled {
  background-color: #ececec !important;
}

div.otp-app div.otp-wrapper input.default-input-separate,
div.otp-app div.otp-wrapper input.default-error-input-separate {
  text-align: center;
  font-weight: 300;
  background-color: transparent;
  border: solid 1px #D6D6D6;
  width: 40px;
  height: 40px;
}

div.otp-app div.default-wrapper-separate {
  background: transparent;
}

div.otp-app div.default-wrapper-group {
  border: solid 2px #ececec;
}

div.otp-app div.default-error-wrapper-group {
  border: solid 2px #d50000;
}

div.otp-app input.default-input-group {
  background-color: transparent;
  font-weight: 300;
  border: none;
  width: 3rem;
  height: 40px;
  text-align: center;
}


@media only screen and (max-width: 600px) {
  div.otp-app input.default-input-group {
    width: 2.5rem;
    height: 40px;
  }
}

div.otp-app input.default-active-input {
  border: solid 2px #525252;
}

div.otp-app div.default-active-wrapper {
  border: solid 2px #525252;
}

div.otp-app span.default-error-class {
  color: #d50000;
  font-weight: 300;
}

input:focus {
  outline: none;
}

/* Removing the arrow keys on side of the input area */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

</style>
