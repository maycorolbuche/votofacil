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
        style="flex: auto"
      >
        <div>
          <BBadge class="text-truncate w-100"> Votos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div
              v-if="data?.resume?.admin_votes && data?.resume?.user_votes"
              class="d-flex align-items-center mx-1 px-1 border-end"
              style="gap: 5px"
            >
              <TicketAccountIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.admin_votes }}
              </BCardTitle>
            </div>
            <div
              v-if="data?.resume?.admin_votes && data?.resume?.user_votes"
              class="d-flex align-items-center mx-1 px-1 border-end"
              style="gap: 5px"
            >
              <VoteIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.user_votes }}
              </BCardTitle>
            </div>
            <div class="d-flex align-items-center mx-1 px-1" style="gap: 5px">
              <BallotOutline color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_votes }}
              </BCardTitle>
            </div>
          </div>
        </div>
        <div class="border-start ms-1 ps-1">
          <BBadge class="text-truncate w-100"> Candidatos </BBadge>
          <div class="d-flex align-items-center justify-content-center">
            <div class="d-flex align-items-center mx-1 px-1" style="gap: 5px">
              <CardAccountDetailsIcon color="#777" :size="28" />
              <BCardTitle class="text-truncate m-0 text-center">
                {{ data?.resume?.total_candidates }}
              </BCardTitle>
            </div>
          </div>
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
import TicketAccountIcon from "@/components/icons/TicketAccount.vue";
import VoteIcon from "@/components/icons/Vote.vue";
import BallotOutlineIcon from "@/components/icons/BallotOutline.vue";
import CardAccountDetailsIcon from "@/components/icons/CardAccountDetails.vue";

export default {
  components: {
    WebIcon,
    WebCheckIcon,
    WebSyncIcon,
    TicketAccountIcon,
    VoteIcon,
    BallotOutlineIcon,
    CardAccountDetailsIcon,
  },
  props: {
    data: Object,
    lock: Boolean,
  },
};
</script>
