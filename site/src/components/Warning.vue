<template>
   <v-overlay :value="overlay" z-index="99" opacity="0.88">
      <v-alert dense border="left" type="warning" icon="mdi-alert-octagon" max-width="490">
         <strong>免责声明！</strong>
         <br />访问此网站请必须理解并同意以下内容：
         <br />1.本网站以原样呈现给您，不作任何明示或暗示的保证。点击“我同意”，即表示您同意不追究此网站对您使用本网站造成的任何损害的责任，同时您也明白所发布的内容并非由此网站所有或生成，而是由此网站的用户所有。
         <br />2.本网站可能会含有任何内容，仅适合成年人访问，如果您是未成年人，请不要继续；
         <br />3.本网站不记录发言者的任何个人信息，但是请遵守当地的法律规定，文明发言；
         <br />
         <span style="float:right">
            <v-btn class="ma-2" outlined color="indigo" @click="agree">我同意</v-btn>
            <v-btn class="ma-2" outlined color="indigo" @click="refuse">拒绝</v-btn>
         </span>
      </v-alert>
   </v-overlay>
</template>

<script>
export default {
   name: "Warning",
   components: {},
   props: {
      getContent: {
         type: Function,
      },
   },
   data: () => ({
      overlay: true,
   }),
   mounted() {
      if (localStorage.getItem("asia4chan_agree")) {
         this.getContent()
         this.overlay = false;
      }
   },
   methods: {
      agree() {
         this.getContent()
         this.overlay = false;
         localStorage.setItem("asia4chan_agree", "YES I DO");
      },
      refuse() {
         window.location.href = "https://www.marxists.org/chinese/marx/01.htm"; // 共产党宣言
      },
   },
};
</script>

<style scoped>
</style>
