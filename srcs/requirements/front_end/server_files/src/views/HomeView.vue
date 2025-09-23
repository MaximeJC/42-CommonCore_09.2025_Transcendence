<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';

// Components
import { USER_MANAGEMENT_URL } from '../config.js';
import Head from '../components/Header/Header.vue';
import home from './disconnected_home_view.vue';
import con_home_view from './connected_home_view.vue';
import setting from './setting_view.vue';
import play_page from '../components/playable_page/play_page.vue';

// User
import { user } from '../user';
import type { User } from '../user';
const { setUser } = user();

// Props
const props = defineProps<{
  setLanguage: (lang: string) => void;
}>();

// State
const isConnect = ref(false);
const issetting = ref(false);
const showSignup = ref(false);
const Signup = ref(false);
const setting_activePage = ref('');
const showConnection = ref(false);
const show_play = ref(false);
const isPlayActive = ref(false);
const settingBox = ref<HTMLElement | null>(null);

// ------------------------------
// Méthodes
// ------------------------------

// HASH
type View = 'home' | 'connexion' | 'profil' | 'settings' | 'play';

/** Retourne la vue courante à partir du hash (#/profil, #/settings, …) */
function getViewFromHash(): View {
  const h = (window.location.hash || '').replace(/^#/, '');
  const path = h.startsWith('/') ? h : '/' + h;
  switch (path) {
    case '/connexion': return 'connexion';
    case '/profil':    return 'profil';
    case '/settings':  return 'settings';
    case '/play':      return 'play';
    case '/':
    case '':
    default:           return 'home';
  }
}

/** Met à jour le hash (ceci crée une entrée d’historique → bouton Retour OK) */
function navigateTo(view: View) {
  const target =
    view === 'home'      ? '/':
    view === 'connexion' ? '/connexion':
    view === 'profil'    ? '/profil':
    view === 'settings'  ? '/settings':
    /* view === 'play'  */ '/play';

  // évite la navigation inutile
  const current = getViewFromHash();
  if (current !== view) {
    window.location.hash = target.startsWith('/') ? target : '/' + target;
  }
}

/** Applique la vue (hash) → flags (tes v-show) */
function applyHashToFlags() {
  const view = getViewFromHash();

  if (view === 'connexion' || view === 'home') {
    isConnect.value = false;
    issetting.value = false;
    show_play.value = false;
  } else if (view === 'profil') {
    isConnect.value = true;
    issetting.value = false;
    show_play.value = false;
  } else if (view === 'settings') {
    isConnect.value = true;
    issetting.value = true;
    show_play.value = false;
	handleShowPage("profil")
  } else if (view === 'play') {
    isConnect.value = true;
    issetting.value = false;
    show_play.value = true;
  }
}

/** Applique flags → vue (hash) quand tu toggles via tes boutons */
function syncFlagsToHash() {
  if (!isConnect.value) {
    navigateTo('connexion');
    return;
  }
  if (issetting.value) {
    navigateTo('settings');
  } else if (show_play.value) {
    navigateTo('play');
  } else {
    navigateTo('profil');
  }
}

const checksession = async function session() {
  try {
    const response = await fetch(`${USER_MANAGEMENT_URL}/me`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();
    if (data.user?.login) {
      isConnect.value = true;
      setUser(data.user as User);
      // si l'utilisateur est connecté mais l'URL n'est pas cohérente, redirige vers /#/profil
      if (!['profil', 'settings', 'play'].includes(getViewFromHash())) {
        navigateTo('profil');
      } else {
        applyHashToFlags();
      }
    } else {
      isConnect.value = false;
      if (!['home', 'connexion'].includes(getViewFromHash())) {
        navigateTo('connexion');
      } else {
        applyHashToFlags();
      }
    }
  } catch (err) {
    console.error('Erreur de session:', err);
  }
};

const isSignup = () => {
  if (isConnect.value != true)
	Signup.value = !Signup.value;
  else
	toggleisconnected();

};

const handleShowPage = (pageName: string) => {
  // garde ton fonctionnement actuel
  setting_activePage.value = pageName;
  issetting.value = !!setting_activePage.value;
  // synchro URL
  syncFlagsToHash();
};

const toggleisconnected = () => {
  isConnect.value = !isConnect.value;
  // quand on (dé)connecte, ajuste l’URL
  syncFlagsToHash();
};

const toggleissettnig = () => {
  issetting.value = !issetting.value;
  if (issetting.value) show_play.value = false;
  syncFlagsToHash();
};

const toggleshow_play = () => {
  show_play.value = !show_play.value;
  if (show_play.value) issetting.value = false;
  syncFlagsToHash();
};

const toggleisPlayActive = () => {
  isPlayActive.value = !isPlayActive.value;
};

const handlePointerDownOutside = (e: PointerEvent) => {
  const target = e.target as Node;
  if (settingBox.value && !settingBox.value.contains(target)) {
    if (issetting.value) {
      issetting.value = false;
      // si on ferme le panneau via clic extérieur, retourne vers /#/profil
      syncFlagsToHash();
    }
  }
};

// Watchers & Lifecycle
const anyOpen = computed(() => issetting.value);
watch(anyOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      document.addEventListener('pointerdown', handlePointerDownOutside, { capture: true });
    });
  } else {
    document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true });
  }
});

onMounted(() => {
  // 1) Applique la vue au montage (si pas de hash, on laisse la logique de checksession décider)
  applyHashToFlags();

  // 2) Écoute des retours/avances navigateur (hashchange)
  window.addEventListener('hashchange', applyHashToFlags);

  // 3) Vérifie la session (ajuste aussi l’URL si besoin)
  checksession();
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true });
  window.removeEventListener('hashchange', applyHashToFlags);
});
</script>


<template>
	<div>
		<div>
			<Head :setLanguage="props.setLanguage" @show-form="isSignup" @show-setting="toggleissettnig" @show_setting="handleShowPage" :isConnect="isConnect"></Head>
		</div>
		<div>
			<div v-show="!isConnect && !issetting" title="home_disconnect" class="home_disconnect" >
				<home :setLanguage="props.setLanguage" :isConnect="isConnect" :Signup="Signup" @isconnected="toggleisconnected"></home>
			</div>
			<div v-if="isConnect && (!issetting && !show_play)" title="home_connect" class="home_connect" >
				<div>
					<con_home_view :isConnect="isConnect" @show_play="toggleshow_play" :setLanguage="props.setLanguage" ></con_home_view>
				</div>
			</div>
			<div class="home_connect" >
				<div ref="settingBox">
					<setting v-show="isConnect && issetting" :setLanguage="props.setLanguage" :setting_activePage="setting_activePage"></setting>
				</div>
			</div>
			<div class="home_connect" >
				<div v-if="isConnect && show_play">
					<play_page :setLanguage="props.setLanguage" @isPlayActive="toggleisPlayActive" :show_play="show_play"  @show_play="toggleshow_play"></play_page>
				</div>
			</div>
		</div>
	</div>
</template>		

<style>

	.home_disconnect{
		display: flex;
		justify-content: center;
		position: absolute;
		top: 250%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.home_connect{
		display: flex;
		justify-content: center;
	}
</style>http://localhost:5173/#/profil