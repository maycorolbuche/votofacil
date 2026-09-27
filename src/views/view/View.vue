<template>
  <main class="projection" ref="screen">
    <header class="projection-header">
      <div class="projection-brand">
        <img src="@/assets/imgs/logo.svg" alt="VotoFácil" />
      </div>
      <div class="projection-heading">
        <p class="eyebrow">{{ phaseLabel }}</p>
        <h1>{{ snapshot?.room?.name || "Sala de votação" }}</h1>
      </div>
      <div v-if="snapshot" class="room-code">
        <span>Código da sala</span><strong>{{ snapshot.room.code }}</strong>
      </div>
      <button class="screen-button" type="button" @click="toggleFullscreen">
        {{ fullscreen ? "Sair da tela cheia" : "Tela cheia" }}
      </button>
    </header>
    <div v-if="message" class="projection-message" role="status">
      <h2>{{ message.title }}</h2>
      <p>{{ message.text }}</p>
      <button
        v-if="message.retry"
        class="screen-button"
        type="button"
        @click="restart"
      >
        Tentar novamente
      </button>
      <router-link v-else :to="{ name: 'Home' }">Ir para o início</router-link>
    </div>
    <div v-else-if="!snapshot" class="projection-message" role="status">
      <h2>Preparando a projeção…</h2>
      <p>Carregando os dados da sala.</p>
    </div>
    <template v-else>
      <section class="candidate-section" aria-labelledby="candidate-title">
        <div class="section-heading">
          <div>
            <h2 id="candidate-title">
              {{ model.showResults ? "Resultado da votação" : "Candidatos" }}
            </h2>
            <p>
              {{
                model.showResults
                  ? "Apuração encerrada · votos online e lançamentos do administrador"
                  : phase === "voting"
                    ? "Votação em andamento · resultados somente após o encerramento"
                    : "Aguardando a abertura da votação"
              }}
            </p>
          </div>
          <div class="page-controls" v-if="candidatePages > 1">
            <button
              @click="turnCandidates(-1)"
              aria-label="Página anterior de candidatos"
            >
              ‹</button
            ><span>{{ candidatePage + 1 }} / {{ candidatePages }}</span
            ><button
              @click="turnCandidates(1)"
              aria-label="Próxima página de candidatos"
            >
              ›
            </button>
          </div>
        </div>
        <div v-if="!model.candidates.length" class="empty-state">
          Os candidatos aparecerão aqui conforme forem cadastrados.
        </div>
        <TransitionGroup
          v-else
          name="candidate"
          tag="div"
          class="candidate-grid"
          :style="{ '--columns': columns }"
        >
          <article
            v-for="candidate in visibleCandidates"
            :key="candidate.id"
            class="candidate-card"
            :class="{
              winner:
                model.showResults &&
                candidate.position === 1 &&
                candidate.total > 0,
            }"
          >
            <div class="candidate-number">
              {{
                model.showResults
                  ? `${candidate.position}º`
                  : String(candidate.sequence).padStart(2, "0")
              }}
            </div>
            <h3 :title="candidate.name">{{ candidate.name }}</h3>
            <div v-if="model.showResults" class="candidate-result">
              <strong>{{ candidate.total }}</strong
              ><span>{{ candidate.total === 1 ? "voto" : "votos" }}</span>
            </div>
          </article>
        </TransitionGroup>
      </section>
      <section class="voter-section" aria-labelledby="voter-title">
        <div class="section-heading">
          <h2 id="voter-title">
            Eleitores <small>{{ approvedCount }} aprovados</small>
          </h2>
          <div class="voter-summary">
            <span v-if="phase !== 'preparing'"
              >{{ completedCount }} de {{ approvedCount }} concluíram</span
            >
            <div class="page-controls" v-if="voterPages > 1">
              <button
                @click="turnVoters(-1)"
                aria-label="Página anterior de eleitores"
              >
                ‹</button
              ><span>{{ voterPage + 1 }} / {{ voterPages }}</span
              ><button
                @click="turnVoters(1)"
                aria-label="Próxima página de eleitores"
              >
                ›
              </button>
            </div>
          </div>
        </div>
        <div v-if="!model.voters.length" class="empty-state small-empty">
          Aguardando a entrada dos eleitores.
        </div>
        <div v-else class="voter-grid" :style="{ '--columns': columns }">
          <article
            v-for="voter in visibleVoters"
            :key="voter.id"
            class="voter-card"
            :class="{ complete: voter.complete, pending: !voter.approved }"
          >
            <div class="voter-name">
              <strong :title="voter.name">{{ voter.name }}</strong
              ><span v-if="voter.complete" aria-label="Concluído">✓</span>
            </div>
            <div
              class="voter-progress"
              role="progressbar"
              :aria-label="`Votação de ${voter.name}`"
              aria-valuemin="0"
              :aria-valuemax="voter.limit"
              :aria-valuenow="voter.approved ? voter.count : 0"
              :aria-valuetext="voterLabel(voter)"
            >
              <div :style="{ width: `${voter.percent}%` }"></div>
            </div>
            <div class="voter-status">
              <span>{{ voterLabel(voter) }}</span
              ><span v-if="voter.approved"
                >{{ voter.count }}/{{ voter.limit }}</span
              >
            </div>
          </article>
        </div>
      </section>
      <footer class="projection-footer">
        <span><i></i> Atualização automática</span>
        <button
          v-if="candidatePages > 1 || voterPages > 1"
          @click="autoPages = !autoPages"
        >
          {{ autoPages ? "Pausar páginas" : "Alternar páginas" }}</button
        ><span v-else>VotoFácil</span>
      </footer>
    </template>
    <p v-if="fullscreenError" class="fullscreen-error" role="status">
      {{ fullscreenError }}
    </p>
  </main>
</template>
<script>
import Api from "@/services/Api.js";
import Storage from "@/helpers/Storage.js";
import {
  observePhase,
  projectionData,
  validSnapshot,
  phaseKey,
} from "@/helpers/Projection.js";
export default {
  data: () => ({
    snapshot: null,
    phase: "preparing",
    message: null,
    timer: null,
    pageTimer: null,
    controller: null,
    generation: 0,
    candidatePage: 0,
    voterPage: 0,
    columns: 4,
    autoPages: true,
    fullscreen: false,
    fullscreenError: "",
  }),
  computed: {
    model() {
      return this.snapshot
        ? projectionData(this.snapshot, this.phase)
        : { candidates: [], voters: [], showResults: false };
    },
    phaseLabel() {
      return this.message
        ? "Projeção indisponível"
        : this.phase === "voting"
          ? "● Ao vivo · votação aberta"
          : this.model.showResults
            ? "Votação encerrada"
            : "Preparação";
    },
    pageSize() {
      return this.columns * 2;
    },
    candidatePages() {
      return Math.max(
        1,
        Math.ceil(this.model.candidates.length / this.pageSize),
      );
    },
    voterPages() {
      return Math.max(1, Math.ceil(this.model.voters.length / this.pageSize));
    },
    visibleCandidates() {
      return this.model.candidates.slice(
        this.candidatePage * this.pageSize,
        (this.candidatePage + 1) * this.pageSize,
      );
    },
    visibleVoters() {
      return this.model.voters.slice(
        this.voterPage * this.pageSize,
        (this.voterPage + 1) * this.pageSize,
      );
    },
    approvedCount() {
      return this.model.voters.filter((v) => v.approved).length;
    },
    completedCount() {
      return this.model.voters.filter((v) => v.complete).length;
    },
  },
  watch: {
    "$route.params.hash"() {
      this.restart();
    },
    candidatePages(value) {
      this.candidatePage = Math.min(this.candidatePage, value - 1);
    },
    voterPages(value) {
      this.voterPage = Math.min(this.voterPage, value - 1);
    },
  },
  methods: {
    voterLabel(voter) {
      if (!voter.approved) return "Aguardando aprovação";
      if (voter.complete) return "Concluído";
      if (this.model.showResults)
        return voter.count ? "Votação parcial" : "Não votou";
      return voter.count ? "Votando" : "Aguardando";
    },
    turnCandidates(direction) {
      this.candidatePage =
        (this.candidatePage + direction + this.candidatePages) %
        this.candidatePages;
    },
    turnVoters(direction) {
      this.voterPage =
        (this.voterPage + direction + this.voterPages) % this.voterPages;
    },
    resize() {
      this.columns =
        window.innerWidth >= 1500 ? 4 : window.innerWidth >= 900 ? 3 : 2;
    },
    onFullscreen() {
      this.fullscreen = Boolean(document.fullscreenElement);
    },
    async toggleFullscreen() {
      this.fullscreenError = "";
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (this.$refs.screen.requestFullscreen)
          await this.$refs.screen.requestFullscreen();
        else
          this.fullscreenError = "Use a opção de tela cheia do seu navegador.";
      } catch {
        this.fullscreenError =
          "Não foi possível abrir tela cheia. Use a opção do navegador.";
      }
    },
    onStorage(event) {
      if (
        event.key === null ||
        event.key === "admin-token" ||
        (this.snapshot && event.key === phaseKey(this.snapshot.room.id))
      )
        this.restart();
    },
    onVisibility() {
      if (document.hidden) this.stop();
      else this.restart();
    },
    stop() {
      this.generation++;
      clearTimeout(this.timer);
      this.controller?.abort();
      this.controller = null;
    },
    restart() {
      this.stop();
      this.snapshot = null; // Never retain a result after a session/link change.
      this.phase = "preparing";
      this.message = null;
      this.candidatePage = 0;
      this.voterPage = 0;
      this.load();
    },
    async load() {
      const generation = this.generation;
      const token = Storage.get("admin-token", "");
      if (!token) {
        this.snapshot = null;
        this.message = {
          title: "Abra a projeção no navegador do administrador",
          text: "Nesta versão, use a aba Projetar no mesmo navegador em que a sala foi criada e exiba essa janela na TV ou no telão.",
        };
        return;
      }
      const controller = new AbortController();
      this.controller = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);
      let retry = true;
      try {
        const response = await fetch(
          `${Api.url().replace(/\/$/, "")}/admin/sync`,
          {
            headers: {
              Authorization: `admin=${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
            cache: "no-store",
          },
        );
        if (!response.ok) throw new Error("sync");
        const data = await response.json();
        if (
          generation !== this.generation ||
          token !== Storage.get("admin-token", "")
        )
          return;
        if (data.error || !validSnapshot(data)) throw new Error("snapshot");
        if (!data.view?.hash || data.view.hash !== this.$route.params.hash) {
          this.snapshot = null;
          this.message = {
            title: "Link de projeção inválido ou revogado",
            text: "Abra o link atual na aba Projetar da sala que está ativa neste navegador.",
          };
          retry = false;
          return;
        }
        const nextPhase = observePhase(data, localStorage, this.phase);
        if (nextPhase !== this.phase) {
          this.candidatePage = 0;
          this.voterPage = 0;
        }
        this.phase = nextPhase;
        this.snapshot = data; // Changes within the same second matter too.
        this.message = null;
      } catch {
        if (generation !== this.generation) return;
        this.snapshot = null; // Offline screens cannot know if voting reopened.
        this.message = {
          title: "Aguardando conexão com a sala",
          text: "Os dados estão ocultos até confirmar o estado atual da votação. Tentando novamente automaticamente…",
          retry: true,
        };
      } finally {
        clearTimeout(timeout);
        if (generation === this.generation) {
          this.controller = null;
          if (retry && !document.hidden)
            this.timer = setTimeout(this.load, 3000);
        }
      }
    },
  },
  mounted() {
    this.resize();
    window.addEventListener("resize", this.resize);
    window.addEventListener("storage", this.onStorage);
    document.addEventListener("visibilitychange", this.onVisibility);
    document.addEventListener("fullscreenchange", this.onFullscreen);
    this.pageTimer = setInterval(() => {
      if (!this.autoPages || this.message || document.hidden) return;
      this.turnCandidates(1);
      this.turnVoters(1);
    }, 10000);
    this.load();
  },
  beforeUnmount() {
    this.stop();
    clearInterval(this.pageTimer);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("storage", this.onStorage);
    document.removeEventListener("visibilitychange", this.onVisibility);
    document.removeEventListener("fullscreenchange", this.onFullscreen);
  },
};
</script>
<style scoped>
.projection {
  height: 100dvh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 1.5vh, 24px);
  padding: clamp(16px, 2vw, 40px);
  background: radial-gradient(ellipse at top left, #342465, #100e20 65%);
  color: #f8f6ff;
  font-family: system-ui, sans-serif;
}
.projection-header {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}
.projection-brand {
  background: white;
  border-radius: 16px;
  padding: 12px;
}
.projection-brand img {
  width: clamp(64px, 6vw, 110px);
  height: 48px;
  object-fit: contain;
}
.projection-heading {
  flex: 1;
  min-width: 0;
}
.eyebrow {
  color: #c2b0ff;
  font-weight: 700;
  font-size: clamp(12px, 1vw, 18px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 5px;
}
h1 {
  font-size: clamp(22px, 2.5vw, 48px);
  margin: 0;
  font-weight: 750;
  overflow-wrap: anywhere;
}
.room-code {
  display: flex;
  flex-direction: column;
  text-align: right;
}
.room-code span {
  color: #c5bdd8;
  font-size: 13px;
}
.room-code strong {
  font-size: clamp(22px, 2vw, 36px);
  letter-spacing: 0.12em;
}
button,
a {
  color: inherit;
}
button {
  cursor: pointer;
}
.screen-button,
.page-controls button,
.projection-footer button {
  border: 1px solid #74658e;
  border-radius: 9px;
  background: #ffffff0c;
  color: #f8f6ff;
  padding: 8px 12px;
  font-size: 13px;
}
button:hover {
  background: #ffffff20;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #c5b4ff;
  outline-offset: 3px;
}
.candidate-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  gap: 14px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h2 {
  font-size: clamp(18px, 1.6vw, 30px);
  font-weight: 700;
  margin: 0;
}
.section-heading p {
  color: #c5bdd8;
  margin: 4px 0 0;
  font-size: clamp(12px, 1vw, 18px);
}
.page-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  color: #d5cce9;
  font-size: 13px;
}
.page-controls button {
  font-size: 22px;
  padding: 0 12px;
}
.candidate-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  grid-auto-rows: 1fr;
  align-content: stretch;
  gap: clamp(10px, 1vw, 20px);
}
.candidate-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  padding: clamp(14px, 1.8vw, 32px);
  border: 1px solid #76649380;
  border-radius: 20px;
  background: linear-gradient(125deg, #352849, #251c39);
  min-width: 0;
}
.candidate-number {
  color: #cabbec;
  background: #ffffff0e;
  border-radius: 8px;
  padding: 3px 9px;
  font-size: clamp(13px, 1.2vw, 22px);
  font-weight: 700;
}
.candidate-card h3 {
  margin: 0;
  font-size: clamp(19px, 2vw, 38px);
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.candidate-result {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.candidate-result strong {
  font-size: clamp(28px, 3vw, 58px);
  line-height: 1;
}
.candidate-result span {
  font-size: clamp(14px, 1.2vw, 22px);
  color: #d5cce9;
}
.candidate-card.winner {
  border-color: #efd184;
  background: linear-gradient(125deg, #554129, #312331);
}
.winner .candidate-number {
  color: #ffe5a6;
}
.voter-section {
  padding-top: 16px;
  border-top: 1px solid #ffffff20;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}
.voter-section h2 {
  font-size: clamp(16px, 1.25vw, 24px);
}
.voter-section small {
  color: #bcb2cf;
  font-size: 13px;
  margin-left: 10px;
  font-weight: 400;
}
.voter-summary {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 13px;
  color: #c5bdd8;
}
.voter-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: 10px;
}
.voter-card {
  min-width: 0;
  border: 1px solid #5e516f;
  border-radius: 12px;
  padding: 10px 14px;
  background: #ffffff06;
  transition:
    background 0.4s,
    border-color 0.4s;
}
.voter-card.complete {
  border-color: #51c9a0;
  background: #14624d;
}
.voter-card.pending {
  border-style: dashed;
  color: #c5bdd8;
}
.voter-name {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: clamp(14px, 1.05vw, 20px);
}
.voter-name strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.voter-progress {
  height: 6px;
  background: #ffffff1c;
  border-radius: 8px;
  overflow: hidden;
  margin: 8px 0 5px;
}
.voter-progress > div {
  height: 100%;
  background: #b29bfa;
  border-radius: inherit;
  transition: width 0.6s;
}
.complete .voter-progress > div {
  background: #86f4c9;
}
.voter-status {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #d6cce7;
  font-size: 12px;
}
.complete .voter-status {
  color: #d8fff1;
}
.projection-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #b6a9ce;
  font-size: 12px;
  flex-shrink: 0;
}
.projection-footer button {
  font-size: 12px;
  padding: 3px 8px;
}
.projection-footer i {
  display: inline-block;
  height: 7px;
  width: 7px;
  background: #65d7af;
  border-radius: 50%;
  margin-right: 5px;
}
.empty-state,
.projection-message {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #d5cce9;
  padding: 30px;
  gap: 12px;
}
.small-empty {
  padding: 20px;
}
.projection-message p {
  max-width: 700px;
}
.fullscreen-error {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 400px;
  background: #342447;
  color: white;
  padding: 15px;
  border-radius: 10px;
}
.candidate-enter-active,
.candidate-move {
  transition:
    opacity 0.4s,
    transform 0.4s;
}
.candidate-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
@media (max-width: 700px) {
  .projection-header {
    gap: 10px;
    flex-wrap: wrap;
  }
  .projection-brand {
    display: none;
  }
  .room-code {
    margin-left: auto;
  }
  .screen-button {
    padding: 6px;
  }
  .candidate-section {
    min-height: 340px;
  }
  .voter-summary {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .candidate-card {
    border-radius: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
  }
}
</style>
