<template>
  <div class="otp-app">
    <div
        class="otp-wrapper"
        :class="isInputFocused ? activeWrapperClassHandler() : wrapperClassHandler()"
        :style="wrapperStyle()"
    >
      <input
          v-for="(digitInputNumber, index) in digitsCount"
          ref="digitInput"
          :key="index + digitInputNumber"
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
import {computed, defineProps, onMounted, defineEmits, ref, StyleValue} from "vue";

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

const wrapperStyle = (): StyleValue => {
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

const inputClassHandler = (): any => {
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


onMounted(() => {
  if (autoFocus && !isDisabled) {
    onFocus(0);
    // @ts-ignore
    digitInput.value[0].focus();
    if (allowedInputTypes.indexOf(inputType) !== -1) {
      // @ts-ignore
      digitInput.value.forEach((input: any) => {
        input.type = inputType;

        if (inputType === 'number') {
          input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
          });
        }
      });
    }
  }
})

// @ts-ignore
const reset = (): void => {
  inputValue.value = [];
  joinedValue.value = '';
}

const BACKSPACE_KEY_NUMBER = 8;
const keydownHandler = (index: number, e: any): void => {
  if (e.keyCode === BACKSPACE_KEY_NUMBER && e.target.value === '') {
    // @ts-ignore
    digitInput.value[Math.max(0, index - 1)].focus();
  }
}

const onInput = (index: number): void => {
  const [first, ...rest] = inputType === INPUT_NUMBER
      // @ts-ignore
      ? inputValue.value[index].replace(/[^0-9]/g, '')
      : inputValue.value[index];
  // @ts-ignore
  inputValue.value[index] = first === null || first === undefined ? '' : first;
  const lastInputBox = index === digitsCount - 1;
  const insertedContent = first !== undefined;
  if (insertedContent && !lastInputBox) {
    // @ts-ignore
    digitInput.value[index + 1].focus();
    // @ts-ignore
    digitInput.value[index + 1].value = rest.join('');
    // @ts-ignore
    digitInput.value[index + 1].dispatchEvent(new Event('input'));
  }
  joinedValue.value = inputValue.value.map((value) => value).join('');
  emit('value', joinedValue.value);
  if (joinedValue.value.length === digitsCount) {
    onComplete(joinedValue.value);
  }
  onChanged();
}

const onFocus = (index: number): void => {
  activeInput.value = index;
  isInputFocused.value = true;
}

const onBlur = (): void => {
  activeInput.value = -1;
  isInputFocused.value = false;
}

const onComplete = (value: any): void => {
  onBlur();
  const number = digitsCount - 1;
  if (digitInput.value && digitInput.value[number]) {
    //@ts-ignore
    digitInput.value[number].blur();
  }
  if (inputType === INPUT_PASSWORD) {
    emit('completed', value);
  } else {
    emit('completed', value)
  }
}

const onChanged = (): void => {
  emit('changed', inputValue.value.map((value) => value).join(''));
}

const onPaste = (event: any): void => {
  emit('paste', event);
}
</script>

<style>
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

input[type=number] {
  -moz-appearance: textfield;
}

</style>
