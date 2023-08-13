<template>
   <v-expand-transition>
      <v-overlay z-index="99" opacity="0.44" :dark="false">
         <div class="limit-wide">
            <v-sheet
               color="#fff"
               elevation="1"
               min-height="100vh"
               width="90%"
               style="position:relative;padding:2%;left:4%"
            >
               <v-text-field v-model="title" label="标题" @keydown="titleChange" counter="32"></v-text-field>
               <v-progress-linear
                  v-if="loading"
                  buffer-value="0"
                  color="success"
                  reverse
                  stream
                  value="0"
               ></v-progress-linear>
               <div style="position:absolute;right:-2.5%;bottom:4%;z-index:9999999">
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
                           @click="onPublish"
                        >
                           <v-icon>mdi-publish</v-icon>
                        </v-btn>
                     </template>
                     <span>发布</span>
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
               <div id="editor"></div>
               <v-snackbar v-model="snackbar" top timeout="3000">{{ snackbarText }}</v-snackbar>
            </v-sheet>
         </div>

         <VerificationCode
            v-if="showVerifi"
            :verification="verification"
            :onClose="closeVerification"
         />
      </v-overlay>
   </v-expand-transition>
</template>

<script>
import wangEditor from "wangeditor";
import superAgent from "superagent";
import xss from "xss";
import VerificationCode from "./VerificationCode";
import { getCookie } from "../utils";

export default {
   name: "NewContent",
   components: {
      VerificationCode,
   },
   props: {
      showNewContent: {
         type: Function,
      },
   },
   data: () => ({
      snackbar: false,
      title: "",
      snackbarText: "",
      loading: false,
      showVerifi: false,
   }),
   mounted() {
      const editor = new wangEditor(`#editor`);
      editor.config.placeholder = "畅所欲言~";
      const windowHeight = window.innerHeight;
      editor.config.height = windowHeight - windowHeight * 0.02 - 70 - 90;
      editor.config.pasteIgnoreImg = true;
      editor.config.excludeMenus = ["video"];
      editor.config.uploadImgMaxSize = 3 * 1024 * 1024 // 图片上传最大 3M
      //自定义图片上传
      editor.config.customUploadImg = async (resultFiles, insertImgFn) => {
         this.loading = true;
         try {
            // resultFiles 是 input 中选中的文件列表
            // insertImgFn 是获取图片 url 后，插入到编辑器的方法

            //  const fileByBase64 = async (file) => {
            //     return new Promise(function (resolve) {
            //        let reader = new FileReader();
            //        reader.readAsDataURL(file);
            //        reader.onload = function (e) {
            //           resolve(e.target.result);
            //        };
            //     });
            //  };
            //  let base64 = await fileByBase64(resultFiles[0]);

            // 上传到 imgbb
            // let payload = new FormData();
            // payload.append("image", resultFiles[0]);
            //  let uploadRslt = await superAgent
            //     .post("/_imgbb/1/upload")
            //     .withCredentials()
            //     .query({
            //        key: process.env.VUE_APP_IMGBB_KEY,
            //     })
            //     .send(payload);
            // if (uploadRslt.statusCode == 200) {
            //    const { data } = uploadRslt.body;
            //    const { display_url } = data;
            //    insertImgFn(display_url);
            // } else {
            //    this.snackbar = true;
            //    this.snackbarText = "图片上传失败";
            // }

            // 上传到后端
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
               this.snackbar = true;
               this.snackbarText = "图片上传失败";
            }
         } catch (error) {
            this.snackbar = true;
            this.snackbarText = "图片上传失败";
         }

         this.loading = false;
      };
      
      // 配置 onchange 回调函数，将数据同步到 vue 中
      // editor.config.onchange = (newHtml) => {
      //    this.editorData = newHtml;
      // };

      // 创建编辑器
      editor.create();
      this.editor = editor;
   },
   methods: {
      titleChange(e) {
         let v = e.target._value;
         if (v.length > 32) {
            this.title = v.substring(0, 31);
         } else {
            this.title = v;
         }
      },
      async onPublish() {
         // 通过代码获取编辑器内容
         if (this.loading) {
            this.snackbar = true;
            this.snackbarText = "载入中，请稍候...";
            return;
         }
         let html = this.editor.txt.html();
         if (!html && !this.title) {
            this.snackbar = true;
            this.snackbarText = "标题和内容，至少得写一个吧~";
            return;
         }
         this.showVerifi = true;
      },
      async verification(verificationData) {
         let html = this.editor.txt.html();
         const safeHtml = xss(html);
         try {
            let _csrf = getCookie(document, "csrfToken");
            let publishRes = await superAgent.post("/_api/publish").send({
               title: this.title,
               content: safeHtml,
               verification: verificationData,
               _csrf,
            });
            switch (publishRes.statusCode) {
               case 204:
                  this.onClose(true);
                  break;
               case 220:
                  this.snackbar = true;
                  this.snackbarText = "输入内容再发布，哼~";
                  break;
               case 221:
                  this.snackbar = true;
                  this.snackbarText = "验证码已失效，点击图片刷新~";
                  break;
               case 222:
                  this.snackbar = true;
                  this.snackbarText = "验证码错误，请重新输入~";
                  break;
               case 223:
                  this.snackbar = true;
                  this.snackbarText = "网络开小差了，点击重试~";
                  break;
               case 224:
                  this.snackbar = true;
                  this.snackbarText = "发布频繁，冷却一下~";
                  break;
            }
         } catch (error) {
            this.snackbar = true;
            this.snackbarText = "网络开小差了，点击重试~";
         }
      },
      closeVerification() {
         this.showVerifi = false;
      },
      onClose() {
         this.showNewContent();
      },
   },
   beforeDestroy() {
      // 调用销毁 API 对当前编辑器实例进行销毁
      this.editor.destroy();
      this.editor = null;
   },
};
</script>

<style lang="scss" scoped>
.theme--light.v-btn.v-btn--icon {
   background-color: rgba($color: #fff, $alpha: 0.8);
}
.v-snack {
   z-index: 9999999 !important;
}
</style>
