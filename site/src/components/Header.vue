<template>
   <v-app-bar app dense elevate-on-scroll>
      <div class="limit-wide">
         <div class="d-flex justify-space-between">
            <div class="d-flex align-center">
               <img
                  src="../../public/lucky-clover.svg"
                  height="40"
                  style="position:relative;top:4px"
               />
               Asia4Chan
            </div>
            <v-text-field
               label="搜索"
               @keydown="searchKeyDown"
               hide-details
               dense
               single-line
               append-icon="mdi-magnify-expand---"
               style="max-width:360px;position:relative;top:8px"
               color="#02b340"
            ></v-text-field>
            <div class="d-flex align-center">
               <v-btn color="#02b340" depressed plain small @click="showNewContent">发布新内容</v-btn>
            </div>
         </div>
      </div>
      <v-progress-linear
         :active="loading"
         :indeterminate="loading"
         absolute
         height="2"
         bottom
         color="#02b340"
      ></v-progress-linear>
   </v-app-bar>
</template>

<script>
import Bus from "../Bus";

export default {
   name: "Header",
   props: {
      showNewContent: {
         type: Function,
      },
   },
   data: () => ({
      keywords: "",
      loading: false,
   }),
   created() {
      Bus.$on("CONTENT_LOADING", (loading) => {
         this.loading = loading;
      });
   },
   methods: {
      searchKeyDown(e) {
         if (e.key == "Enter") {
            let v = e.target._value;
            this.keywords = v;
            Bus.$emit("KEY_WORDS", v);
         }
      },
   },
};
</script>

