<template>
  <div>
    <BCard
      no-body
      class="m-3 p-2 d-flex align-items-center flex-nowrap flex-row"
    >
      <div class="mx-2">
        <BSpinner small v-if="this.modal_room_name.loading" />
        <BLink v-else @click="modal_room_name.show = !modal_room_name.show">
          <svg
            style="width: 20px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <title>pencil</title>
            <path
              d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
            />
          </svg>
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
            <svg
              style="width: 24px"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <title>menu</title>
              <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
            </svg>
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

export default {
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
