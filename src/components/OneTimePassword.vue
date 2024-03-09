<template>
  <div class="otp-app">
    <div
        class="otp-wrapper"
        :class="[isInputFocused ? otpWrapperActive : classInput, customWrapperClass]"
        :style="{direction: inputDirection, gap: inputsGapWidth, borderRadius}"
    >
      <input
          :type="inputType === INPUT_PASSWORD ? 'password' : 'text'"
          v-for="(digitInputNumber, index) in inputCount"
          :key="index + digitInputNumber"
          ref="digitInputCollection"
          v-model="inputModel[index]"
          autocomplete="one-time-code"
          class="otp-element-input"
          :class="[
              inputElementClass,
              activeInput === index ? activeInputClass : '',
              customInputClass,
              hideCursor ? 'hide-cursor' : ''
              ]"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :style="{'borderRadius': otpMode === DIVIDED_MODE ? borderRadius : '0px'}"
          @focus="onFocusTrigger(index)"
          @blur="onBlurTrigger"
          @paste="onPasteTrigger"
          @input="onInputTrigger(index)"
          @keydown="onKeydownTrigger(index, $event)"
      >
    </div>
    <span v-if="!isValid">
      <slot/>
    </span>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, onMounted, defineEmits, ref, defineExpose} from "vue";

const emit = defineEmits(['completed', 'changed', 'paste'])

const INPUT_PASSWORD = 'password';
const INPUT_TEXT = 'text';
const INPUT_NUMBER = 'number';
const allowedInputTypes = [INPUT_PASSWORD, INPUT_TEXT, INPUT_NUMBER];

const GROUP_MODE = 'group';
const DIVIDED_MODE = 'divided';
const allowedModes = [GROUP_MODE, DIVIDED_MODE];

const DIRECTION_LTR = 'ltr';
const DIRECTION_RTL = 'rtl';

const {
  borderRadius,
  inputCount,
  otpMode,
  inputType,
  placeholder,
  inputsGapWidth,
  isDisabled,
  isValid,
  isAutoFocus,
  reverseDirection,
  customWrapperClass,
  customInputClass,
  customActiveInputClass,
  customWrapperValidClass,
  customWrapperErrorClass,
  hideCursor
} = defineProps({
  inputCount: {
    type: Number,
    default: 6,
  },
  otpMode: {
    type: String,
    default: DIVIDED_MODE,
  },
  inputType: {
    type: String,
    default: INPUT_NUMBER,
  },
  placeholder: {
    type: String,
    default: '-',
  },
  borderRadius: {
    type: String,
    default: '5px',
  },
  inputsGapWidth: {
    type: String,
    default: '10px',
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  isAutoFocus: {
    type: Boolean,
    default: true,
  },
  reverseDirection: {
    type: Boolean,
    default: false,
  },
  customWrapperClass: {
    type: String,
    default: '',
  },
  customInputClass: {
    type: String,
    default: '',
  },
  customActiveInputClass: {
    type: String,
    default: 'otp-input-active',
  },
  customWrapperValidClass: {
    type: String,
    default: 'otp-wrapper-active',
  },
  customWrapperErrorClass: {
    type: String,
    default: 'otp-wrapper-error',
  },
  hideCursor: {
    type: Boolean,
    default: false
  }
});

const inputModel = ref<Array<string>>([]);
const joinedValue = ref('');
const isInputFocused = ref(false);
const activeInput = ref(-1);
const digitInputCollection = ref<Array<HTMLInputElement>>([]);
const BACKSPACE_KEY = 'Backspace';
const inputDirection = reverseDirection ? DIRECTION_RTL : DIRECTION_LTR;

const classInput = otpMode === GROUP_MODE ? 'otp-input-group' : 'otp-element-input-divided';
const otpWrapperValidClass = isValid ? customWrapperValidClass : customWrapperErrorClass;
const otpWrapperActive = otpMode === GROUP_MODE ? otpWrapperValidClass : '';
const dividedModeValid = isValid ? 'otp-wrapper-divided-valid' : 'otp-wrapper-divided-err';
const inputElementClass = otpMode === DIVIDED_MODE ? dividedModeValid : 'otp-input-group-valid'
const activeInputClass = otpMode === DIVIDED_MODE ? customActiveInputClass : '';


/**
 * Handle initialization, set focus on first input, set input types and handle whitelisted characters on user input
 * @return {void}
 */
const init = (): void => {
  onFocusTrigger(0);
  if (digitInputCollection.value[0]) {
    const currentDigitInput: HTMLInputElement = digitInputCollection.value[0];
    currentDigitInput.focus();
    if (allowedInputTypes.indexOf(inputType) !== -1) {
      digitInputCollection.value.forEach((input: any) => {
        input.type = inputType;

        //in case of number mode - replace all characters except digits
        if (inputType === 'number') {
          input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
          });
        }
      });
    }
  } else {
    console.warn('ref digit input is empty')
  }
}

/**
 * Init check otp mode
 * @return {void}
 */
const checkOtpMode = (): void => {
  if (!allowedModes.includes(otpMode)) {
    console.warn(`Prop otpMode: "${otpMode}" is not found. Please choose from existing modes: ${allowedModes.join(',')}`)
  }
}

/**
 * Reset model value
 */
const reset = (): void => {
  inputModel.value = [];
  joinedValue.value = '';
  init()
}

/**
 * Expose method "reset" for parent component call
 */
defineExpose({
  reset
});

/**
 * Handle backspace in case of divided inputs
 * @param index {number}
 * @param event {KeyboardEvent}
 * @return {void}
 */
const onKeydownTrigger = (index: number, event: KeyboardEvent): void => {
  const target = event.target as HTMLInputElement;
  if (event.key === BACKSPACE_KEY && target.value === '') {
    digitInputCollection.value[Math.max(0, index - 1)].focus();
  }
}

/**
 * Handle keydown (input) changes
 * Fill current active input, focus next and dispatch event and emit change/completed of changed input value
 * @param index {number}
 * @return {void}
 */
const onInputTrigger = (index: number): void => {
  const inputModelValue: string[] = inputModel.value;
  const [first, ...rest] = inputType === INPUT_NUMBER
      ? inputModelValue[index].replace(/[^0-9]/g, '')
      : inputModelValue[index];
  inputModelValue[index] = !first ? '' : first;
  const lastInputBox = index === inputCount - 1;

  if (first && !lastInputBox && digitInputCollection.value) {
    const digitInputValue = digitInputCollection.value;
    digitInputValue[index + 1].focus();
    digitInputValue[index + 1].value = rest.join('');
  }
  joinedValue.value = inputModel.value.map((value) => value).join('');

  if (joinedValue.value.length === inputCount) {
    onComplete(joinedValue.value);
  }
  onChangedEmit();
}

/**
 * Activate input on focus
 * @param index
 * @return {void}
 */
const onFocusTrigger = (index: number): void => {
  activeInput.value = index;
  isInputFocused.value = true;
}

/**
 * Decrease active input to previous and disable focused input
 * @return {void}
 */
const onBlurTrigger = (): void => {
  activeInput.value = -1;
  isInputFocused.value = false;
}

/**
 * If all inputs are filled, blur fields and emit completed event
 * @param value
 * @return {void}
 */
const onComplete = (value: any): void => {
  onBlurTrigger();
  const number = inputCount - 1;
  if (digitInputCollection.value && digitInputCollection.value[number]) {
    digitInputCollection.value[number].blur();
  }
  emit('completed', value)
}

/**
 * Emit onchange event triggered by input value
 * @return {void}
 */
const onChangedEmit = (): void => {
  emit('changed', inputModel.value.map((value) => value).join(''));
}

/**
 * Emits clipboard event on paste
 * @param event ClipboardEvent
 * @return {void}
 */
const onPasteTrigger = (event: ClipboardEvent): void => {
  inputModel.value = event.clipboardData ? event.clipboardData.getData('text').split('').slice(0, inputCount) : [];
  digitInputCollection.value[inputModel.value.length - 1].focus();
  emit('paste', event);
}

/**
 * Mounted hook for app initialization
 */
onMounted(() => {
  if (isAutoFocus && !isDisabled) {
    checkOtpMode()
    init()
  }
})
</script>

<style>
.otp-app {
  width: 100%;
}

.otp-app .otp-wrapper {
  direction: ltr;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
  overflow: hidden;
}

.otp-app .otp-wrapper-error {
  border: 1px solid #af0000;
}

.otp-app .otp-element-input {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
  border-radius: 5px;
}

.otp-app .otp-element-input:disabled {
  background-color: #ececec !important;
}

.otp-app .otp-wrapper-divided-valid {
  text-align: center;
  font-weight: 300;
  background-color: transparent;
  border: solid 1px #dedede;
  width: 40px;
  height: 40px;
}

.otp-app .otp-wrapper-divided-err {
  text-align: center;
  font-weight: 300;
  background-color: transparent;
  border: solid 1px #D6D6D6;
  width: 40px;
  height: 40px;
}

.otp-app .otp-input-group {
  border: solid 1px #dedede;
}

.otp-app .otp-input-group-valid {
  background-color: transparent;
  font-weight: 300;
  border: none;
  width: 3rem;
  height: 40px;
  text-align: center;
}


@media only screen and (max-width: 600px) {
  .otp-app .otp-input-group {
    width: 2.5rem;
    height: 40px;
  }
}

.otp-app .otp-input-active {
  border: solid 1px #525252;
}

.otp-app .otp-wrapper-active {
  border: solid 1px #525252;
}

input:focus {
  outline: none;
}

input.hide-cursor:focus {
  caret-color: transparent;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
