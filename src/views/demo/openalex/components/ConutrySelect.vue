<template lang="pug">

el-select(v-if="multiple", v-model="country",:placeholder="placeholder",multiple,style="width: 100%",size='large',@change='change')
  el-option(v-for="item in CountryCodes",:key="item",:label="item",:value="item")    
    span(style="float: left;line-height: inherit;"  :class="`fi fi-${item.toLowerCase()}`")
    span(style="margin-left:10px;")   {{ item }}

el-select(v-else v-model="country",:placeholder="placeholder",style="width: 100%",size='large',@change='change', :multiple="multiple")
  template(v-slot:prefix)
    span(:class="`fi fi-${country.toLowerCase()}`")
  el-option(v-for="item in CountryCodes",:key="item",:label="item",:value="item")
    span(style="float: left;line-height: inherit;"  :class="`fi fi-${item.toLowerCase()}`") 
    span(style="float: right;")  {{ item }}

</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  placeholder: String,
  modelValue: [String, Array],
  multiple: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue", "change"]);

const country = computed({
  get() {
    return props.modelValue;
  },
  set(value: any) {
    emit("update:modelValue", value);
  },
});

function change() {
  // emit("update:country", country);
  emit("change");
}
const CountryCodes = [
  "US",
  "CN",
  "GB",
  "DE",
  "JP",
  "FR",
  "IN",
  "CA",
  "BR",
  "IT",
  "AU",
  "ES",
  "KR",
  "RU",
  "NL",
  "ID",
  "PL",
  "IR",
  "SE",
  "CH",
  "TR",
  "TW",
  "BE",
  "MX",
  "IL",
  "DK",
  "AT",
  "FI",
  "ZA",
  "PT",
];
</script>
