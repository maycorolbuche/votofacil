<template>
  <div>
    <BCard
      no-body
      class="m-2 p-2 d-flex align-items-center flex-nowrap flex-row"
    >
      <div class="overflow-auto">
        <BCardText class="text-truncate m-0 small">Código da Sala:</BCardText>
        <BCardTitle class="text-truncate m-0">
          {{ data?.room?.code }}
        </BCardTitle>
      </div>
      <div
        class="overflow-auto d-flex align-items-center justify-content-center"
        style="flex: auto; gap: 10px"
      >
        <div>
          <BBadge class="text-truncate w-100"> Votos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div>
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.admin_votes }}
              </BCardTitle>
            </div>
            <div class="border-start ms-2 ps-2">
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.user_votes }}
              </BCardTitle>
            </div>
            <div class="border-start ms-2 ps-2">
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_votes }}
              </BCardTitle>
            </div>
          </div>
        </div>
        <div>
          <BCardText class="text-truncate m-0 small text-center">
            Votos Usuários:
          </BCardText>
          <BCardTitle class="text-truncate m-0 text-center">
            {{ data?.resume?.user_votes }}
          </BCardTitle>
        </div>
        <div>
          <BCardText class="text-truncate m-0 small text-center">
            Votos:
          </BCardText>
          <BCardTitle class="text-truncate m-0 text-center">
            {{ data?.resume?.total_votes }}
          </BCardTitle>
        </div>
      </div>
      <div>
        <WebIcon v-if="!lock && data?.cache" />
        <WebCheckIcon v-else-if="!lock" />
        <WebSyncIcon v-else />
      </div>
    </BCard>
  </div>
</template>

<script>
import WebIcon from "@/components/icons/Web.vue";
import WebCheckIcon from "@/components/icons/WebCheck.vue";
import WebSyncIcon from "@/components/icons/WebSync.vue";

export default {
  components: {
    WebIcon,
    WebCheckIcon,
    WebSyncIcon,
  },
  props: {
    data: Object,
    lock: Boolean,
  },
};
</script>
