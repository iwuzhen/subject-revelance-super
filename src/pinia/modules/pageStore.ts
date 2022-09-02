import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const powerlawDemoStore = defineStore("powerlawDemo", {
  state() {
    return {
      subjectSelect: reactive(["Biology"]),
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

export const nsfcStatstore = defineStore("nsfcStatsDemo", {
  state() {
    return {
      GDPvCPI: ref(false),
      FundMvCPI: ref(false),
      GDPZoom: ref(800),
      ShowGDP: ref(true),
      ShowFund: ref(true),
      ShowNOI: ref(true),
      ShowRatio: ref(true),
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

export const wmStatstore = defineStore("wmStatsDemo", {
  state() {
    return {
      Subject: reactive([]),
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

export const dynamicStore = (name: string, defaultDict: any) => {
  return defineStore(name, {
    state() {
      return {
        states: reactive(defaultDict),
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
  })();
};
