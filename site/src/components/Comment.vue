<template>
   <div>
      <v-progress-linear v-if="loading" buffer-value="0" color="success" reverse stream value="0"></v-progress-linear>
      <div :id="'comment-editor' + (renderId||'')"></div>
      <v-btn
         v-if="!commentId"
         style="margin:12px 0;color:#fff"
         block
         color="#02b340"
         @click="onComment"
      >回应</v-btn>
      <div v-else style="overflow:auto">
         <div style="width:20%;float:left;padding-right:8px">
            <v-btn style="margin:12px 0;" block color="gray" @click="cancelComment">取消</v-btn>
         </div>
         <div style="width:80%;float:left">
            <v-btn style="margin:12px 0;color:#fff" block color="#02b340" @click="onComment">回应</v-btn>
         </div>
      </div>
      <v-snackbar v-model="snackbar" top timeout="3000">{{ snackbarText }}</v-snackbar>
      <VerificationCode
         v-if="showVerifi"
         :verification="verification"
         :onClose="closeVerification"
      />
   </div>
</template>

<script>
import wangEditor from "wangeditor";
import superAgent from "superagent";
import xss from "xss";
import VerificationCode from "./VerificationCode";
import { getCookie } from "../utils";

export default {
   name: "Comment",

   components: {
      VerificationCode,
   },
   props: {
      contentId: {},
      commentId: {},
      onCommentOver: {
         type: Function,
      },
      cancelComment: {
         type: Function,
      },
      renderId: {},
   },
   data: () => ({
      loading: false,
      snackbar: false,
      snackbarText: "",
      showVerifi: false,
   }),
   mounted() {
      const editor = new wangEditor(`#comment-editor${this.renderId || ""}`);
      editor.config.placeholder = "回应 畅所欲言~";
      editor.config.height = 210;
      editor.config.focus = Boolean(this.renderId);
      editor.config.pasteIgnoreImg = true;
      editor.config.excludeMenus = ["video"];
      editor.config.uploadImgMaxSize = 3 * 1024 * 1024
      editor.config.customUploadImg = async (resultFiles, insertImgFn) => {
         this.loading = true;
         try {
            let _csrf = getCookie(document, "csrfToken");
            let uploadRslt = await superAgent
               .post("/_api/upload/img")
               .attach(resultFiles[0].name, resultFiles[0])
               .withCredentials()
               .query({ _csrf });
            //    .on("progress", (event) => {});

            if (uploadRslt.statusCode == 200) {
               const { filePath } = uploadRslt.body;
               for (let f of filePath) {
                  insertImgFn("/_file" + f);
               }
            } else {
               this.snack("图片上传失败");
            }
         } catch (error) {
            this.snack("图片上传失败");
         }

         this.loading = false;
      };
      editor.create();
      this.editor = editor;
   },
   beforeDestroy() {
      // 调用销毁 API 对当前编辑器实例进行销毁
      this.editor.destroy();
      this.editor = null;
   },
   methods: {
      closeVerification() {
         this.showVerifi = false;
      },
      snack(msg) {
         this.snackbar = true;
         this.snackbarText = msg;
      },
      async onComment() {
         if (this.loading) {
            this.snack("载入中，请稍候...");
            return;
         }
         let html = this.editor.txt.html();
         if (!html) {
            this.snack("写点什么吧~");
            return;
         }
         this.showVerifi = true;
      },
      dealError(error) {
         const { body } = error.response;
         if (body && body.message) {
            this.snack(body.message);
         } else {
            this.snack("网络开小差了，点击重试~");
         }
      },
      async verification(verificationData) {
         let html = this.editor.txt.html();
         const safeHtml = xss(html);
         try {
            let _csrf = getCookie(document, "csrfToken");
            await superAgent.post("/_api/comment").send({
               content: safeHtml,
               verification: verificationData,
               contentId: this.contentId,
               commentId: this.commentId,
               _csrf,
            });

            this.showVerifi = false;
            this.onCommentOver();
            this.editor.txt.clear();
         } catch (error) {
            this.dealError(error);
         }
      },
   },
};
</script>

<style lang="scss" scoped>
</style>
