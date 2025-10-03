<template>
  <div>
    <BCard
      no-body
      class="m-2 p-2 d-flex align-items-center flex-nowrap flex-row"
    >
      <div class="mx-2">
        <BSpinner small v-if="this.modal_room_name.loading" />
        <BLink v-else @click="modal_room_name.show = !modal_room_name.show">
          <PencilIcon :size="20" />
        </BLink>
      </div>
      <div class="overflow-auto" style="flex: auto">
        <BCardTitle v-if="data?.room?.name" class="m-0 text-truncate">
          {{ data?.room?.name }}
        </BCardTitle>
        <BCardTitle v-else class="m-0 text-muted text-truncate">
          Sala sem nome
        </BCardTitle>
      </div>
      <div class="mx-2">
        <BButton
          :disabled="change_status_loading"
          size="sm"
          class="w-100"
          :variant="data?.room?.status == 'closed' ? 'warning' : 'danger'"
          @click="change_status_dialog()"
        >
          <BSpinner v-if="change_status_loading" small class="mx-1" />
          <span v-else>
            {{
              data?.room?.status == "closed"
                ? "Abrir Votação"
                : "Fechar Votação"
            }}
          </span>
        </BButton>
      </div>
      <div class="mx-2">
        <BDropdown
          size="lg"
          variant="link"
          toggle-class="text-decoration-none"
          no-caret
        >
          <template #button-content>
            <MenuIcon :size="24" />
          </template>
          <BDropdownItem href="#">Action</BDropdownItem>
          <BDropdownItem href="#">Another action</BDropdownItem>
          <BDropdownItem href="#">Something else here...</BDropdownItem>
        </BDropdown>
      </div>
    </BCard>

    <BModal
      v-model="modal_room_name.show"
      title="Nome da Sala"
      @show="edit_room_name"
      @ok="save_room_name"
      cancel-title="Cancelar"
      ok-title="Confirmar"
    >
      <BFormInput
        placeholder="Digite o nome da sala..."
        v-model="modal_room_name.name"
      />
    </BModal>
  </div>
</template>

<script>
import Api from "@/services/Api.js";
import Swal from "sweetalert2";

import MenuIcon from "@/components/icons/Menu.vue";
import PencilIcon from "@/components/icons/Pencil.vue";

export default {
  components: {
    MenuIcon,
    PencilIcon,
  },
  props: {
    data: Object,
  },
  data: () => ({
    modal_room_name: {
      show: false,
      name: null,
      loading: false,
    },
    change_status_loading: false,
  }),
  methods: {
    edit_room_name() {
      this.modal_room_name.name = this.data.room.name;
    },
    async save_room_name() {
      this.modal_room_name.loading = true;
      let self = this;
      await Api.patch(
        "/admin/room",
        { name: this.modal_room_name.name },
        function (status, data) {
          self.modal_room_name.loading = false;
          self.data.room.name = self.modal_room_name.name;

          if (!status) {
            Swal.fire({
              title: data,
              icon: "error",
            });
          }
          self.$emit("save");
        }
      );
    },
    async change_status_dialog() {
      if (
        this.data?.room?.status !== "open" &&
        this.data?.resume?.total_votes > 0
      ) {
        Swal.fire({
          title: "Atenção",
          text: 'Existem votos registrados, que podem ser limpos na aba "Candidatos", botão "Limpar Votos". Deseja abrir a votação mesmo assim?',
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then((result) => {
          if (result.isConfirmed) {
            this.change_status();
          }
        });
      } else {
        await this.change_status();
      }
    },
    async change_status() {
      this.change_status_loading = true;
      let status = this.data?.room?.status == "open" ? "closed" : "open";
      let self = this;
      await Api.patch("/admin/room", { status }, function (status, data) {
        if (status) {
          self.data.room.status = self.status;
        }
        self.change_status_loading = false;

        if (!status) {
          Swal.fire({
            title: data,
            icon: "error",
          });
        }
        self.$emit("save");
      });
    },
  },
};
</script>
