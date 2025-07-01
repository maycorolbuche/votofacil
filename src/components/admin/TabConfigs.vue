<template>
  <BTab title="Configurações" class="py-0">
    <div class="overflow overflow-auto d-flex flex-column" style="flex: 1">
      <BForm
        v-for="(group, group_key) in configs"
        :key="group_key"
        class="py-3"
      >
        <h2 style="color: #888">{{ group.title }}</h2>
        <div
          class="d-flex align-items-center"
          v-for="(config, config_key) in group.items"
          :key="config_key"
        >
          <label
            class="col-form-label col-lg-3 m-0 py-2 pe-1"
            for="inline-form-custom-select-pref"
          >
            {{ config.title }}
          </label>
          <div class="d-flex align-items-center" style="flex: auto">
            <BFormCheckbox
              v-if="config.type == 'boolean'"
              v-model="config.value"
              switch
              @focus="lock = true"
              @blur="lock = false"
              @change="save_config(group_key, config_key, config.value)"
            />
            <BFormInput
              v-else-if="config.type == 'integer'"
              v-model="config.value"
              type="number"
              class="p-0"
              style="max-width: 150px"
              @focus="lock = true"
              @blur="lock = false"
              @change="save_config(group_key, config_key, config.value)"
            />
            <BFormRadio
              v-else-if="config.type == 'options'"
              v-model="config.value"
              v-for="(opt, opt_key) in config.options"
              :key="opt_key"
              class="p-0"
              @focus="lock = true"
              @blur="lock = false"
              @change="save_config(group_key, config_key, config.value)"
              :value="opt_key"
            >
              {{ opt }}
            </BFormRadio>
            <BFormInput
              v-else
              v-model="config.value"
              class="p-0"
              @focus="lock = true"
              @blur="lock = false"
              @change="save_config(group_key, config_key, config.value)"
            />
          </div>
        </div>
      </BForm>
    </div>
  </BTab>
</template>

<script>
import Api from "@/services/Api.js";
import Swal from "sweetalert2";

export default {
  props: {
    data: Object,
  },
  data: () => ({
    configs: [],
    lock: false,
  }),
  watch: {
    data: {
      handler(newVal) {
        if (!this.lock) {
          this.set_configs();
        }
      },
      deep: true,
    },
  },
  methods: {
    async save_config(group_key, config_key, value) {
      this.lock = true;

      let self = this;
      await Api.post(
        "/admin/config",
        { key: `${group_key}.${config_key}`, value },
        function (status, data) {
          self.lock = false;

          console.log(status, data);

          if (!status) {
            Swal.fire({ title: data, icon: "error" });
            return;
          }

          self.$emit("save");
        }
      );
    },
    set_configs() {
      this.configs = this.data?.configs ?? [];
    },
  },
  mounted() {
    this.set_configs();
  },
};
</script>

<style>
.form-check {
  display: flex;
  align-items: center;
  margin-left: 20px;
}
.form-check label {
  margin: 0;
  margin-left: 10px;
  padding: 0;
}
</style>
