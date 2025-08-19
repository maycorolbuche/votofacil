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
  },
};
</script>
