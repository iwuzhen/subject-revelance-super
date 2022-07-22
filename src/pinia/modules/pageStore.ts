import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const powerlawDemoStore = defineStore("powerlawDemo", {
  state() {
    return {
      subjectSelect: reactive(["Biology", "Chemistry", "Physics"]),
      zipfTypeSelect: "zipf",
      levelSelect: 2,
      nodeRange: ref([1, 1000]),
      autoPlay: ref(false),
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "page",
        storage: localStorage,
      },
    ],
  },
});

export const homeStore = defineStore("home", {
  state() {
    return {
      title: "",
    };
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "home",
        storage: localStorage,
      },
    ],
  },
});
