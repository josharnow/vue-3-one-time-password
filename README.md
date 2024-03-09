<h1  align="center">
<br>
<img width="100px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/1024px-Vue.js_Logo_2.svg.png" alt="vue-logo">
<br>
One Time Password Component
<br>
</h1>
<h4  align="center">
Customizable OTP (One Time Password) component for web apps, compatible with Vue 3.
Autofill one time code from email / sms.
</h4>
<p>The OTP component allows you to utilize two display modes (divided and group)
with an adjustable number of inputs. You can either write your own styling or
utilize predefined styles for all tags, including active/error classes.
Additionally, you can choose of three types of inputs (number, text, password)
and insert your own error messages.</p>
<br/>

<p  align="center">
    <a  href="#installation">Installation</a> •
    <a  href="#usage">Usage</a> •
    <a  href="#events">Events</a> •
    <a  href="#mainProps">Main Props</a> •
    <a  href="#styling">Styling</a> •
    <a  href="#stylingProps">Styling Props</a> •
    <a  href="#examples">Examples</a> •
    <a  href="#license">License</a>
</p>
<br/>

![Example Image](./assets/otp-preview.gif)

<br/>

## Installation

```sh
npm i @altgram/vue3-one-time-password
```

or

```sh
yarn add @altgram/vue3-one-time-password
```

## Usage

1. Import component into your app

``` html
<script setup>
    import {OneTimePassword} from '@altgram/vue3-one-time-password'

    // You can utilize styles provided by the package
    // or customize them using own styling to suit your needs.
    // - Look at the "Styling" section bellow
    import "@altgram/vue3-one-time-password/style.css"
</script>
```

2. Insert otp component into your template

``` html
<template>
    <OneTimePassword/>
</template>
```

## Events

<table>
<tbody>
  <tr>
    <td>Event Name</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>@completed</td>
    <td>Return string that represent OTP value typed in inputs when all digits are completed </td>
  </tr>
  <tr>
    <td>@changed</td>
    <td>Return string that represent OTP value when input changed </td>
  </tr>
  <tr>
    <td>@paste</td>
    <td>Triggered when paste value into OTP inputs</td>
  </tr>
  <tr>
    <td>reset()</td>
    <td>You can call reset function that resets input value (see bellow)</td>
  </tr>
</tbody>
</table>

#### Events usage:

``` html
<template>
    <OneTimePassword
        @completed="onCompleteHandler"
        @changed="onChangedHandler"
        @paste="onPasteHandler"
        ref="otpComponent"
    />
    <button @click="resetOtp">Reset</button>
</template>

<script setup>
import {ref} from "vue";
import {OneTimePassword} from '@altgram/vue3-one-time-password'

const otpComponent = ref(null);

const onCompleted = (token) => {
    console.debug("Completed", token);
    // write logic with completed code
};

const onChanged = (token) => {
    console.debug("Token changed",  token);
    // write logic with changed code
};

const onPaste = (token) => {
    console.debug("Token pasted", token);
    // write logic with pasted code
};

const resetOtp = () => {
    // reset input value if needed
    otpComponent.value.reset()
}
</script>
```

<br/>

## Main Props

<table>
<tbody>
  <tr>
    <td>Name</td>
    <td>Type</td>
    <td>Default</td>
    <td>Options</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>inputCount</td>
    <td>Number</td>
    <td>6</td>
    <td><b>number</b></td>
    <td>Number of OTP inputs to be rendered.</td>
  </tr>
  <tr>
    <td>otpMode</td>
    <td>String</td>
    <td>"divided"</td>
    <td><b>"divided", "group"</b></td>
    <td>Change display of input, options: separate , group</td>
  </tr>
  <tr>
    <td>inputType</td>
    <td>String</td>
    <td>"number"</td>
    <td><b>"number", "text", "password"</b></td>
    <td>Type of input data</td>
  </tr>
  <tr>
    <td>placeholder</td>
    <td>String</td>
    <td> "-" </td>
    <td><b>string</b></td>
    <td>Placeholder of inputs where data places</td>
  </tr>
  <tr>
    <td>borderRadius</td>
    <td>String</td>
    <td>"5px"</td>
    <td><b>string</b></td>
    <td>Border radius of inputs (in both modes)</td>
  </tr>
  <tr>
    <td>inputsGapWidth</td>
    <td>String</td>
    <td>"10px"</td>
    <td><b>string</b></td>
    <td>Gap between inputs (in both modes)</td>
  </tr>
  <tr>
    <td>isDisabled</td>
    <td>Boolean</td>
    <td>false</td>
    <td><b>true, false</b></td>
    <td> Whether the input are Disabled or not</td>
  </tr>
  <tr>
    <td>isValid</td>
    <td>Boolean</td>
    <td>true</td>
    <td><b>true, false</b></td>
    <td>Whether the entered value is valid or not</td></tr>
  <tr>
    <td>reverseDirection</td>
    <td>Boolean</td>
    <td>false</td>
    <td><b>true,false</b></td>
    <td>Whether the input is RTL or not</td>
  </tr>
  <tr>
    <td>isAutoFocus</td>
    <td>Bool</td>
    <td>true</td>
    <td><b>true, false</b></td>
    <td>The input should be focused-on when page rendered or not</td>
  </tr>
  <tr>
    <td>hideCursor</td>
    <td>Bool</td>
    <td>false</td>
    <td><b>true, false</b></td>
    <td>The input cursor should be hidden on focus</td>
  </tr>
</tbody>
</table>
<br/>

## Styling

You can use predefined styling (import bellow) or write custom css.
Additionally, you can insert your own classes into component as props.
#### Styling props:
<table>
    <tbody>
     <tr>
        <td>Name</td>
        <td>Type</td>
        <td>Default</td>
        <td>Options</td>
        <td>Description</td>
      </tr>
        <tr>
            <td>customWrapperClass</td>
            <td>String</td>
            <td>" "</td>
            <td><b>string</b></td>
            <td>Wrapper class</td>
        </tr>
        <tr>
            <td>customInputClass</td>
            <td>String</td>
            <td>" "</td>
            <td><b>string</b></td>
            <td>Input class</td>
        </tr>
        <tr>
            <td>customWrapperValidClass</td>
            <td>String</td>
            <td>"otp-wrapper-active"</td>
            <td><b>string</b></td>
            <td>Wrapper valid class</td>
        </tr>
        <tr>
            <td>customWrapperErrorClass</td>
            <td>String</td>
            <td>"otp-wrapper-error"</td>
            <td><b>string</b></td>
            <td>Wrapper error class</td>
        </tr>
        <tr>
            <td>customActiveInputClass</td>
            <td>String</td>
            <td>"otp-input-active"</td>
            <td><b>string</b></td>
            <td>Active input class (focused)</td>
        </tr>
    </tbody>
</table>

``` html
<script setup>
    import "@altgram/vue3-one-time-password/style.css"
</script>
```

#### Example styling of component

``` html
<template>
    <OneTimePassword
	    customWrapperClass="class-styling-wrapper"
	    customInputClass="class-styling-inputs"
	    customWrapperValidClass="class-styling-wrapper-valid"
	    customWrapperErrorClass="class-styling-wrapper-error"
	    customActiveInputClass="class-styling-inputs-active"
    />
</template>
<style>
.otp-app .class-styling-wrapper {
    ...
 }
.otp-app .class-styling-inputs {
    ...
}
.otp-app .class-styling-wrapper-valid {
    ...
}
.otp-app .class-styling-wrapper-error {
    ...
}
.otp-app .class-styling-inputs-active {
    ...
}
</style>
```
## Examples
#### Group Mode:

``` html
<template>
    <OneTimePassword otpMode="group"/>
</template>
```
Result:
<br/>
<img src="./assets/otp-group.png" alt="Example Image" width="400"/>

---

#### Error Message:

``` html
<template>
    <OneTimePassword :isValid="false"  customWrapperErrorClass="wrapper-error-class">
        <p>Error message<p>
    </OneTimePassword>
</template>

<style>
.otp-app .wrapper-error-class {
    color: red;
    line-height: 1rem;
    font-size: 12px;
    text-align: left;
}
</style>
```

Result:
<br/>
<img src="./assets/otp-error.png" alt="Example Image" width="400"/>

---
<h4>Divided password input, four digits, without placeholder</h4>
``` html
<template>
	 <OneTimePassword otpMode="divided" inputType="password" placeholder="" :inputCount="4" />
</template>
```

Result:
<br/>
<img src="./assets/otp-four-digits-password.png" alt="Example Image" width="400"/>
---

<h4>Focused (active) input:</h4>

``` html
<template>
	 <OneTimePassword customActiveInputClass="custom-input-active" />
</template>
<style>
.otp-app .custom-input-active {
	text-align: center;
	border: 1px solid green;
}
</style>
```

Result :
<br/>
<img src="./assets/otp-input-valid.png" alt="Example Image" width="400"/>

<br/>

## License

MIT
