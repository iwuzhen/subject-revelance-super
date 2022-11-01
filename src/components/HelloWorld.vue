<template lang="pug">
div {{text}}
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps({
  text: {
    type: String,
    default: "true",
  },
});
console.log("ccwzz");
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
