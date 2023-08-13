<template>
   <v-expand-transition>
      <v-overlay z-index="99" opacity="0.44" :dark="false">
         <div class="limit-wide">
            <v-snackbar v-model="snackbar" top timeout="3000">{{ snackbarText }}</v-snackbar>
            <v-sheet
               color="#fff"
               elevation="1"
               height="100vh"
               width="90%"
               style="padding:1% 16px;left:4%"
            >
               <div
                  :style="`height:calc(100vh - 24px); overflow:auto;padding-right:4px;position:relative`"
                  v-on:scroll="onScroll"
               >
                  <div style="position:relative">
                     <div
                        id="content-title"
                        v-if="showContent && showContent.title"
                     >{{showContent.title}}</div>
                     <div style="position:sticky;top:0;background-color:#fff;">
                        <v-subheader>
                           {{showContent.fromNow}}
                           <div style="font-size:1px;margin:4px 0;background-color:#fff">
                              <span>&nbsp;/ {{showContent.commentCount}} 回应 /&nbsp;</span>
                              <span
                                 style="color:#02b340;opacity:0.8"
                              >{{`${(newestMsg||showContent).like}`}} ↑ v</span>
                              <span
                                 style="color:#f52443;opacity:0.8"
                              >s ↓ {{`${(newestMsg||showContent).disgust}`}}</span>
                           </div>
                        </v-subheader>
                        <!-- 分割线 -->
                        <v-divider></v-divider>
                     </div>
                     <div id="content-render" class="content-render"></div>
                     <v-divider></v-divider>
                  </div>
                  <div class="comment-list">
                     <CommentList :showContent="showContent" />
                  </div>
               </div>

               <!-- 按钮 -->
               <div style="position:absolute;right:4.5%;top:6%;z-index:999">
                  <v-tooltip left>
                     <template v-slot:activator="{ on, attrs }">
                        <v-btn
                           icon
                           color="green"
                           style="margin-bottom:6px"
                           elevation="2"
                           v-bind="attrs"
                           v-on="on"
                           large
                           @click="()=>manner(showContent.id, 'like')"
                        >
                           <v-icon>mdi-thumb-up</v-icon>
                        </v-btn>
                     </template>
                     <span>赞同 {{(newestMsg||showContent).like}}</span>
                  </v-tooltip>
                  <br />
                  <v-tooltip left>
                     <template v-slot:activator="{ on, attrs }">
                        <v-btn
                           icon
                           large
                           color="red"
                           style="margin-bottom:24px"
                           elevation="2"
                           v-bind="attrs"
                           v-on="on"
                           @click="()=>manner(showContent.id, 'disgust')"
                        >
                           <v-icon>mdi-thumb-down</v-icon>
                        </v-btn>
                     </template>
                     <span>反对 {{(newestMsg||showContent).disgust}}</span>
                  </v-tooltip>
                  <br />
                  <v-tooltip left>
                     <template v-slot:activator="{ on, attrs }">
                        <v-btn
                           icon
                           large
                           color="red"
                           style
                           elevation="2"
                           v-bind="attrs"
                           v-on="on"
                           @click="()=>{onClose()}"
                        >
                           <v-icon>mdi-close-octagon</v-icon>
                        </v-btn>
                     </template>
                     <span>关闭</span>
                  </v-tooltip>
               </div>
            </v-sheet>
         </div>
      </v-overlay>
   </v-expand-transition>
</template>

<script>
import mediumZoom from "medium-zoom";
import superAgent from "superagent";
import CommentList from "./CommentList.vue";
import { getCookie } from "../utils";

export default {
   name: "Content",
   components: {
      CommentList,
   },
   props: {
      onClose: {
         type: Function,
      },
      showContent: {
         type: Object,
      },
   },
   data: () => ({
      snackbar: false,
      snackbarText: "",
      newestMsg: null,
      scrollDown: false,
   }),
   mounted() {
      document.getElementById("content-render").innerHTML =
         this.showContent.content;
      setTimeout(() => {
         mediumZoom(document.querySelectorAll("#content-render img"));
      }, 3);
   },
   beforeDestroy() {},
   watch: {},
   methods: {
      dealError(error) {
         const { body } = error.response;
         if (body && body.message) {
            this.snackbar = true;
            this.snackbarText = body.message;
         }
      },
      dealSuccess(success) {
         const { body } = success;
         if (body) {
            // 通过接口返回值更新当前的数据 因使用 socket.io 而注释
            // this.newestMsg = body;
         }
      },
      async manner(contentId, manner) {
         try {
            let _csrf = getCookie(document, "csrfToken");
            let uploadRslt = await superAgent
               .post("/_api/content/manner")
               .send({
                  contentId,
                  _csrf,
                  manner,
               });
            this.dealSuccess(uploadRslt);
         } catch (error) {
            this.dealError(error);
         }
      },
      onScroll() {
         //event
         // const { scrollTop } = e.target;
         // if (scrollTop > 300) {
         //    this.scrollDown = true;
         // } else {
         //    this.scrollDown = false;
         // }
      },
   },
};
</script>

<style scoped lang="scss">
#content-title {
   font-size: x-large;
}
.theme--light.v-btn.v-btn--icon {
   background-color: rgba($color: #fff, $alpha: 0.8);
}
</style>

<style lang="scss">
#content-render {
   margin-bottom: 56px;
   min-height: calc(100vh - 542px);
   img {
      max-width: 100%;
   }
}
</style>
