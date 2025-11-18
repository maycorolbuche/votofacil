<template>
  <BTab title="Projetar" class="py-0">
    <div class="overflow overflow-auto d-flex flex-column" style="flex: 1">
      <BForm class="py-3">
        <h2 style="color: #888">Tela de Projeção</h2>
        <div>
          Link para projeção, para que os usuários acompanhem a votação em tempo
          real.
        </div>

        <div
          v-if="data?.view?.hash"
          class="py-2 d-flex align-items-center"
          style="gap: 10px"
        >
          <router-link
            class="text-truncate flex-auto"
            :to="{ name: 'View', params: { hash: data.view.hash } }"
            target="_blank"
          >
            {{ url }}
          </router-link>
          <div>
            <BLink @click="copy_url()" class="mx-1">
              <ContentCopyIcon :size="20" />
            </BLink>
            <BLink
              :disabled="generate_link_loading"
              @click="generate_link_confirm()"
              class="mx-1"
            >
              <RefreshIcon
                v-if="!generate_link_loading"
                :size="20"
                color="var(--bs-warning)"
              />
              <BSpinner v-else small class="mx-1" variant="warning" />
            </BLink>
            <BLink
              :disabled="remove_link_loading"
              @click="remove_link()"
              class="mx-1"
            >
              <TrashCanOutlineIcon
                v-if="!remove_link_loading"
                :size="20"
                color="var(--bs-danger)"
              />
              <BSpinner v-else small class="mx-1" variant="danger" />
            </BLink>
          </div>
        </div>
        <BCardText class="m-0" v-else>
          <div class="d-flex align-items-center">
            <div style="flex: 1"></div>
            <div class="ps-2 d-flex align-items-center" style="gap: 5px">
              <BButton
                :disabled="generate_link_loading"
                class="w-100 my-2"
                variant="info"
                @click="generate_link()"
              >
                <LinkPlusIcon v-if="!generate_link_loading" :size="20" />
                <BSpinner v-else small class="mx-1" />
                Gerar Link
              </BButton>
            </div>
          </div>
        </BCardText>
      </BForm>
    </div>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";
import Swal from "sweetalert2";

import LinkPlusIcon from "@/components/icons/LinkPlus.vue";
import TrashCanOutlineIcon from "@/components/icons/TrashCanOutline.vue";
import ContentCopyIcon from "@/components/icons/ContentCopy.vue";
import RefreshIcon from "@/components/icons/Refresh.vue";

export default {
  components: {
    LinkPlusIcon,
    TrashCanOutlineIcon,
    ContentCopyIcon,
    RefreshIcon,
  },
  props: {
    data: Object,
  },
  data: () => ({
    generate_link_loading: false,
    remove_link_loading: false,
    processing: 0,
  }),
  computed: {
    url() {
      if (!this.data?.view?.hash) return "";

      const route = this.$router.resolve({
        name: "View",
        params: { hash: this.data.view.hash },
      });

      return window.location.origin + route.href;
    },
  },
  watch: {
    data: {
      handler(newVal) {
        if (this.processing == 0) {
          this.generate_link_loading = false;
          this.remove_link_loading = false;
        }
      },
      deep: true,
    },
  },
  methods: {
    async generate_link_confirm() {
      Swal.fire({
        title: "Deseja gerar um novo link?",
        text: "O link antigo será revogado.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.generate_link();
        }
      });
    },
    async generate_link() {
      if (this.generate_link_loading == true) return;

      this.generate_link_loading = true;
      this.processing++;

      let self = this;
      await Api.post("/admin/view", {}, function (status, data) {
        self.processing--;
        console.log(status, data);

        if (!status) {
          Swal.fire({ title: data, icon: "error" });
          self.generate_link_loading = false;
          return;
        }

        self.$emit("save");
      });
    },
    async remove_link() {
      if (this.remove_link_loading == true) return;

      Swal.fire({
        title: "Deseja revogar este link?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          this.remove_link_loading = true;
          this.processing++;

          let self = this;
          Api.delete("/admin/view", {}, function (status, data) {
            self.processing--;
            console.log(status, data);

            if (!status) {
              Swal.fire({ title: data, icon: "error" });
              self.remove_link_loading = false;
              return;
            }

            self.$emit("save");
          });
        }
      });
    },
    async copy_url() {
      if (!this.url) return;

      try {
        await navigator.clipboard.writeText(this.url);

        Swal.fire({
          title: "URL copiada!",
          text: this.url,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (e) {
        try {
          const textarea = document.createElement("textarea");
          textarea.value = this.url;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(textarea);

          if (ok) {
            Swal.fire({
              title: "URL copiada!",
              text: this.url,
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error("execCommand falhou");
          }
        } catch (err2) {
          Swal.fire({
            title: "Erro ao copiar",
            text: "Não foi possível copiar a URL.",
            icon: "error",
          });
        }
      }
    },
  },
};
</script>
